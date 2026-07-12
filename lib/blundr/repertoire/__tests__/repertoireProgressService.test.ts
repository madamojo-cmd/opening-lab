import assert from "node:assert/strict";

import { getLocalRepertoirePointEvents, getLocalRepertoireUnlockEvents, getLocalUserRepertoire, resetLocalAccountState } from "../../accounts/localAccountStorage";
import { resetOnboardingAuthClientFactoryForTesting, setOnboardingAuthClientFactoryForTesting } from "../../accounts/accountSession";
import { earnAndPersistRepertoirePoints, getRepertoireProgressSnapshot, loadRepertoireProgress, saveRepertoireProgress, unlockAndPersistOpening } from "../repertoireProgressService";

void (async () => {
  const userId = "local-demo-user";
  const now = "2026-07-04T12:00:00.000Z";
  process.env.NEXT_PUBLIC_BLUNDR_STORAGE_MODE = "local_demo";
  resetLocalAccountState(userId);

  const initial = loadRepertoireProgress({ userId, now });
  assert.equal(initial.selectedStarterPackId, "classical_attacker");
  assert.deepEqual(initial.unlockedOpeningIds.slice(0, 2).sort(), ["french-black", "italian-white"].sort());
  assert.equal(initial.availablePoints, 0);
  assert.ok(initial.lockedOpeningIds.length > 0);

  const pointResult = await earnAndPersistRepertoirePoints({
    userId,
    source: "opening_run_completed",
    openingId: "italian-white",
    completionId: `${userId}:opening-run-1`,
    starterPackId: "classical_attacker",
    now,
  });
  assert.equal(pointResult.ok, true);
  if (pointResult.ok) {
    assert.equal(pointResult.progress.availablePoints, 1);
  }
  assert.equal(getLocalRepertoirePointEvents(userId).length, 1);

  const snapshot = getRepertoireProgressSnapshot({ userId });
  assert.equal(snapshot.repertoire.openingUnlockPoints, snapshot.progress.availablePoints);
  const targetOpeningId = snapshot.progress.lockedOpeningIds[0];
  if (!targetOpeningId) {
    throw new Error("Expected a locked opening in the persistence snapshot.");
  }

  const boosted = await saveRepertoireProgress(
    {
      ...snapshot.progress,
      availablePoints: 150,
      lifetimePoints: 150,
      nextUnlockCost: 150,
      nextUnlockProgressPct: 100,
      updatedAt: now,
    },
    { syncRemote: false },
  );
  assert.equal(boosted.ok, true);
  if (boosted.ok) {
    assert.equal(boosted.progress.availablePoints, 150);
  }

  const unlockResult = await unlockAndPersistOpening({
    userId,
    openingId: targetOpeningId,
    starterPackId: "classical_attacker",
    syncRemote: false,
    now,
  });
  assert.equal(unlockResult.ok, true);
  if (unlockResult.ok) {
    assert.ok(unlockResult.progress.unlockedOpeningIds.includes(targetOpeningId));
    assert.equal(unlockResult.progress.availablePoints, 0);
  }

  assert.ok(getLocalRepertoireUnlockEvents(userId).some((event) => event.openingId === targetOpeningId));
  assert.equal(getLocalUserRepertoire(userId)?.unlockedOpeningIds.includes(targetOpeningId), true);
  assert.equal(loadRepertoireProgress({ userId, now }).unlockedOpeningIds.includes(targetOpeningId), true);

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

  const authBlockedSave = await saveRepertoireProgress({
    ...loadRepertoireProgress({ userId: "auth-blocked-user", now }),
    userId: "auth-blocked-user",
  });
  assert.equal(authBlockedSave.ok, false);
  if (!authBlockedSave.ok) {
    assert.equal(authBlockedSave.code, "auth_required");
  }
  const authBlockedSnapshot = loadRepertoireProgress({ userId: "auth-blocked-user", now });

  const authBlockedPoints = await earnAndPersistRepertoirePoints({
    userId: "auth-blocked-user",
    source: "opening_run_completed",
    openingId: "italian-white",
    completionId: "auth-blocked-points",
    starterPackId: "classical_attacker",
    now,
  });
  assert.equal(authBlockedPoints.ok, false);
  if (!authBlockedPoints.ok) {
    assert.equal(authBlockedPoints.code, "auth_required");
  }

  const authBlockedUnlock = await unlockAndPersistOpening({
    userId: "auth-blocked-user",
    openingId: targetOpeningId,
    starterPackId: "classical_attacker",
    now,
  });
  assert.equal(authBlockedUnlock.ok, false);
  if (!authBlockedUnlock.ok) {
    assert.equal(authBlockedUnlock.code, "auth_required");
  }
  assert.equal(loadRepertoireProgress({ userId: "auth-blocked-user", now }).availablePoints, authBlockedSnapshot.availablePoints);

  setOnboardingAuthClientFactoryForTesting(() => ({
    auth: {
      getSession: async () => ({
        data: {
          session: {
            access_token: "auth-token",
            expires_at: Math.floor(Date.now() / 1000) + 3600,
            user: {
              id: "auth-remote-user",
              email: "auth@example.com",
            },
          },
        },
        error: null,
      }),
      getUser: async () => ({
        data: {
          user: {
            id: "auth-remote-user",
            email: "auth@example.com",
            app_metadata: { provider: "email" },
          },
        },
        error: null,
      }),
    },
  }) as never);
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ ok: false }), {
        status: 500,
        headers: { "content-type": "application/json" },
      })) as typeof fetch;
    resetLocalAccountState("auth-remote-user");
    const beforeRemoteFailure = loadRepertoireProgress({ userId: "auth-remote-user", now });
    const remoteFailure = await saveRepertoireProgress({
      ...beforeRemoteFailure,
      userId: "auth-remote-user",
      availablePoints: 150,
      lifetimePoints: 150,
      nextUnlockCost: 150,
      nextUnlockProgressPct: 100,
      updatedAt: now,
    });
    assert.equal(remoteFailure.ok, false);
    if (!remoteFailure.ok) {
      assert.equal(remoteFailure.code, "shared_sync_failed");
    }
    assert.equal(loadRepertoireProgress({ userId: "auth-remote-user", now }).availablePoints, beforeRemoteFailure.availablePoints);
  } finally {
    globalThis.fetch = originalFetch;
  }
  resetOnboardingAuthClientFactoryForTesting();

  console.log("repertoireProgressService.test.ts passed");
})();
