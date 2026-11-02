import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a dummy client for build-time prerendering
    return createSupabaseClient('https://placeholder.supabase.co', 'placeholder-key');
  }
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}