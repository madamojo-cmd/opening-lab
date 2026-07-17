import assert from "node:assert/strict";

import { createBlundrLocalPersistenceAdapter } from "../localPersistenceAdapter";
import { createBlundrSupabasePersistenceAdapter } from "../supabasePersistenceAdapter";
import {
  isBlundrLocalPersistenceAdapter,
  isBlundrSupabasePersistencePreferred,
  resolveBlundrPersistenceAdapter,
} from "../persistenceService";
import { readBlundrBackendEnv } from "../../backend/backendEnv";

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

const originalEnv = Object.fromEntries(
  keys.map((key) => [key, process.env[key]]),
);

try {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  process.env.NEXT_PUBLIC_BLUNDR_STORAGE_MODE = "local_demo";
  const localAdapter = resolveBlundrPersistenceAdapter({
    mode: "local_demo",
    allowLocalFallback: true,
  });
  assert.equal(isBlundrLocalPersistenceAdapter(localAdapter), true);
  assert.equal(localAdapter.mode, "local_demo");

  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
  process.env.NEXT_PUBLIC_BLUNDR_STORAGE_MODE = "authenticated";
  const env = readBlundrBackendEnv();
  assert.equal(
    isBlundrSupabasePersistencePreferred({
      mode: "authenticated",
      allowLocalFallback: false,
    }),
    true,
  );
  const supabaseAdapter = resolveBlundrPersistenceAdapter({
    mode: "authenticated",
    accessToken: "token",
    allowLocalFallback: false,
  });
  assert.equal(supabaseAdapter.mode, "authenticated");
  assert.equal(typeof supabaseAdapter.getTrainingProfile, "function");
  assert.notEqual(
    supabaseAdapter,
    createBlundrLocalPersistenceAdapter("local_demo"),
  );
  // Bearer validation and RLS clients use the canonical project origin.
  assert.equal(env.supabaseUrl, "https://example.supabase.co");
  assert.equal(env.supabaseAnonKey, "anon-key");
  assert.equal(
    isBlundrLocalPersistenceAdapter(
      createBlundrLocalPersistenceAdapter("local_demo"),
    ),
    true,
  );
  assert.equal(
    isBlundrSupabasePersistencePreferred({ mode: "local_demo" }),
    false,
  );
  assert.equal(
    createBlundrSupabasePersistenceAdapter({
      accessToken: "token",
      mode: "authenticated",
    }).mode,
    "authenticated",
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

console.log("persistenceService.test.ts passed");
