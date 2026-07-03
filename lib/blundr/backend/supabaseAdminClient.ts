// server-only: do not import into client components.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { hasSupabaseCredentials, hasSupabaseServiceRole, readBlundrBackendEnv } from "./backendEnv";

let adminClient: SupabaseClient | null = null;

export function createBlundrSupabaseAdminClient(): SupabaseClient | null {
  const env = readBlundrBackendEnv();
  if (!hasSupabaseCredentials(env) || !hasSupabaseServiceRole(env)) return null;
  if (adminClient) return adminClient;
  adminClient = createClient(env.supabaseUrl!, env.supabaseServiceRoleKey!, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
  return adminClient;
}
