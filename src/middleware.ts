import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getEnv } from '@/lib/env';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if any Supabase session/auth cookies exist before initializing client
  const allCookies = request.cookies.getAll();
  const hasAuthCookie = allCookies.some(
    (c) => c.name.startsWith('sb-') || c.name.includes('auth-token')
  );

  // Fast-path: Unauthenticated user trying to access /dashboard -> redirect immediately without Supabase network call
  if (pathname.startsWith('/dashboard') && !hasAuthCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Fast-path: Unauthenticated user on /login -> render immediately
  if (pathname === '/login' && !hasAuthCookie) {
    return NextResponse.next();
  }

  // Only if auth cookies exist, verify session with Supabase
  let supabaseResponse = NextResponse.next({
    request,
  });

  try {
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

    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
      if (pathname.startsWith('/dashboard')) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
      }
      return supabaseResponse;
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    let user = null;
    try {
      const authRes = await supabase.auth.getUser();
      user = authRes?.data?.user || null;
    } catch {
      user = null;
    }

    // Protect dashboard routes
    if (!user && pathname.startsWith('/dashboard')) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    // Redirect logged-in users away from login
    if (user && pathname === '/login') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    supabaseResponse.headers.set(
      'Cache-Control',
      'no-cache, no-store, max-age=0, must-revalidate'
    );
    return supabaseResponse;
  } catch (err) {
    console.error('Middleware caught non-fatal error:', err);
    if (pathname.startsWith('/dashboard')) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }
}

// Only match routes that actually require auth verification to avoid burning Worker CPU budget on public pages
export const config = {
  matcher: ['/dashboard/:path*', '/dashboard', '/login'],
};
