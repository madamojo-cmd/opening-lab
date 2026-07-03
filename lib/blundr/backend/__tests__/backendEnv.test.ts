import assert from "node:assert/strict";

import { getBlundrStorageModeSetting, hasSupabaseCredentials, hasSupabaseServiceRole, isBlundrAllowlistedUser, readBlundrBackendEnv } from "../backendEnv";

const keys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "BLUNDR_DEV_TOOLS_ENABLED",
  "BLUNDR_ADMIN_EMAILS",
  "BLUNDR_ADMIN_USER_IDS",
  "NEXT_PUBLIC_BLUNDR_STORAGE_MODE",
  "NODE_ENV",
] as const;

const originalEnv = Object.fromEntries(keys.map((key) => [key, process.env[key]]));

try {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-key";
  process.env.BLUNDR_DEV_TOOLS_ENABLED = "true";
  process.env.BLUNDR_ADMIN_EMAILS = "admin@example.com,second@example.com";
  process.env.BLUNDR_ADMIN_USER_IDS = "user-1,user-2";
  process.env.NEXT_PUBLIC_BLUNDR_STORAGE_MODE = "authenticated";
  process.env.NODE_ENV = "production";

  const env = readBlundrBackendEnv();
  assert.equal(env.supabaseUrl, "https://example.supabase.co/");
  assert.equal(env.supabaseAnonKey, "anon-key");
  assert.equal(env.supabaseServiceRoleKey, "service-key");
  assert.equal(env.devToolsEnabled, true);
  assert.deepEqual(env.adminEmails, ["admin@example.com", "second@example.com"]);
  assert.deepEqual(env.adminUserIds, ["user-1", "user-2"]);
  assert.equal(getBlundrStorageModeSetting(env), "authenticated");
  assert.equal(hasSupabaseCredentials(env), true);
  assert.equal(hasSupabaseServiceRole(env), true);
  assert.equal(isBlundrAllowlistedUser({ userId: "user-1", email: "admin@example.com" }, env), true);
  assert.equal(isBlundrAllowlistedUser({ userId: "other", email: "nope@example.com" }, env), false);
} finally {
  for (const key of keys) {
    const value = originalEnv[key];
    if (typeof value === "undefined") {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

console.log("backendEnv.test.ts passed");
