export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a safe mock client for build-time prerendering & when env keys are missing
    const noop = () => ({ data: null, error: null });
    const missingKeyError = {
      message:
        'Supabase key is missing. Please add NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local to enable authentication.',
    };

    const mockAuth = {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithPassword: async () => ({ data: null, error: missingKeyError }),
      signUp: async () => ({ data: null, error: missingKeyError }),
      signInWithOAuth: async () => ({ data: null, error: missingKeyError }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
    };

    const mockFrom = () => ({
      select: () => ({
        eq: () => ({
          single: noop,
          order: () => ({ limit: () => ({ single: noop }) }),
        }),
        data: null,
        error: null,
      }),
      insert: () => ({ select: () => ({ single: noop }) }),
      update: () => ({ eq: noop }),
      delete: () => ({ eq: noop }),
    });

    return { auth: mockAuth, from: mockFrom } as any;
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createBrowserClient } = require('@supabase/ssr');
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
