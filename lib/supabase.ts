import { createClient, SupabaseClient } from '@supabase/supabase-js';

function getEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY',
    );
  }
  return { url, anonKey };
}

let _server: SupabaseClient | null = null;
export function serverSupabase(): SupabaseClient {
  if (!_server) {
    const { url, anonKey } = getEnv();
    _server = createClient(url, anonKey, { auth: { persistSession: false } });
  }
  return _server;
}

export function browserSupabase(): SupabaseClient {
  const { url, anonKey } = getEnv();
  return createClient(url, anonKey, { auth: { persistSession: false } });
}
