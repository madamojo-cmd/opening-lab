// server-only: do not import into client components.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { hasSupabaseCredentials, readBlundrBackendEnv } from "./backendEnv";

export type BlundrSupabaseServerClientInput = {
  accessToken?: string | null;
};

export function createBlundrSupabaseServerClient(input: BlundrSupabaseServerClientInput = {}): SupabaseClient | null {
  const env = readBlundrBackendEnv();
  if (!hasSupabaseCredentials(env)) return null;
  const headers: Record<string, string> = {};
  const accessToken = String(input.accessToken ?? "").trim();
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  return createClient(env.supabaseUrl!, env.supabaseAnonKey!, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
    global: {
      headers,
    },
  });
}
