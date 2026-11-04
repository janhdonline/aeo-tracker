export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a mock client for build-time prerendering
    const noop = () => ({ data: null, error: null });
    const mockAuth = {
      getUser: async () => ({ data: { user: null }, error: null }),
      signInWithPassword: async () => ({ data: null, error: { message: 'Not configured' } }),
      signUp: async () => ({ data: null, error: { message: 'Not configured' } }),
    };
    const mockFrom = () => ({
      select: () => ({ eq: () => ({ single: noop, order: () => ({ limit: () => ({ single: noop }) }) }), data: null, error: null }),
      insert: () => ({ select: () => ({ single: noop }) }),
      update: () => ({ eq: noop }),
      delete: () => ({ eq: noop }),
    });
    return { auth: mockAuth, from: mockFrom } as any;
  }
  const { createBrowserClient } = require('@supabase/ssr');
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}