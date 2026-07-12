import assert from "node:assert/strict";

import { resolveRewardsPersistenceTarget } from "../rewardTargetModel";

const sharedEnv = {
  storageModeSetting: "authenticated" as const,
  supabaseUrl: "https://example.supabase.co",
  supabaseAnonKey: "anon-key",
  supabaseServiceRoleKey: null,
  devToolsEnabled: true,
  adminEmails: ["tester@example.com"],
  adminUserIds: ["test-user-id"],
  nodeEnv: "development",
  isProduction: false,
};

const localEnv = {
  ...sharedEnv,
  storageModeSetting: "local_demo" as const,
};

const authenticatedTarget = resolveRewardsPersistenceTarget({
  env: sharedEnv,
  user: {
    userId: "test-user-id",
    email: "tester@example.com",
    mode: "authenticated",
    isAuthenticated: true,
    isAdmin: false,
    accessToken: "access-token",
  },
});

assert.equal(authenticatedTarget.targetMode, "authenticatedShared");
assert.equal(authenticatedTarget.remoteSyncEnabled, true);
assert.equal(authenticatedTarget.isAuthenticatedShared, true);
assert.equal(authenticatedTarget.currentUserId, "test-user-id");
assert.equal(authenticatedTarget.currentUserEmail, "tester@example.com");
assert.match(authenticatedTarget.confirmation, /authenticated test account through shared persistence/i);

const developerAdminTarget = resolveRewardsPersistenceTarget({
  env: sharedEnv,
  user: {
    userId: "test-user-id",
    email: "tester@example.com",
    mode: "developer_admin",
    isAuthenticated: true,
    isAdmin: true,
    accessToken: "access-token",
  },
});

assert.equal(developerAdminTarget.targetMode, "authenticatedShared");
assert.equal(developerAdminTarget.remoteSyncEnabled, true);

const localTarget = resolveRewardsPersistenceTarget({
  env: localEnv,
  user: {
    userId: "local-demo-user",
    email: null,
    mode: "local_demo",
    isAuthenticated: false,
    isAdmin: false,
    accessToken: null,
  },
});

assert.equal(localTarget.targetMode, "localOnly");
assert.equal(localTarget.remoteSyncEnabled, false);
assert.equal(localTarget.isLocalOnly, true);
assert.equal(localTarget.currentUserId, "local-demo-user");
assert.match(localTarget.warning, /Local demo mode only affects this browser/i);

console.log("rewardTargetModel.test.ts passed");
