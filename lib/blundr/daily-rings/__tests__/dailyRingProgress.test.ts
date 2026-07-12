import assert from "node:assert/strict";

import { applyDailyRingActivity, createDefaultDailyRingDay, getDailyRingPercent, getDailyRingSummary } from "../dailyRingProgress";

const now = "2026-07-04T08:00:00.000Z";
const baseDay = createDefaultDailyRingDay({
  userId: "user-1",
  localDate: "2026-07-04",
  dailyTempoGoal: 1,
  dailyBatteryGoal: 1,
  dailyBlundrGoal: 1,
  now,
});

const opening = applyDailyRingActivity(baseDay, {
  userId: "user-1",
  source: "opening_run_completed",
  completionId: "opening-1",
  createdAt: now,
  openingId: "italian-white",
});
assert.equal(opening.activityAlreadyApplied, false);
assert.equal(opening.ringClosedThisAction, true);
assert.equal(opening.dayRecord.dailyTempo.closed, true);
assert.equal(opening.repertoirePointsAwarded, 1);
assert.equal(opening.xpAwarded, 10);
assert.equal(getDailyRingPercent(opening.dayRecord.dailyTempo), 100);

const duplicateOpening = applyDailyRingActivity(opening.dayRecord, {
  userId: "user-1",
  source: "opening_run_completed",
  completionId: "opening-1",
  createdAt: now,
  openingId: "italian-white",
});
assert.equal(duplicateOpening.activityAlreadyApplied, true);
assert.equal(duplicateOpening.repertoirePointsAwarded, 0);
assert.equal(duplicateOpening.xpAwarded, 0);

const clampedOpening = applyDailyRingActivity(opening.dayRecord, {
  userId: "user-1",
  source: "opening_run_completed",
  completionId: "opening-2",
  createdAt: now,
  openingId: "italian-white",
});
assert.equal(clampedOpening.dayRecord.dailyTempo.progress, 1);
assert.equal(clampedOpening.dayRecord.dailyTempo.goal, 1);
assert.equal(clampedOpening.ringClosedThisAction, false);

const continuation = applyDailyRingActivity(opening.dayRecord, {
  userId: "user-1",
  source: "continuation_completed",
  completionId: "continuation-1",
  createdAt: now,
  openingId: "italian-white",
});
assert.equal(continuation.dayRecord.dailyBattery.closed, true);

const final = applyDailyRingActivity(continuation.dayRecord, {
  userId: "user-1",
  source: "daily_blundr_deck_completed",
  completionId: "daily-1",
  createdAt: now,
  dailySessionId: "session-1",
});
assert.equal(final.allRingsClosedThisAction, true);
assert.equal(final.dayRecord.allRingsClosed, true);
assert.equal(final.dayRecord.repertoirePointsEarnedToday, 8);
assert.equal(final.dayRecord.xpEarnedToday, 80);
assert.equal(getDailyRingSummary(final.dayRecord).length, 3);

console.log("dailyRingProgress.test.ts passed");
