import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function readBrowserSupabaseEnv(): { supabaseUrl: string | null; supabaseAnonKey: string | null } {
  const supabaseUrl = (() => {
    const text = normalizeText(process.env.NEXT_PUBLIC_SUPABASE_URL);
    if (!text) return null;
    try {
      return new URL(text).toString();
    } catch {
      return null;
    }
  })();
  const supabaseAnonKey = normalizeText(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) || null;
  return { supabaseUrl, supabaseAnonKey };
}

export function createBlundrSupabaseBrowserClient(): SupabaseClient | null {
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
  });
  return browserClient;
}
