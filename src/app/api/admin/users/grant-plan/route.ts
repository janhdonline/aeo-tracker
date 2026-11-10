import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin-guard';
import { createAdminClient } from '@/lib/supabase/admin';

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

    const validPlans = ['free', 'starter', 'growth', 'agency'];
    if (!validPlans.includes(plan)) {
      return NextResponse.json(
        { error: `Invalid plan. Must be one of: ${validPlans.join(', ')}` },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Fetch existing profile
    const { data: currentProfile, error: fetchErr } = await admin
      .from('profiles')
      .select('id, email, plan, plan_status, plan_period_end')
      .eq('id', userId)
      .single();

    if (fetchErr || !currentProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    let periodEndIso: string | null = null;
    if (plan !== 'free') {
      const days = Math.max(1, Number(durationDays) || 30);
      periodEndIso = new Date(Date.now() + days * 86400 * 1000).toISOString();
    }

    const { data: updatedProfile, error: updateErr } = await admin
      .from('profiles')
      .update({
        plan,
        plan_status: 'active',
        plan_period_end: periodEndIso,
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    // Record audit log
    await admin.from('audit_logs').insert({
      admin_user_id: adminUser?.id === 'master-admin' ? null : adminUser?.id,
      action: 'manual_plan_granted',
      target_type: 'profiles',
      target_id: userId,
      old_value: { plan: currentProfile.plan, periodEnd: currentProfile.plan_period_end },
      new_value: { plan, periodEnd: periodEndIso, reason, grantedBy: adminUser?.email },
    });

    return NextResponse.json({
      success: true,
      message: `Plan successfully updated to "${plan}" for ${currentProfile.email}`,
      user: updatedProfile,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
