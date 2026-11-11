import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin-guard';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const { errorResponse, adminUser } = await requireAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { userId, plan, durationDays = 30, reason = 'Admin manual grant' } = body;

    if (!userId || !plan) {
      return NextResponse.json(
        { error: 'userId and plan are required' },
        { status: 400 }
      );
    }

    const validPlans = ['free', 'starter', 'growth', 'agency', 'pro', 'enterprise'];
    if (!validPlans.includes(plan)) {
      return NextResponse.json(
        { error: `Invalid plan. Must be one of: ${validPlans.join(', ')}` },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Fetch existing profile using actual columns from profiles schema
    const { data: currentProfile, error: fetchErr } = await admin
      .from('profiles')
      .select('id, email, plan, subscription_status, subscription_renews_at')
      .eq('id', userId)
      .maybeSingle();

    if (fetchErr) {
      console.error('[grant-plan] Error fetching profile:', fetchErr);
      return NextResponse.json({ error: `Database error: ${fetchErr.message}` }, { status: 500 });
    }

    if (!currentProfile) {
      return NextResponse.json({ error: `User profile with id "${userId}" not found` }, { status: 404 });
    }

    let periodEndIso: string | null = null;
    if (plan !== 'free') {
      const days = Math.max(1, Number(durationDays) || 30);
      periodEndIso = new Date(Date.now() + days * 86400 * 1000).toISOString();
    }

    const keywordsLimit =
      plan === 'agency' || plan === 'enterprise'
        ? 500
        : plan === 'growth' || plan === 'pro'
        ? 150
        : plan === 'starter'
        ? 50
        : 10;

    const engines =
      plan === 'agency' || plan === 'enterprise' || plan === 'growth' || plan === 'pro'
        ? ['gemini', 'perplexity', 'openai', 'grok']
        : plan === 'starter'
        ? ['gemini', 'perplexity', 'openai']
        : ['gemini'];

    const runFrequency = plan === 'free' ? 'monthly' : 'weekly';

    const updates = {
      plan,
      subscription_status: plan === 'free' ? 'inactive' : 'active',
      subscription_renews_at: periodEndIso,
      plan_keywords_limit: keywordsLimit,
      plan_engines: engines,
      plan_run_frequency: runFrequency,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedProfile, error: updateErr } = await admin
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select('id, email, full_name, plan, subscription_status, subscription_renews_at, is_admin, is_banned, custom_keyword_limit, total_scans_run, created_at, last_active_at')
      .single();

    if (updateErr) {
      console.error('[grant-plan] Error updating profile:', updateErr);
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    // Record audit log safely (handle master-admin non-uuid admin_user_id)
    try {
      const isValidUuid = typeof adminUser?.id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(adminUser.id);
      await admin.from('audit_logs').insert({
        admin_user_id: isValidUuid ? adminUser.id : null,
        action: 'manual_plan_granted',
        target_type: 'profiles',
        target_id: userId,
        old_value: { plan: currentProfile.plan, renewsAt: currentProfile.subscription_renews_at },
        new_value: { plan, renewsAt: periodEndIso, reason, grantedBy: adminUser?.email || 'admin' },
      });
    } catch (auditErr) {
      console.warn('[grant-plan] Non-fatal: could not write audit log:', auditErr);
    }

    return NextResponse.json({
      success: true,
      message: `Plan successfully updated to "${plan}" for ${currentProfile.email}`,
      user: updatedProfile,
    });
  } catch (err: any) {
    console.error('[grant-plan] Unexpected exception:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
