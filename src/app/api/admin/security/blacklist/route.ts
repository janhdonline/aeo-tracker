import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin-guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { invalidateBlacklistCache } from '@/lib/security';

export async function GET(request: NextRequest) {
  const { errorResponse, adminUser } = await requireAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('ip_blacklist')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      items: data || [],
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
    const { ip_address, reason, expires_in_hours } = body;

    if (!ip_address || !reason) {
      return NextResponse.json(
        { error: 'ip_address and reason are required' },
        { status: 400 }
      );
    }

    const cleanIp = String(ip_address).trim();
    let expiresAt: string | null = null;

    if (expires_in_hours && Number(expires_in_hours) > 0) {
      expiresAt = new Date(Date.now() + Number(expires_in_hours) * 3600 * 1000).toISOString();
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from('ip_blacklist')
      .upsert(
        {
          ip_address: cleanIp,
          reason,
          blocked_by: adminUser?.email || 'admin',
          expires_at: expiresAt,
        },
        { onConflict: 'ip_address' }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    invalidateBlacklistCache();

    // Log in audit_logs
    await admin.from('audit_logs').insert({
      admin_user_id: adminUser?.id === 'master-admin' ? null : adminUser?.id,
      action: 'ip_blacklisted',
      target_type: 'ip_blacklist',
      target_id: cleanIp,
      new_value: { reason, expires_at: expiresAt },
    });

    return NextResponse.json({ success: true, item: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { errorResponse, adminUser } = await requireAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const ip = searchParams.get('ip');
    const id = searchParams.get('id');

    if (!ip && !id) {
      return NextResponse.json({ error: 'id or ip is required' }, { status: 400 });
    }

    const admin = createAdminClient();
    let query = admin.from('ip_blacklist').delete();
    if (id) {
      query = query.eq('id', id);
    } else if (ip) {
      query = query.eq('ip_address', ip);
    }

    const { error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    invalidateBlacklistCache();

    await admin.from('audit_logs').insert({
      admin_user_id: adminUser?.id === 'master-admin' ? null : adminUser?.id,
      action: 'ip_unblacklisted',
      target_type: 'ip_blacklist',
      target_id: ip || id,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
