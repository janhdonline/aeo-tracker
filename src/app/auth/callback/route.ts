import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getEnv } from '@/lib/env';

export const dynamic = 'force-dynamic';

function createHtmlRedirect(targetUrl: string, message: string = 'Redirecting...') {
  const safeTarget = targetUrl.replace(/"/g, '&quot;');
  return new Response(
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="0;url=${safeTarget}">
  <title>Redirecting...</title>
  <script>window.location.replace("${safeTarget.replace(/\\/g, '\\\\')}");</script>
</head>
<body style="font-family:sans-serif;text-align:center;padding:50px 20px;background:#f9fafb;color:#374151;">
  <p>${message}</p>
  <p><a href="${safeTarget}" style="color:#2563eb;text-decoration:underline;">Click here if you are not redirected automatically</a></p>
</body>
</html>`,
    {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}

export async function GET(request: Request) {
  let siteUrl = '';

  try {
    const requestUrl = new URL(request.url);
    const searchParams = requestUrl.searchParams;
    const code = searchParams.get('code');
    const rawNext = searchParams.get('next') ?? '/dashboard';
    const errorParam = searchParams.get('error_description') || searchParams.get('error');

    // Host detection for Cloudflare Workers / proxy environments
    const forwardedHost = request.headers.get('x-forwarded-host');
    const host = forwardedHost || request.headers.get('host') || requestUrl.host;
    const proto = request.headers.get('x-forwarded-proto') || requestUrl.protocol.replace(':', '') || 'https';
    siteUrl = `${proto}://${host}`.replace(/\/+$/, '');

    // Sanitize redirect target to prevent open redirects
    const safeNext = (rawNext.startsWith('/') && !rawNext.startsWith('//')) ? rawNext : '/dashboard';

    // Provider error (e.g. user cancelled Google sign-in)
    if (errorParam) {
      console.warn('OAuth provider returned error:', errorParam);
      const target = `${siteUrl}/login?error=${encodeURIComponent(errorParam)}`;
      try {
        return NextResponse.redirect(target, { status: 303 });
      } catch {
        return createHtmlRedirect(target, 'Authentication cancelled. Redirecting to login...');
      }
    }

    // Missing code
    if (!code) {
      const target = `${siteUrl}/login?error=${encodeURIComponent('Authentication code not provided.')}`;
      try {
        return NextResponse.redirect(target, { status: 303 });
      } catch {
        return createHtmlRedirect(target, 'Invalid authentication request. Redirecting...');
      }
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
      const target = `${siteUrl}/login?error=${encodeURIComponent('Authentication service credentials missing.')}`;
      try {
        return NextResponse.redirect(target, { status: 303 });
      } catch {
        return createHtmlRedirect(target, 'Configuration error. Redirecting...');
      }
    }

    // Prepare redirect response so cookies can be attached
    let response: NextResponse;
    try {
      response = NextResponse.redirect(`${siteUrl}${safeNext}`, { status: 303 });
    } catch {
      response = NextResponse.next();
    }

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
              response.cookies.set(name, value, {
                ...options,
                path: options?.path ?? '/',
                sameSite: options?.sameSite ?? 'lax',
                secure: proto === 'https' || siteUrl.startsWith('https://'),
              });
            } catch (cookieErr) {
              console.warn(`Could not set cookie ${name}:`, cookieErr);
            }
          });
        },
      },
    });

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.warn('Auth code exchange error:', error.message);
      const target = `${siteUrl}/login?error=${encodeURIComponent(error.message)}`;
      try {
        return NextResponse.redirect(target, { status: 303 });
      } catch {
        return createHtmlRedirect(target, 'Redirecting to login...');
      }
    }

    // Auto-backfill user profile safely without blocking the response
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
        console.warn('Profile sync non-fatal notice:', profileErr);
      }
    }

    return response;
  } catch (err: any) {
    console.error('Fatal unhandled error caught in auth callback handler:', err);
    const errMessage = err?.message || 'Authentication encountered an issue';
    const fallbackBase = (siteUrl || 'https://aeo-tracker.janhdonline.workers.dev').replace(/\/+$/, '');
    const fallbackUrl = `${fallbackBase}/login?error=${encodeURIComponent(errMessage)}`;

    try {
      return NextResponse.redirect(fallbackUrl, { status: 303 });
    } catch {
      return createHtmlRedirect(fallbackUrl, 'Redirecting to login...');
    }
  }
}
