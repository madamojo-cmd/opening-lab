export type BlundrStorageModeSetting = "local_demo" | "authenticated" | "developer_admin" | "local_or_supabase";

export type BlundrBackendEnv = {
  supabaseUrl: string | null;
  supabaseAnonKey: string | null;
  supabaseServiceRoleKey: string | null;
  storageModeSetting: BlundrStorageModeSetting;
  devToolsEnabled: boolean;
  adminEmails: string[];
  adminUserIds: string[];
  nodeEnv: string;
  isProduction: boolean;
};

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeBoolean(value: unknown): boolean {
  const text = normalizeText(value).toLowerCase();
  return text === "1" || text === "true" || text === "yes" || text === "on";
}

function normalizeCsvList(value: unknown): string[] {
  return normalizeText(value)
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function normalizeUrl(value: unknown): string | null {
  const text = normalizeText(value);
  if (!text) return null;
  try {
    return new URL(text).toString();
  } catch {
    return null;
  }
}

function normalizeStorageModeSetting(value: unknown): BlundrStorageModeSetting {
  const text = normalizeText(value).toLowerCase();
  if (text === "local_demo" || text === "authenticated" || text === "developer_admin" || text === "local_or_supabase") {
    return text;
  }
  return "local_or_supabase";
}

export function readBlundrBackendEnv(): BlundrBackendEnv {
  const supabaseUrl = normalizeUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseAnonKey = normalizeText(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) || null;
  const supabaseServiceRoleKey = normalizeText(process.env.SUPABASE_SERVICE_ROLE_KEY) || null;
  const storageModeSetting = normalizeStorageModeSetting(process.env.NEXT_PUBLIC_BLUNDR_STORAGE_MODE);
  const devToolsEnabled = normalizeBoolean(process.env.BLUNDR_DEV_TOOLS_ENABLED);

  return {
    supabaseUrl,
    supabaseAnonKey,
    supabaseServiceRoleKey,
    storageModeSetting,
    devToolsEnabled,
    adminEmails: normalizeCsvList(process.env.BLUNDR_ADMIN_EMAILS).map((entry) => entry.toLowerCase()),
    adminUserIds: normalizeCsvList(process.env.BLUNDR_ADMIN_USER_IDS),
    nodeEnv: normalizeText(process.env.NODE_ENV) || "development",
    isProduction: normalizeText(process.env.NODE_ENV) === "production",
  };
}

export function hasSupabaseCredentials(env: BlundrBackendEnv = readBlundrBackendEnv()): boolean {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}

export function hasSupabaseServiceRole(env: BlundrBackendEnv = readBlundrBackendEnv()): boolean {
  return Boolean(env.supabaseServiceRoleKey);
}

export function isBlundrDevToolsEnabled(env: BlundrBackendEnv = readBlundrBackendEnv()): boolean {
  return env.devToolsEnabled;
}

export function isBlundrAllowlistedUser(input: { userId?: string | null; email?: string | null } | null | undefined, env: BlundrBackendEnv = readBlundrBackendEnv()): boolean {
  const userId = normalizeText(input?.userId);
  const email = normalizeText(input?.email).toLowerCase();
  if (!userId && !email) return false;
  return env.adminUserIds.includes(userId) || env.adminEmails.includes(email);
}

export function getBlundrStorageModeSetting(env: BlundrBackendEnv = readBlundrBackendEnv()): BlundrStorageModeSetting {
  return env.storageModeSetting;
}

