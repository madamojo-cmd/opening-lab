// server-only: do not import into client components.
import { createClient } from "@supabase/supabase-js";

import { hasSupabaseCredentials, hasSupabaseServiceRole, readBlundrBackendEnv } from "./backendEnv";
import type { BlundrSupabaseClient } from "./supabaseBrowserClient";

let adminClient: BlundrSupabaseClient | null = null;

export function createBlundrSupabaseAdminClient(): BlundrSupabaseClient | null {
  const env = readBlundrBackendEnv();
  if (!hasSupabaseCredentials(env) || !hasSupabaseServiceRole(env)) return null;
  if (adminClient) return adminClient;
  adminClient = createClient(env.supabaseUrl!, env.supabaseServiceRoleKey!, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  }) as unknown as BlundrSupabaseClient;
  return adminClient;
}
