import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;
let cachedUrl = '';
let cachedKey = '';

export function createClient(url?: string, anonKey?: string): SupabaseClient {
  const supabaseUrl =
    url ??
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.EXPO_PUBLIC_SUPABASE_URL ??
    '';
  const supabaseAnonKey =
    anonKey ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
    '';

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL or anon key not configured');
  }

  if (!client || cachedUrl !== supabaseUrl || cachedKey !== supabaseAnonKey) {
    client = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    cachedUrl = supabaseUrl;
    cachedKey = supabaseAnonKey;
  }
  return client;
}

export function getSupabase(): SupabaseClient {
  return createClient();
}

export type { SupabaseClient };
