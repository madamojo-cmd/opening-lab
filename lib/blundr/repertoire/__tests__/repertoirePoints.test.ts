import assert from "node:assert/strict";

import { REPERTOIRE_POINT_AWARDS, applyRepertoirePointEvent, createRepertoirePointEvent, getPointAwardForSource } from "../repertoirePoints";
import type { RepertoireProgress } from "../repertoireTypes";

const now = "2026-07-04T12:00:00.000Z";
const baseProgress: RepertoireProgress = {
  userId: "user-1",
  selectedStarterPackId: "classical_attacker",
  unlockedOpeningIds: ["italian-white", "french-black"],
  lockedOpeningIds: ["london-white"],
  availablePoints: 0,
  lifetimePoints: 0,
  spentPoints: 0,
  nextUnlockCost: 150,
  nextUnlockProgressPct: 0,
  pointEvents: [],
  unlockEvents: [],
  updatedAt: now,
};

assert.equal(REPERTOIRE_POINT_AWARDS.openingRunCompleted, 1);
assert.equal(REPERTOIRE_POINT_AWARDS.continuationCompleted, 2);
assert.equal(REPERTOIRE_POINT_AWARDS.dailyBlundrDeckCompleted, 5);
assert.equal(getPointAwardForSource("opening_run_completed"), 1);
assert.equal(getPointAwardForSource("continuation_completed"), 2);
assert.equal(getPointAwardForSource("daily_blundr_deck_completed"), 5);

const pointEvent = createRepertoirePointEvent({
  userId: "user-1",
  source: "opening_run_completed",
  openingId: "italian-white",
  id: "point-1",
  createdAt: now,
});
assert.equal(pointEvent.points, 1);

const earned = applyRepertoirePointEvent(baseProgress, pointEvent);
assert.equal(earned.availablePoints, 1);
assert.equal(earned.lifetimePoints, 1);
assert.equal(earned.pointEvents.length, 1);
assert.equal(earned.nextUnlockCost, 150);

const duplicate = applyRepertoirePointEvent(earned, pointEvent);
assert.equal(duplicate.availablePoints, 1);
assert.equal(duplicate.lifetimePoints, 1);
assert.equal(duplicate.pointEvents.length, 1);

const continuationEvent = createRepertoirePointEvent({
  userId: "user-1",
  source: "continuation_completed",
  openingId: "italian-white",
  id: "point-2",
  createdAt: now,
});
const doubleEarned = applyRepertoirePointEvent(duplicate, continuationEvent);
assert.equal(doubleEarned.availablePoints, 3);
assert.equal(doubleEarned.lifetimePoints, 3);

console.log("repertoirePoints.test.ts passed");
