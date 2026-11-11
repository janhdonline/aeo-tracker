import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin-guard';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { errorResponse } = await requireAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    const admin = createAdminClient();

    // 1. Fetch Plan Configurations
    const { data: plans, error: planError } = await admin
      .from('plan_configs')
      .select('*')
      .order('price_usd', { ascending: true });

    if (planError) throw planError;

    // 2. Fetch User Profiles to calculate live subscription revenue
    const { data: profiles, error: profileError } = await admin
      .from('profiles')
      .select('id, plan, created_at');

    if (profileError) throw profileError;

    const userList = profiles || [];
    const planCounts: Record<string, number> = {
      free: 0,
      starter: 0,
      pro: 0,
      growth: 0,
      agency: 0,
    };

    for (const u of userList) {
      const p = (u.plan || 'free').toLowerCase();
      planCounts[p] = (planCounts[p] || 0) + 1;
    }

    // 3. Compute MRR / ARR based on active plan pricing
    let mrrUsd = 0;
    const planPriceMap: Record<string, number> = {};
    for (const p of plans || []) {
      planPriceMap[p.plan_name.toLowerCase()] = Number(p.price_usd) || 0;
    }

    // Default prices fallback if needed
    if (!planPriceMap.starter) planPriceMap.starter = 49;
    if (!planPriceMap.pro) planPriceMap.pro = 79;
    if (!planPriceMap.growth) planPriceMap.growth = 149;
    if (!planPriceMap.agency) planPriceMap.agency = 299;

    for (const [tier, count] of Object.entries(planCounts)) {
      if (tier !== 'free') {
        mrrUsd += (planPriceMap[tier] || 0) * count;
      }
    }

    const arrUsd = mrrUsd * 12;
    const totalPayingUsers = (userList.length - (planCounts.free || 0));

    return NextResponse.json({
      success: true,
      plans: plans || [],
      revenue: {
        mrrUsd: Math.round(mrrUsd * 100) / 100,
        arrUsd: Math.round(arrUsd * 100) / 100,
        totalUsers: userList.length,
        totalPayingUsers: Math.max(0, totalPayingUsers),
        freeUsers: planCounts.free || 0,
        distribution: planCounts,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const { errorResponse, adminUser } = await requireAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { plan_name, price_usd, keywords_limit, projects_limit, scan_frequency, engines_allowed, features, is_active } = body;

    if (!plan_name) {
      return NextResponse.json({ error: 'plan_name is required' }, { status: 400 });
    }

    const admin = createAdminClient();
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (price_usd !== undefined) updates.price_usd = price_usd;
    if (keywords_limit !== undefined) updates.keywords_limit = Number(keywords_limit);
    if (projects_limit !== undefined) updates.projects_limit = Number(projects_limit);
    if (scan_frequency !== undefined) updates.scan_frequency = scan_frequency;
    if (engines_allowed !== undefined) updates.engines_allowed = engines_allowed;
    if (features !== undefined) updates.features = features;
    if (is_active !== undefined) updates.is_active = is_active;

    const { data: updated, error } = await admin
      .from('plan_configs')
      .update(updates)
      .eq('plan_name', plan_name.toLowerCase().trim())
      .select()
      .single();

    if (error) throw error;

    await admin.from('audit_logs').insert({
      admin_user_id: adminUser?.id === 'master-admin' ? null : adminUser?.id,
      action: 'plan_config_updated',
      target_type: 'plan_configs',
      target_id: plan_name,
      new_value: updates,
    });

    return NextResponse.json({ success: true, plan: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
