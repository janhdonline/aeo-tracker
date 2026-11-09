import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getEnv } from '@/lib/env';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip auth callback entirely to avoid interfering with OAuth code exchange
  if (pathname.startsWith('/auth/')) {
    return NextResponse.next();
  }

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

    // If Supabase credentials are missing or placeholder, protect dashboard safely without crash
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

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
