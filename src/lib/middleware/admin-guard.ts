import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

export interface AdminUserContext {
  id: string;
  email: string;
  isAdmin: boolean;
}

/**
 * Validates that the request comes from an authenticated user with is_admin = true.
 * Returns null if authorized, or a 401/403 NextResponse if denied.
 */
export async function requireAdmin(
  request: NextRequest
): Promise<{ errorResponse: NextResponse | null; adminUser: AdminUserContext | null }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        errorResponse: NextResponse.json({ error: 'Authentication required' }, { status: 401 }),
        adminUser: null,
      };
    }

    const adminClient = createAdminClient();
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('id, email, is_admin, is_banned')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return {
        errorResponse: NextResponse.json({ error: 'Profile not found' }, { status: 404 }),
        adminUser: null,
      };
    }

    if (profile.is_banned) {
      return {
        errorResponse: NextResponse.json({ error: 'Account suspended' }, { status: 403 }),
        adminUser: null,
      };
    }

    if (!profile.is_admin) {
      // Log unauthorized attempt to audit_logs
      const ip = request.headers.get('x-forwarded-for') || request.headers.get('cf-connecting-ip') || 'unknown';
      await adminClient.from('audit_logs').insert({
        admin_user_id: user.id,
        action: 'unauthorized_admin_access_attempt',
        target_type: 'admin_api',
        target_id: request.nextUrl.pathname,
        ip_address: ip,
        new_value: { method: request.method, url: request.nextUrl.href },
      });

      return {
        errorResponse: NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 }),
        adminUser: null,
      };
    }

    return {
      errorResponse: null,
      adminUser: {
        id: profile.id,
        email: profile.email || user.email || '',
        isAdmin: true,
      },
    };
  } catch (err: any) {
    console.error('requireAdmin error:', err);
    return {
      errorResponse: NextResponse.json({ error: 'Server authentication error' }, { status: 500 }),
      adminUser: null,
    };
  }
}
