import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import { resolvePreviewOnboardingSelfResetDecision } from "../../lib/blundr/backend/previewResetAccess";

const root = process.cwd();
const resetRouteSource = () =>
  readFileSync(join(root, "app/api/blundr/dev/reset-user/route.ts"), "utf8");

const authenticatedUser = {
  userId: "11111111-1111-4111-8111-111111111111",
  isAuthenticated: true,
  mode: "authenticated" as const,
};

function decide(input: {
  body: Record<string, unknown>;
  user?: typeof authenticatedUser | null;
  vercelEnv?: string | null;
  hasBearerSession?: boolean;
}) {
  return resolvePreviewOnboardingSelfResetDecision({
    body: input.body,
    user: input.user === undefined ? authenticatedUser : input.user,
    vercelEnv: input.vercelEnv ?? "preview",
    hasBearerSession: input.hasBearerSession ?? true,
  });
}

test("preview authenticated own onboarding reset is allowed", () => {
  const decision = decide({
    body: { scope: "onboarding", userId: authenticatedUser.userId },
  });

  assert.equal(decision.allowed, true);
  assert.equal(decision.targetUserId, authenticatedUser.userId);
});

test("preview authenticated onboarding reset with omitted target uses current user", () => {
  const decision = decide({ body: { scope: "onboarding" } });

  assert.equal(decision.allowed, true);
  assert.equal(decision.targetUserId, authenticatedUser.userId);
});

test("preview authenticated non-admin cannot self-service reset another user", () => {
  assert.deepEqual(
    decide({
      body: {
        scope: "onboarding",
        userId: "22222222-2222-4222-8222-222222222222",
      },
    }),
    { allowed: false, reason: "cross_user_reset_denied" },
  );
});

test("preview self-service reset does not allow full or local-demo scope", () => {
  assert.deepEqual(decide({ body: { scope: "full" } }), {
    allowed: false,
    reason: "onboarding_scope_required",
  });
  assert.deepEqual(decide({ body: { scope: "local_demo" } }), {
    allowed: false,
    reason: "onboarding_scope_required",
  });
});

test("production never allows preview self-service onboarding reset", () => {
  assert.deepEqual(
    decide({
      body: { scope: "onboarding", userId: authenticatedUser.userId },
      vercelEnv: "production",
    }),
    { allowed: false, reason: "preview_environment_required" },
  );
});

test("unauthenticated preview onboarding reset is denied", () => {
  assert.deepEqual(
    decide({
      body: { scope: "onboarding" },
      user: null,
      hasBearerSession: false,
    }),
    { allowed: false, reason: "authenticated_bearer_session_required" },
  );
});

test("developer-admin reset path remains behind existing gate", () => {
  const source = resetRouteSource();
  assert.match(source, /resolveBlundrDeveloperAccess\(request\)/);
  assert.match(
    source,
    /scope === "full" && access\.user\?\.mode === "local_demo"/,
  );
  assert.match(source, /resetLocalAccountState\(targetUserId\)/);
  assert.ok(
    source.indexOf("resolvePreviewOnboardingSelfResetAccess") <
      source.indexOf("resolveBlundrDeveloperAccess(request)"),
    "preview self-reset must be evaluated before the existing admin gate",
  );
});
