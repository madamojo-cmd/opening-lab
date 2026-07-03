import assert from "node:assert/strict";

import { resolveBlundrAccountMode, shouldPreferSupabasePersistence, isBlundrDeveloperAdmin } from "../backendMode";
import { readBlundrBackendEnv } from "../backendEnv";

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
  process.env.BLUNDR_ADMIN_EMAILS = "admin@example.com";
  process.env.BLUNDR_ADMIN_USER_IDS = "admin-user";
  process.env.NEXT_PUBLIC_BLUNDR_STORAGE_MODE = "local_demo";

  const env = readBlundrBackendEnv();
  assert.equal(resolveBlundrAccountMode({ env }), "local_demo");

  process.env.NEXT_PUBLIC_BLUNDR_STORAGE_MODE = "authenticated";
  const authEnv = readBlundrBackendEnv();
  assert.equal(
    resolveBlundrAccountMode({
      env: authEnv,
      user: { userId: "user-1", mode: "authenticated", isAuthenticated: true, isAdmin: false, email: "player@example.com" },
    }),
    "authenticated",
  );

  process.env.NEXT_PUBLIC_BLUNDR_STORAGE_MODE = "developer_admin";
  const adminEnv = readBlundrBackendEnv();
  assert.equal(
    resolveBlundrAccountMode({
      env: adminEnv,
      user: { userId: "admin-user", mode: "authenticated", isAuthenticated: true, isAdmin: true, email: "admin@example.com" },
    }),
    "developer_admin",
  );
  assert.equal(
    isBlundrDeveloperAdmin({
      env: adminEnv,
      user: { userId: "admin-user", mode: "developer_admin", isAuthenticated: true, isAdmin: true, email: "admin@example.com" },
    }),
    true,
  );
  assert.equal(
    shouldPreferSupabasePersistence({
      env: adminEnv,
      user: { userId: "admin-user", mode: "developer_admin", isAuthenticated: true, isAdmin: true, email: "admin@example.com", accessToken: "token" },
    }),
    true,
  );
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

console.log("backendMode.test.ts passed");
