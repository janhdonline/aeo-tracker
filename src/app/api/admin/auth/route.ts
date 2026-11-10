import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getConfig } from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json({ error: 'Admin password is required' }, { status: 400 });
    }

    const masterPassword = (await getConfig('admin_master_password')) || 'Admin@2026!';

    if (password.trim() !== masterPassword.trim()) {
      return NextResponse.json({ error: 'Incorrect admin password' }, { status: 401 });
    }

    // Password matches! Generate an admin session token
    const adminToken = Buffer.from(`admin:${Date.now()}:${masterPassword}`).toString('base64');

    const response = NextResponse.json({
      success: true,
      message: 'Admin access authorized',
    });

    // Set secure cookie
    response.cookies.set('aeo_admin_token', adminToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get('aeo_admin_token')?.value;
  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const masterPassword = (await getConfig('admin_master_password')) || 'Admin@2026!';
    if (!decoded.endsWith(`:${masterPassword}`)) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Admin logged out' });
  response.cookies.delete('aeo_admin_token');
  return response;
}
