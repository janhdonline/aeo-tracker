import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getEnv } from '@/lib/env';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  let siteUrl = '';

  try {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/dashboard';
    const errorParam = searchParams.get('error_description') || searchParams.get('error');

    // Host detection for Cloudflare / proxy environments
    const forwardedHost = request.headers.get('x-forwarded-host');
    const host = forwardedHost || request.headers.get('host');
    const proto = request.headers.get('x-forwarded-proto') || 'https';
    siteUrl = host ? `${proto}://${host}` : origin;

    if (errorParam) {
      console.error('OAuth error from provider:', errorParam);
      return NextResponse.redirect(`${siteUrl}/login?error=${encodeURIComponent(errorParam)}`);
    }

    if (!code) {
      return NextResponse.redirect(`${siteUrl}/login?error=Invalid+authentication+request`);
    }

    const supabaseUrl =
      getEnv('NEXT_PUBLIC_SUPABASE_URL') ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      '';
    const supabaseAnonKey =
      getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') ||
      getEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY') ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      '';

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.redirect(
        `${siteUrl}/login?error=${encodeURIComponent('Supabase credentials are not configured.')}`
      );
    }

    // Prepare redirect response so cookies can be set directly on it
    const response = NextResponse.redirect(`${siteUrl}${next}`);

    // Parse incoming request cookies
    const cookieHeader = request.headers.get('cookie') || '';
    const parsedCookies = cookieHeader
      .split(';')
      .map((c) => {
        const [rawName, ...rawVal] = c.trim().split('=');
        return { name: rawName, value: rawVal.join('=') };
      })
      .filter((c) => c.name);

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return parsedCookies;
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              response.cookies.set(name, value, options);
            } catch (cookieErr) {
              console.warn(`Could not set cookie ${name}:`, cookieErr);
            }
          });
        },
      },
    });

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Auth code exchange error:', error);
      return NextResponse.redirect(
        `${siteUrl}/login?error=${encodeURIComponent(error.message)}`
      );
    }

    // Auto-backfill user profile safely
    if (data?.user?.id && data?.user?.email) {
      try {
        await supabase.from('profiles').upsert(
          {
            id: data.user.id,
            email: data.user.email,
            plan: 'free',
            plan_keywords_limit: 10,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );
      } catch (profileErr) {
        console.warn('Profile creation non-fatal warning:', profileErr);
      }
    }

    return response;
  } catch (err: any) {
    console.error('Fatal unhandled error in auth callback:', err);
    const errMessage = err?.message || 'Authentication failed';
    const fallbackBase = siteUrl || 'https://aeo-tracker.janhdonline.workers.dev';
    return NextResponse.redirect(
      `${fallbackBase}/login?error=${encodeURIComponent(errMessage)}`
    );
  }
}
