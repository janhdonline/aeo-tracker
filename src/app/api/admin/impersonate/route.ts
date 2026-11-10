import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin-guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { createImpersonationToken, verifyImpersonationToken } from '@/lib/impersonation';

export async function GET(request: NextRequest) {
  // Check active impersonation session
  const cookieVal = request.cookies.get('aeo_impersonate')?.value;
  if (!cookieVal) {
    return NextResponse.json({ active: false });
  }

  const verified = await verifyImpersonationToken(cookieVal);
  if (!verified.valid) {
    return NextResponse.json({ active: false });
  }

  return NextResponse.json({
    active: true,
    userId: verified.userId,
    email: verified.email,
  });
}

export async function POST(request: NextRequest) {
  const { errorResponse, adminUser } = await requireAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: targetProfile, error: profileError } = await admin
      .from('profiles')
      .select('id, email, full_name, plan')
      .eq('id', userId)
      .single();

    if (profileError || !targetProfile) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    const token = await createImpersonationToken(
      targetProfile.id,
      targetProfile.email || 'user@system.local'
    );

    // Audit log
    await admin.from('audit_logs').insert({
      admin_user_id: adminUser?.id === 'master-admin' ? null : adminUser?.id,
      action: 'impersonation_session_started',
      target_type: 'profiles',
      target_id: targetProfile.id,
      new_value: { email: targetProfile.email },
    });

    const response = NextResponse.json({
      success: true,
      message: `Impersonation session established for ${targetProfile.email}`,
      targetUser: targetProfile,
      redirectUrl: '/dashboard',
    });

    response.cookies.set('aeo_impersonate', token, {
      path: '/',
      httpOnly: false, // Accessible to client component to display the warning banner
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600, // 1 hour
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = createAdminClient();
    const cookieVal = request.cookies.get('aeo_impersonate')?.value;
    if (cookieVal) {
      const verified = await verifyImpersonationToken(cookieVal);
      if (verified.valid) {
        await admin.from('audit_logs').insert({
          action: 'impersonation_session_ended',
          target_type: 'profiles',
          target_id: verified.userId,
        });
      }
    }

    const response = NextResponse.json({
      success: true,
      message: 'Impersonation session ended',
      redirectUrl: '/admin',
    });

    response.cookies.set('aeo_impersonate', '', {
      path: '/',
      expires: new Date(0),
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
