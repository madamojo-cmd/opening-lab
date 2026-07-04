import assert from "node:assert/strict";

import { createRepertoirePointEvent } from "../repertoirePoints";
import { getNextUnlockCost } from "../repertoireUnlockCurve";
import { createDefaultRepertoireProgress, earnRepertoirePoints, getLockedOpeningCards, getUnlockedOpeningCards, isOpeningUnlocked, unlockOpening } from "../repertoireUnlockService";
import { getEligibleRepertoireOpeningIds } from "../repertoireOpeningPool";

const now = "2026-07-04T12:00:00.000Z";
const allOpeningIds = getEligibleRepertoireOpeningIds();
const progress = createDefaultRepertoireProgress({
  userId: "user-1",
  starterPackId: "classical_attacker",
  allOpeningIds,
  now,
});

assert.deepEqual(progress.unlockedOpeningIds.slice(0, 2).sort(), ["french-black", "italian-white"].sort());
assert.ok(progress.lockedOpeningIds.length > 0);
assert.equal(isOpeningUnlocked(progress, "italian-white"), true);

const firstLockedOpeningId = progress.lockedOpeningIds[0];
if (!firstLockedOpeningId) {
  throw new Error("Expected a locked opening in the MVP pool.");
}
assert.equal(isOpeningUnlocked(progress, firstLockedOpeningId), false);

const pointEvent = createRepertoirePointEvent({
  userId: "user-1",
  source: "opening_run_completed",
  openingId: "italian-white",
  id: "point-1",
  createdAt: now,
});
const earned = earnRepertoirePoints(progress, pointEvent);
assert.equal(earned.availablePoints, 1);
assert.equal(earnRepertoirePoints(earned, pointEvent).availablePoints, 1);

const insufficient = unlockOpening(progress, firstLockedOpeningId);
assert.equal(insufficient.ok, false);
if (!insufficient.ok) {
  assert.equal(insufficient.code, "insufficient_points");
}

const affordableProgress = {
  ...progress,
  availablePoints: getNextUnlockCost(progress),
  lifetimePoints: getNextUnlockCost(progress),
  nextUnlockCost: getNextUnlockCost(progress),
  nextUnlockProgressPct: 100,
  updatedAt: now,
};

const unlockResult = unlockOpening(affordableProgress, firstLockedOpeningId);
assert.equal(unlockResult.ok, true);
if (unlockResult.ok) {
  assert.ok(unlockResult.progress.unlockedOpeningIds.includes(firstLockedOpeningId));
  assert.equal(unlockResult.progress.availablePoints, 0);
  assert.equal(unlockResult.event.pointsSpent, getNextUnlockCost(progress));
  assert.equal(getUnlockedOpeningCards(unlockResult.progress).some((card) => card.openingId === firstLockedOpeningId), true);
  assert.equal(getLockedOpeningCards(unlockResult.progress).some((card) => card.openingId === firstLockedOpeningId), false);
}

console.log("repertoireUnlockService.test.ts passed");
