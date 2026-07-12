import assert from "node:assert/strict";

import {
  parseBearerToken,
  resolveCurrentBlundrUser,
  resolveWriteUserForMode,
  setOnboardingAuthClientFactoryForTesting,
  resetOnboardingAuthClientFactoryForTesting,
  validateSupabaseBearerToken,
} from "../accountSession";

void (async () => {
  const originalStorageMode = process.env.NEXT_PUBLIC_BLUNDR_STORAGE_MODE;
  process.env.NEXT_PUBLIC_BLUNDR_STORAGE_MODE = "authenticated";
  setOnboardingAuthClientFactoryForTesting(() => ({
    auth: {
      getSession: async () => ({
        data: { session: null },
        error: null,
      }),
      getUser: async () => ({
        data: { user: null },
        error: null,
      }),
    },
  }) as never);
  const request = new Request("https://example.com", {
    headers: {
      authorization: "Bearer test-token",
    },
  });
  assert.equal(parseBearerToken(request), "test-token");

  const noToken = await resolveCurrentBlundrUser({
    request: new Request("https://example.com"),
    allowLocalFallback: false,
  });
  assert.equal(noToken.user, null);
  assert.equal(noToken.reasonCode, "missing_bearer_token");
  assert.match(noToken.reason, /No browser auth token/i);

  const resolved = await validateSupabaseBearerToken("valid-token", {
    env: {
      supabaseUrl: "https://example.supabase.co",
      supabaseAnonKey: "sb_publishable_123",
      supabaseServiceRoleKey: null,
      storageModeSetting: "authenticated",
      devToolsEnabled: true,
      adminEmails: ["tester@example.com"],
      adminUserIds: ["test-user-id"],
      nodeEnv: "development",
      isProduction: false,
    },
    deps: {
      createServerClient: () =>
        ({
          auth: {
            getUser: async () => ({
              data: {
                user: {
                  id: "test-user-id",
                  email: "tester@example.com",
                  app_metadata: { provider: "email" },
                },
              },
              error: null,
            }),
          },
        }) as never,
      fetchImpl: async () =>
        new Response(null, {
          status: 500,
        }),
    },
  });
  assert.equal(resolved.user?.userId, "test-user-id");
  assert.equal(resolved.user?.email, "tester@example.com");
  assert.equal(resolved.reasonCode, "resolved");
  assert.equal(resolved.diagnostics.validationMethod, "supabase-js");

  const rejected = await validateSupabaseBearerToken("bad-token", {
    env: {
      supabaseUrl: "https://example.supabase.co",
      supabaseAnonKey: "sb_publishable_123",
      supabaseServiceRoleKey: null,
      storageModeSetting: "authenticated",
      devToolsEnabled: true,
      adminEmails: ["tester@example.com"],
      adminUserIds: ["test-user-id"],
      nodeEnv: "development",
      isProduction: false,
    },
    deps: {
      createServerClient: () =>
        ({
          auth: {
            getUser: async () => ({
              data: { user: null },
              error: { message: "invalid jwt" },
            }),
          },
        }) as never,
      fetchImpl: async () =>
        new Response(JSON.stringify({ message: "invalid" }), {
          status: 401,
          headers: { "content-type": "application/json" },
        }),
    },
  });
  assert.equal(rejected.user, null);
  assert.equal(rejected.reasonCode, "token_validation_failed");
  assert.match(rejected.reason, /could not be validated/i);

  const blockedWrite = await resolveWriteUserForMode({
    requestedUserId: "stale-user-id",
    storageModeSetting: "authenticated",
  });
  assert.equal(blockedWrite.ok, false);
  if (!blockedWrite.ok) {
    assert.equal(blockedWrite.code, "auth_required");
    assert.match(blockedWrite.message, /Sign in before saving shared progress/i);
  }

  setOnboardingAuthClientFactoryForTesting(() => ({
    auth: {
      getSession: async () => ({
        data: {
          session: {
            access_token: "auth-token",
            expires_at: Math.floor(Date.now() / 1000) + 3600,
            user: {
              id: "auth-user-id",
              email: "tester@example.com",
            },
          },
        },
        error: null,
      }),
      getUser: async () => ({
        data: {
          user: {
            id: "auth-user-id",
            email: "tester@example.com",
            app_metadata: { provider: "email" },
          },
        },
        error: null,
      }),
    },
  }) as never);
  const resolvedWrite = await resolveWriteUserForMode({
    requestedUserId: "stale-user-id",
    storageModeSetting: "authenticated",
  });
  assert.equal(resolvedWrite.ok, true);
  if (resolvedWrite.ok) {
    assert.equal(resolvedWrite.userId, "auth-user-id");
  }

  process.env.NEXT_PUBLIC_BLUNDR_STORAGE_MODE = "local_demo";
  const localWrite = await resolveWriteUserForMode({
    requestedUserId: "local-demo-user",
    storageModeSetting: "local_demo",
  });
  assert.equal(localWrite.ok, true);
  if (localWrite.ok) {
    assert.equal(localWrite.userId, "local-demo-user");
  }

  console.log("accountSession.test.ts passed");
  if (typeof originalStorageMode === "undefined") {
    delete process.env.NEXT_PUBLIC_BLUNDR_STORAGE_MODE;
  } else {
    process.env.NEXT_PUBLIC_BLUNDR_STORAGE_MODE = originalStorageMode;
  }
  resetOnboardingAuthClientFactoryForTesting();
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
