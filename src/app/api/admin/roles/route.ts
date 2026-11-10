import { NextRequest, NextResponse } from 'next/server';
import { requireAdminRole, AdminRole } from '@/lib/middleware/admin-guard';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const { errorResponse } = await requireAdminRole(request, ['super_admin']);
  if (errorResponse) return errorResponse;

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('admin_roles')
      .select(`
        id,
        user_id,
        role,
        created_at,
        profiles (
          id,
          email,
          full_name,
          is_admin
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const formatted = (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      role: row.role,
      createdAt: row.created_at,
      email: row.profiles?.email || 'Unknown',
      fullName: row.profiles?.full_name || '',
    }));

    return NextResponse.json({
      success: true,
      roles: formatted,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { errorResponse, adminUser } = await requireAdminRole(request, ['super_admin']);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { userId, role } = body;

    const validRoles: AdminRole[] = ['super_admin', 'support_agent', 'seo_tuner'];
    if (!userId || !validRoles.includes(role)) {
      return NextResponse.json(
        { error: `userId and a valid role (${validRoles.join(', ')}) are required` },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Ensure user has is_admin = true in profiles
    await admin.from('profiles').update({ is_admin: true }).eq('id', userId);

    // Upsert role
    const { data, error } = await admin
      .from('admin_roles')
      .upsert(
        {
          user_id: userId,
          role,
          granted_by: adminUser?.id === 'master-admin' ? null : adminUser?.id,
        },
        { onConflict: 'user_id,role' }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await admin.from('audit_logs').insert({
      admin_user_id: adminUser?.id === 'master-admin' ? null : adminUser?.id,
      action: 'admin_role_assigned',
      target_type: 'admin_roles',
      target_id: userId,
      new_value: { role },
    });

    return NextResponse.json({
      success: true,
      message: `Role "${role}" successfully assigned`,
      item: data,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { errorResponse, adminUser } = await requireAdminRole(request, ['super_admin']);
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const admin = createAdminClient();
    let query = admin.from('admin_roles').delete().eq('user_id', userId);
    if (role) {
      query = query.eq('role', role);
    }

    const { error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await admin.from('audit_logs').insert({
      admin_user_id: adminUser?.id === 'master-admin' ? null : adminUser?.id,
      action: 'admin_role_revoked',
      target_type: 'admin_roles',
      target_id: userId,
      new_value: { role },
    });

    return NextResponse.json({
      success: true,
      message: 'Role revoked successfully',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
