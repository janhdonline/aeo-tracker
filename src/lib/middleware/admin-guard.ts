import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getConfig } from '@/lib/config';
import { NextRequest, NextResponse } from 'next/server';

export interface AdminUserContext {
  id: string;
  email: string;
  isAdmin: boolean;
}

/**
 * Validates that the request comes from an authenticated admin via either:
 * 1. Admin Master Password cookie (`aeo_admin_token`) or `x-admin-key` header
 * 2. Authenticated Supabase session user with is_admin = true
 */
export async function requireAdmin(
  request: NextRequest
): Promise<{ errorResponse: NextResponse | null; adminUser: AdminUserContext | null }> {
  try {
    const masterPassword = (await getConfig('admin_master_password')) || 'Admin@2026!';

    // 1. Check Master Admin Token from cookie or header
    const cookieToken = request.cookies.get('aeo_admin_token')?.value;
    const headerKey = request.headers.get('x-admin-key');

    if (headerKey && headerKey.trim() === masterPassword.trim()) {
      return {
        errorResponse: null,
        adminUser: { id: 'master-admin', email: 'admin@system.local', isAdmin: true },
      };
    }

    if (cookieToken) {
      try {
        const decoded = Buffer.from(cookieToken, 'base64').toString('utf8');
        if (decoded.endsWith(`:${masterPassword}`)) {
          return {
            errorResponse: null,
            adminUser: { id: 'master-admin', email: 'admin@system.local', isAdmin: true },
          };
        }
      } catch {
        // Invalid token, fall through to session check
      }
    }

    // 2. Check Supabase session with is_admin = true
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        errorResponse: NextResponse.json({ error: 'Admin authentication required' }, { status: 401 }),
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
