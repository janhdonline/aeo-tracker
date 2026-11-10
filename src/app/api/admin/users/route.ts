import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin-guard';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { errorResponse } = await requireAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    const admin = createAdminClient();
    const url = new URL(request.url);
    const search = url.searchParams.get('q') || '';
    const limit = Math.min(Number(url.searchParams.get('limit') || 50), 100);
    const offset = Number(url.searchParams.get('offset') || 0);

    let query = admin
      .from('profiles')
      .select('id, email, full_name, plan, is_admin, is_banned, ban_reason, subscription_status, subscription_renews_at, custom_keyword_limit, total_scans_run, created_at, last_active_at', { count: 'exact' });

    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    const { data: users, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({ users, total: count, offset, limit });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const { errorResponse, adminUser } = await requireAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { userId, plan, is_admin, is_banned, ban_reason, custom_keyword_limit, notes } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const admin = createAdminClient();

    // Fetch existing user to snapshot old value for audit_logs
    const { data: oldProfile } = await admin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!oldProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (plan !== undefined) updates.plan = plan;
    if (is_admin !== undefined) updates.is_admin = is_admin;
    if (is_banned !== undefined) {
      updates.is_banned = is_banned;
      updates.ban_reason = is_banned ? (ban_reason || 'Banned by admin') : null;
    }
    if (custom_keyword_limit !== undefined) updates.custom_keyword_limit = custom_keyword_limit;
    if (notes !== undefined) updates.notes = notes;

    const { data: updatedProfile, error: updateError } = await admin
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Record admin audit log
    await admin.from('audit_logs').insert({
      admin_user_id: adminUser?.id,
      action: 'user_profile_updated',
      target_type: 'user',
      target_id: userId,
      old_value: oldProfile,
      new_value: updatedProfile,
    });

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
