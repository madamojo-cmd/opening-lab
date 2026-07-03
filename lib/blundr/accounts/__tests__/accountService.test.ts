import assert from "node:assert/strict";

import { bootstrapBlundrAccount, getOrCreateTrainingProfile, initializeAccountDefaults } from "../accountService";
import { readLocalAccountBundle, resetLocalAccountState } from "../localAccountStorage";

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

void (async () => {
  try {
    process.env.NEXT_PUBLIC_BLUNDR_STORAGE_MODE = "local_demo";
    process.env.NODE_ENV = "development";
    resetLocalAccountState("local-demo-user");

    const bootstrap = await bootstrapBlundrAccount();
    assert.equal(bootstrap.ok, true);
    assert.equal(bootstrap.ok ? bootstrap.data.user.userId : "", "local-demo-user");
    assert.equal(bootstrap.ok ? bootstrap.data.profile.userId : "", "local-demo-user");

    const defaults = await initializeAccountDefaults("user-2", { mode: "local_demo", allowLocalFallback: true });
    assert.equal(defaults.ok, true);
    assert.equal(defaults.ok ? defaults.data.user.userId : "", "user-2");

    const profile = await getOrCreateTrainingProfile("user-2", { mode: "local_demo", allowLocalFallback: true });
    assert.equal(profile.ok, true);
    assert.equal(profile.ok ? profile.data.userId : "", "user-2");

    const bundle = readLocalAccountBundle();
    assert.ok(bundle.trainingProfilesByUserId["local-demo-user"]);
    assert.ok(bundle.trainingProfilesByUserId["user-2"]);
  } finally {
    for (const key of keys) {
      const value = originalEnv[key];
      if (typeof value === "undefined") {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
    console.log("accountService.test.ts passed");
  }
})();
