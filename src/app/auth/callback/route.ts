import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getEnv } from '@/lib/env';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';
  const errorParam = searchParams.get('error_description') || searchParams.get('error');

  if (errorParam) {
    console.error('OAuth error from provider:', errorParam);
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorParam)}`);
  }

  if (code) {
    const cookieStore = await cookies();
    const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL') || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent('Supabase credentials are not configured.')}`
      );
    }

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignore in route handler context if already committed
            }
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data?.session) {
      // Ensure user profile exists
      try {
        if (data.user?.id && data.user?.email) {
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
        }
      } catch (profileErr) {
        console.warn('Profile creation during OAuth callback non-fatal warning:', profileErr);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error('Auth code exchange error:', error);
    const errorMsg = error?.message || 'Could not exchange authentication code';
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorMsg)}`);
  }

  return NextResponse.redirect(`${origin}/login?error=Invalid+authentication+request`);
}
