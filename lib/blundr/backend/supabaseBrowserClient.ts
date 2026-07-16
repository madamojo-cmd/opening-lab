import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { AuthClient } from "@supabase/auth-js";

type BlundrSupabaseAuthClient = Pick<
  InstanceType<typeof AuthClient>,
  | "getSession"
  | "getUser"
  | "signInWithPassword"
  | "signUp"
  | "signOut"
  | "onAuthStateChange"
>;

export type BlundrSupabaseClient = Omit<SupabaseClient, "auth"> & {
  auth: BlundrSupabaseAuthClient;
};

let browserClient: BlundrSupabaseClient | null = null;

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function readBrowserSupabaseEnv(): {
  supabaseUrl: string | null;
  supabaseAnonKey: string | null;
} {
  const supabaseUrl = (() => {
    const text = normalizeText(process.env.NEXT_PUBLIC_SUPABASE_URL);
    if (!text) return null;
    try {
      return new URL(text).toString();
    } catch {
      return null;
    }
  })();
  const supabaseAnonKey =
    normalizeText(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) || null;
  return { supabaseUrl, supabaseAnonKey };
}

export function createBlundrSupabaseBrowserClient(): BlundrSupabaseClient | null {
  if (typeof window === "undefined") return null;
  const env = readBrowserSupabaseEnv();
  if (!env.supabaseUrl || !env.supabaseAnonKey) return null;
  if (browserClient) return browserClient;
  browserClient = createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
    },
  }) as unknown as BlundrSupabaseClient;
  return browserClient;
}
