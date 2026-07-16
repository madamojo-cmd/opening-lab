// server-only: do not import into client components.

import { createClient } from "@supabase/supabase-js";

import { hasSupabaseCredentials, readBlundrBackendEnv } from "./backendEnv";
import type { BlundrSupabaseClient } from "./supabaseBrowserClient";

export type BlundrSupabaseServerClientInput = {
  accessToken?: string | null;
  forUserQueries?: boolean;
};

export function createBlundrSupabaseServerClient(input: BlundrSupabaseServerClientInput = {}): BlundrSupabaseClient | null {
  const env = readBlundrBackendEnv();
  if (!hasSupabaseCredentials(env)) return null;
  const headers: Record<string, string> = {};
  const accessToken = String(input.accessToken ?? "").trim();
  // auth.getUser(accessToken) validates the explicit argument. Supplying the
  // same token as a global header makes this Supabase client reject otherwise
  // valid tokens. Keep query clients opt-in so RLS-backed repositories still
  // receive the validated user's bearer header.
  if (accessToken && input.forUserQueries)
    headers.authorization = `Bearer ${accessToken}`;
  return createClient(env.supabaseUrl!, env.supabaseAnonKey!, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
    global: {
      headers,
    },
  }) as unknown as BlundrSupabaseClient;
}
