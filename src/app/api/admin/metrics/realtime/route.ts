import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin-guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { getConfigBoolean, getConfigNumber } from '@/lib/config';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export interface RealtimeWarning {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  metricValue?: string;
  actionType: 'kill_stuck' | 'emergency_stop' | 'update_budget' | 'test_engine' | 'view_webhooks' | 'dismiss';
  actionLabel: string;
  timestamp: string;
}

export interface ModelTelemetryItem {
  model: string;
  engine: string;
  calls: number;
  tokensIn: number;
  tokensOut: number;
  totalTokens: number;
  costUsd: number;
  avgLatencyMs: number;
  sharePct: number;
  costPer1kTokens: number;
}

export interface HourlyBucket {
  hour: number;
  label: string;
  tokens: number;
  queries: number;
  costUsd: number;
}

export async function GET(request: NextRequest) {
  const { errorResponse } = await requireAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    const admin = createAdminClient();
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const startOfToday = `${todayStr}T00:00:00.000Z`;
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000).toISOString();
    const fifteenMinsAgo = new Date(now.getTime() - 15 * 60 * 1000).toISOString();
    const tenMinsAgo = new Date(now.getTime() - 10 * 60 * 1000).toISOString();

    // 1. Fetch Configuration
    const [dailyCapUsd, emergencyStop] = await Promise.all([
      getConfigNumber('daily_ai_spend_cap_usd', 25.0),
      getConfigBoolean('emergency_ai_stop', false),
    ]);

    // 2. Fetch Usage Data (Past 7 days)
    const { data: usageData, error: usageErr } = await admin
      .from('api_usage')
      .select('id, engine, model_name, tokens_in, tokens_out, latency_ms, cost_usd, created_at')
      .gte('created_at', sevenDaysAgo)
      .order('created_at', { ascending: false });

    if (usageErr) {
      console.warn('Realtime metrics usage query error:', usageErr.message);
    }

    const rows = usageData || [];

    // Filter today's rows
    const todayRows = rows.filter((r) => r.created_at >= startOfToday);
    const recent15mRows = rows.filter((r) => r.created_at >= fifteenMinsAgo);

    // 3. Aggregate Tokens & Spend
    let totalTokensInToday = 0;
    let totalTokensOutToday = 0;
    let totalCostToday = 0;
    let tokensRecent15m = 0;

    for (const r of todayRows) {
      const inTok = Number(r.tokens_in) || 0;
      const outTok = Number(r.tokens_out) || 0;
      totalTokensInToday += inTok;
      totalTokensOutToday += outTok;
      totalCostToday += Number(r.cost_usd) || 0;
    }

    for (const r of recent15mRows) {
      tokensRecent15m += (Number(r.tokens_in) || 0) + (Number(r.tokens_out) || 0);
    }

    const totalTokensToday = totalTokensInToday + totalTokensOutToday;
    const tokenVelocity = Math.round(tokensRecent15m / 15); // tokens per minute

    // Past 7 days totals
    let totalTokens7d = 0;
    let totalCost7d = 0;
    for (const r of rows) {
      totalTokens7d += (Number(r.tokens_in) || 0) + (Number(r.tokens_out) || 0);
      totalCost7d += Number(r.cost_usd) || 0;
    }

    // 4. Group by Model / Engine
    const modelMap = new Map<
      string,
      {
        model: string;
        engine: string;
        calls: number;
        tokensIn: number;
        tokensOut: number;
        costUsd: number;
        totalLatencyMs: number;
      }
    >();

    for (const r of todayRows) {
      const modelKey = r.model_name || r.engine || 'unknown';
      const existing = modelMap.get(modelKey) || {
        model: modelKey,
        engine: r.engine || 'unknown',
        calls: 0,
        tokensIn: 0,
        tokensOut: 0,
        costUsd: 0,
        totalLatencyMs: 0,
      };

      existing.calls += 1;
      existing.tokensIn += Number(r.tokens_in) || 0;
      existing.tokensOut += Number(r.tokens_out) || 0;
      existing.costUsd += Number(r.cost_usd) || 0;
      existing.totalLatencyMs += Number(r.latency_ms) || 0;

      modelMap.set(modelKey, existing);
    }

    const totalQueriesToday = todayRows.length || 1;
    const modelsTelemetry: ModelTelemetryItem[] = Array.from(modelMap.values())
      .map((m) => {
        const totalTokens = m.tokensIn + m.tokensOut;
        const avgLatencyMs = m.calls > 0 ? Math.round(m.totalLatencyMs / m.calls) : 0;
        const sharePct = Math.round((m.calls / totalQueriesToday) * 100);
        const costPer1kTokens = totalTokens > 0 ? (m.costUsd / totalTokens) * 1000 : 0;

        return {
          model: m.model,
          engine: m.engine,
          calls: m.calls,
          tokensIn: m.tokensIn,
          tokensOut: m.tokensOut,
          totalTokens,
          costUsd: Math.round(m.costUsd * 10000) / 10000,
          avgLatencyMs,
          sharePct,
          costPer1kTokens: Math.round(costPer1kTokens * 100000) / 100000,
        };
      })
      .sort((a, b) => b.totalTokens - a.totalTokens);

    // 5. Hourly Activity Buckets (0 to 23 hours today)
    const hourlyBuckets: HourlyBucket[] = Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      label: `${String(h).padStart(2, '0')}:00`,
      tokens: 0,
      queries: 0,
      costUsd: 0,
    }));

    for (const r of todayRows) {
      try {
        const h = new Date(r.created_at).getUTCHours();
        if (hourlyBuckets[h]) {
          hourlyBuckets[h].tokens += (Number(r.tokens_in) || 0) + (Number(r.tokens_out) || 0);
          hourlyBuckets[h].queries += 1;
          hourlyBuckets[h].costUsd += Number(r.cost_usd) || 0;
        }
      } catch {
        // ignore date parsing edge cases
      }
    }

    // 6. Check Active Scan Queue & Stuck Jobs
    const { data: activeRuns } = await admin
      .from('scan_runs')
      .select('id, status, started_at, total_queries')
      .in('status', ['running', 'pending', 'stuck']);

    const queueList = activeRuns || [];
    const stuckJobs = queueList.filter((r) => r.status === 'running' && r.started_at < tenMinsAgo);
    const runningJobs = queueList.filter((r) => r.status === 'running' && r.started_at >= tenMinsAgo);

    // 7. Check Engine Health & Errors
    const { data: engineHealth } = await admin
      .from('engine_health_logs')
      .select('engine_name, status, latency_ms, checked_at')
      .order('checked_at', { ascending: false })
      .limit(8);

    const { data: failedWebhooks } = await admin
      .from('webhook_events')
      .select('id')
      .eq('status', 'failed');

    const failedWebhooksCount = (failedWebhooks || []).length;

    // 8. Dynamic Real-time Warning Heuristic Engine
    const warnings: RealtimeWarning[] = [];

    // Rule A: Emergency AI Stop active
    if (emergencyStop) {
      warnings.push({
        id: 'warn-emergency-stop',
        severity: 'critical',
        title: 'Emergency AI Killswitch Active',
        message: 'All automated background scans and AI engine queries are completely blocked.',
        actionType: 'emergency_stop',
        actionLabel: 'Resume AI Engine',
        timestamp: now.toISOString(),
      });
    }

    // Rule B: Spend cap exceeded or nearing limit
    if (totalCostToday >= dailyCapUsd) {
      warnings.push({
        id: 'warn-spend-cap-exceeded',
        severity: 'critical',
        title: `Daily AI Budget Cap Exceeded ($${totalCostToday.toFixed(2)} / $${dailyCapUsd.toFixed(2)})`,
        message: 'New scan runs will be rejected to protect against unexpected cloud charges.',
        metricValue: `$${totalCostToday.toFixed(2)}`,
        actionType: 'update_budget',
        actionLabel: 'Increase Budget Cap',
        timestamp: now.toISOString(),
      });
    } else if (totalCostToday >= dailyCapUsd * 0.8) {
      warnings.push({
        id: 'warn-spend-cap-80',
        severity: 'warning',
        title: `AI Spend Approaching Cap (>80%)`,
        message: `Currently spent $${totalCostToday.toFixed(2)} out of $${dailyCapUsd.toFixed(2)} daily limit.`,
        metricValue: `${Math.round((totalCostToday / dailyCapUsd) * 100)}%`,
        actionType: 'update_budget',
        actionLabel: 'Adjust Cap',
        timestamp: now.toISOString(),
      });
    }

    // Rule C: Stuck worker scans
    if (stuckJobs.length > 0) {
      warnings.push({
        id: 'warn-stuck-jobs',
        severity: 'warning',
        title: `${stuckJobs.length} Background Worker Scan${stuckJobs.length > 1 ? 's' : ''} Hanging (>10m)`,
        message: 'Worker task appears stalled. Free up queue concurrency by cancelling stalled runs.',
        metricValue: `${stuckJobs.length} stuck`,
        actionType: 'kill_stuck',
        actionLabel: `Kill ${stuckJobs.length} Stuck Scan${stuckJobs.length > 1 ? 's' : ''}`,
        timestamp: now.toISOString(),
      });
    }

    // Rule D: High latency AI engines
    if (engineHealth && engineHealth.length > 0) {
      const slowEngine = engineHealth.find((e) => e.latency_ms > 3000);
      if (slowEngine) {
        warnings.push({
          id: `warn-slow-engine-${slowEngine.engine_name}`,
          severity: 'warning',
          title: `Degraded AI Latency: ${slowEngine.engine_name.toUpperCase()} (${slowEngine.latency_ms}ms)`,
          message: 'Roundtrip latency exceeds 3000ms. Automated fallbacks are being utilized.',
          metricValue: `${slowEngine.latency_ms}ms`,
          actionType: 'test_engine',
          actionLabel: 'Probe Health',
          timestamp: now.toISOString(),
        });
      }
    }

    // Rule E: Webhook Dead-Letter Queue
    if (failedWebhooksCount > 0) {
      warnings.push({
        id: 'warn-dlq-webhooks',
        severity: 'warning',
        title: `${failedWebhooksCount} Billing Webhook Event${failedWebhooksCount > 1 ? 's' : ''} Failed`,
        message: 'Customer subscription event was not acknowledged. Review and replay from dead-letter queue.',
        metricValue: `${failedWebhooksCount} failed`,
        actionType: 'view_webhooks',
        actionLabel: 'View Webhooks',
        timestamp: now.toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      serverTime: now.toLocaleTimeString('en-US', { hour12: false }),
      vitals: {
        dailyCapUsd,
        emergencyStop,
        spendPercent: Math.min(100, Math.round((totalCostToday / dailyCapUsd) * 100)),
        activeWorkers: runningJobs.length,
        stuckWorkers: stuckJobs.length,
      },
      tokens: {
        today: totalTokensToday,
        todayIn: totalTokensInToday,
        todayOut: totalTokensOutToday,
        velocityTokensPerMin: tokenVelocity,
        past7Days: totalTokens7d,
      },
      costs: {
        todayUsd: Math.round(totalCostToday * 1000) / 1000,
        past7DaysUsd: Math.round(totalCost7d * 1000) / 1000,
      },
      models: modelsTelemetry,
      hourly: hourlyBuckets,
      warnings,
      queue: {
        running: runningJobs.length,
        stuck: stuckJobs.length,
        activeRuns: queueList.slice(0, 10),
      },
      engineHealth: engineHealth || [],
    });
  } catch (err: any) {
    console.error('Realtime telemetry route error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch realtime telemetry' },
      { status: 500 }
    );
  }
}
