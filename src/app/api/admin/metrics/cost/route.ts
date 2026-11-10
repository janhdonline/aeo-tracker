import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin-guard';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  getConfigBoolean,
  getConfigNumber,
  setConfig,
} from '@/lib/config';
import { getTodayAiSpendUsd, invalidateSpendCache } from '@/lib/cost-guard';

export async function GET(request: NextRequest) {
  const { errorResponse } = await requireAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    const admin = createAdminClient();
    const todayStr = new Date().toISOString().split('T')[0];
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400 * 1000).toISOString();

    const [dailyCap, emergencyStop, todaySpend] = await Promise.all([
      getConfigNumber('daily_ai_spend_cap_usd', 25.0),
      getConfigBoolean('emergency_ai_stop', false),
      getTodayAiSpendUsd(),
    ]);

    // Fetch last 7 days of usage
    const { data: usageRows, error: usageError } = await admin
      .from('api_usage')
      .select('cost_usd, engine, created_at')
      .gte('created_at', sevenDaysAgo)
      .order('created_at', { ascending: true });

    if (usageError) {
      console.warn('api_usage query error:', usageError.message);
    }

    const rows = usageRows || [];

    // Engine breakdown for today
    const engineMap: Record<string, { costUsd: number; count: number }> = {};
    const historyMap: Record<string, { costUsd: number; count: number }> = {};

    // Initialize 7 days in historyMap
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400 * 1000).toISOString().split('T')[0];
      historyMap[d] = { costUsd: 0, count: 0 };
    }

    for (const row of rows) {
      const cost = Number(row.cost_usd) || 0;
      const date = row.created_at ? row.created_at.split('T')[0] : todayStr;
      const engine = row.engine || 'unknown';

      if (date === todayStr) {
        if (!engineMap[engine]) engineMap[engine] = { costUsd: 0, count: 0 };
        engineMap[engine].costUsd += cost;
        engineMap[engine].count += 1;
      }

      if (historyMap[date]) {
        historyMap[date].costUsd += cost;
        historyMap[date].count += 1;
      }
    }

    const engineBreakdown = Object.entries(engineMap).map(([engine, data]) => ({
      engine,
      costUsd: Math.round(data.costUsd * 1000) / 1000,
      count: data.count,
    }));

    const dailyHistory = Object.entries(historyMap).map(([date, data]) => ({
      date,
      costUsd: Math.round(data.costUsd * 1000) / 1000,
      count: data.count,
    }));

    return NextResponse.json({
      success: true,
      todaySpendUsd: todaySpend,
      dailyCapUsd: dailyCap,
      emergencyAiStop: emergencyStop,
      engineBreakdown,
      dailyHistory,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { errorResponse, adminUser } = await requireAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { dailyCapUsd, emergencyAiStop } = body;

    const admin = createAdminClient();

    if (dailyCapUsd !== undefined && Number(dailyCapUsd) >= 0) {
      await setConfig(
        'daily_ai_spend_cap_usd',
        Number(dailyCapUsd).toFixed(2),
        'number',
        'Maximum allowed daily USD spend across all AI engines before auto-kill switch engages'
      );

      await admin.from('audit_logs').insert({
        admin_user_id: adminUser?.id === 'master-admin' ? null : adminUser?.id,
        action: 'update_daily_spend_cap',
        target_type: 'app_config',
        target_id: 'daily_ai_spend_cap_usd',
        new_value: { dailyCapUsd },
      });
    }

    if (emergencyAiStop !== undefined) {
      const boolVal = Boolean(emergencyAiStop);
      await setConfig(
        'emergency_ai_stop',
        String(boolVal),
        'boolean',
        'Emergency manual master kill-switch to pause all outgoing LLM calls'
      );

      await admin.from('audit_logs').insert({
        admin_user_id: adminUser?.id === 'master-admin' ? null : adminUser?.id,
        action: 'toggle_emergency_ai_stop',
        target_type: 'app_config',
        target_id: 'emergency_ai_stop',
        new_value: { emergencyAiStop: boolVal },
      });
    }

    invalidateSpendCache();

    return NextResponse.json({
      success: true,
      message: 'Budget guard settings updated successfully',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
