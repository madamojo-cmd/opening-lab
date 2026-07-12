import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { resolveBlundrDeveloperAccess, resolveBlundrDeveloperAccessFromUser } from "../devAccess";
import { readBlundrBackendEnv } from "../backendEnv";

void (async () => {
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
  const restoreEnv = () => {
    for (const key of keys) {
      const value = originalEnv[key];
      if (typeof value === "undefined") {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  };

  try {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-key";
    process.env.NODE_ENV = "development";
    process.env.BLUNDR_DEV_TOOLS_ENABLED = "true";
    process.env.BLUNDR_ADMIN_EMAILS = "tester@example.com";
    process.env.BLUNDR_ADMIN_USER_IDS = "test-user-id,local-demo-user";

    process.env.NEXT_PUBLIC_BLUNDR_STORAGE_MODE = "authenticated";
    const authenticatedEnv = readBlundrBackendEnv();
    const authenticatedNoUser = resolveBlundrDeveloperAccessFromUser({ env: authenticatedEnv, user: null });
    assert.equal(authenticatedNoUser.allowed, false);
    assert.equal(authenticatedNoUser.user, null);
    assert.equal(authenticatedNoUser.reasonCode, "missing_user");
    assert.match(authenticatedNoUser.reason, /browser auth token/i);

    const authenticatedUser = resolveBlundrDeveloperAccessFromUser({
      env: authenticatedEnv,
      user: {
        userId: "test-user-id",
        email: "tester@example.com",
        mode: "authenticated",
        isAuthenticated: true,
        isAdmin: false,
        accessToken: "access-token",
        provider: "email",
      },
    });
    assert.equal(authenticatedUser.allowed, true);
    assert.equal(authenticatedUser.user?.userId, "test-user-id");
    assert.equal(authenticatedUser.user?.email, "tester@example.com");
    assert.equal(authenticatedUser.reasonCode, "resolved");

    const authenticatedWithoutRequest = await resolveBlundrDeveloperAccess(null);
    assert.equal(authenticatedWithoutRequest.allowed, false);
    assert.equal(authenticatedWithoutRequest.user, null);
    assert.equal(authenticatedWithoutRequest.reasonCode, "missing_bearer_token");
    assert.match(authenticatedWithoutRequest.reason, /No browser auth token/i);
    assert.notEqual(authenticatedWithoutRequest.user?.userId ?? null, "local-demo-user");

    process.env.NEXT_PUBLIC_BLUNDR_STORAGE_MODE = "local_demo";
    const localDemoEnv = readBlundrBackendEnv();
    const localDemoUser = resolveBlundrDeveloperAccessFromUser({
      env: localDemoEnv,
      user: {
        userId: "local-demo-user",
        email: null,
        mode: "local_demo",
        isAuthenticated: false,
        isAdmin: false,
        accessToken: null,
        provider: "local",
      },
    });
    assert.equal(localDemoUser.allowed, true);
    assert.equal(localDemoUser.user?.userId, "local-demo-user");
    assert.equal(localDemoUser.reasonCode, "resolved");

    process.env.BLUNDR_DEV_TOOLS_ENABLED = "false";
    const disabledEnv = readBlundrBackendEnv();
    const disabledAccess = resolveBlundrDeveloperAccessFromUser({
      env: disabledEnv,
      user: {
        userId: "test-user-id",
        email: "tester@example.com",
        mode: "authenticated",
        isAuthenticated: true,
        isAdmin: false,
        accessToken: "access-token",
        provider: "email",
      },
    });
    assert.equal(disabledAccess.allowed, false);
    assert.equal(disabledAccess.reasonCode, "dev_tools_disabled");
    assert.match(disabledAccess.reason, /disabled/i);

    const navFile = fs.readFileSync(path.join(process.cwd(), "components/navigation/BlundrBottomNav.tsx"), "utf8");
    const topBarFile = fs.readFileSync(path.join(process.cwd(), "components/navigation/BlundrTopBar.tsx"), "utf8");
    assert.equal(navFile.includes("/dev/rewards"), false);
    assert.equal(topBarFile.includes("/dev/rewards"), false);
  } finally {
    restoreEnv();
  }

  console.log("devAccess.test.ts passed");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
