import assert from "node:assert/strict";

import {
  getLocalRepertoirePointEvents,
  getLocalRepertoireUnlockEvents,
  getLocalUserRepertoire,
  resetLocalAccountState,
} from "../../accounts/localAccountStorage";
import {
  earnAndPersistRepertoirePoints,
  getRepertoireProgressSnapshot,
  loadRepertoireProgress,
  saveRepertoireProgress,
  unlockAndPersistOpening,
} from "../repertoireProgressService";

void (async () => {
  const userId = "local-demo-user";
  const now = "2026-07-04T12:00:00.000Z";
  process.env.NEXT_PUBLIC_BLUNDR_STORAGE_MODE = "local_demo";
  resetLocalAccountState(userId);

  const initial = loadRepertoireProgress({ userId, now });
  assert.equal(initial.selectedStarterPackId, "classical_attacker");
  assert.deepEqual(
    initial.unlockedOpeningIds.slice(0, 2).sort(),
    ["french-black", "italian-white"].sort(),
  );
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
  assert.equal(
    snapshot.repertoire.openingUnlockPoints,
    snapshot.progress.availablePoints,
  );
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
  assert.equal(boosted.availablePoints, 150);

  const unlockResult = await unlockAndPersistOpening({
    userId,
    openingId: targetOpeningId,
    starterPackId: "classical_attacker",
    syncRemote: false,
    now,
  });
  assert.equal(unlockResult.ok, true);
  if (unlockResult.ok) {
    assert.ok(
      unlockResult.progress.unlockedOpeningIds.includes(targetOpeningId),
    );
    assert.equal(unlockResult.progress.availablePoints, 0);
  }

  assert.ok(
    getLocalRepertoireUnlockEvents(userId).some(
      (event) => event.openingId === targetOpeningId,
    ),
  );
  assert.equal(
    getLocalUserRepertoire(userId)?.unlockedOpeningIds.includes(
      targetOpeningId,
    ),
    true,
  );
  assert.equal(
    loadRepertoireProgress({ userId, now }).unlockedOpeningIds.includes(
      targetOpeningId,
    ),
    true,
  );

  const accountUserId = "account-user";
  resetLocalAccountState(accountUserId);
  const accountBefore = loadRepertoireProgress({ userId: accountUserId, now });
  const accountPointEventsBefore =
    getLocalRepertoirePointEvents(accountUserId).length;
  const blockedPointResult = await earnAndPersistRepertoirePoints({
    userId: accountUserId,
    source: "opening_run_completed",
    completionId: `${accountUserId}:legacy-completion`,
    now,
  });
  assert.equal(blockedPointResult.ok, false);
  if (!blockedPointResult.ok) {
    assert.equal(blockedPointResult.code, "reward_authority_required");
  }
  assert.equal(
    getLocalRepertoirePointEvents(accountUserId).length,
    accountPointEventsBefore,
  );
  assert.deepEqual(
    loadRepertoireProgress({ userId: accountUserId, now }),
    accountBefore,
  );

  const blockedUnlockResult = await unlockAndPersistOpening({
    userId: accountUserId,
    openingId: accountBefore.lockedOpeningIds[0] ?? "sicilian-black",
    now,
  });
  assert.equal(blockedUnlockResult.ok, false);
  if (!blockedUnlockResult.ok) {
    assert.equal(blockedUnlockResult.code, "authentication_required");
  }
  assert.equal(getLocalRepertoireUnlockEvents(accountUserId).length, 0);
  assert.deepEqual(
    loadRepertoireProgress({ userId: accountUserId, now }),
    accountBefore,
  );

  console.log("repertoireProgressService.test.ts passed");
})();
