import assert from "node:assert/strict";

import { createAllRingsClosedEventId, createDailyRingActivityEvent, createDailyRingActivityEventId, createStreakMilestoneEventId } from "../dailyRingEvents";

const createdAtA = "2026-07-04T08:00:00.000Z";
const createdAtB = "2026-07-04T12:00:00.000Z";

const idA = createDailyRingActivityEventId({
  userId: "user-1",
  localDate: "2026-07-04",
  source: "opening_run_completed",
  completionId: "opening-1",
  createdAt: createdAtA,
});
const idB = createDailyRingActivityEventId({
  userId: "user-1",
  localDate: "2026-07-04",
  source: "opening_run_completed",
  completionId: "opening-1",
  createdAt: createdAtB,
});

assert.equal(idA, idB);
assert.equal(createAllRingsClosedEventId("user-1", "2026-07-04"), "all-rings:user-1:2026-07-04");
assert.equal(createStreakMilestoneEventId("user-1", "2026-07-04", 7, 7), "streak-7:user-1:2026-07-04:7");

const event = createDailyRingActivityEvent({
  userId: "user-1",
  localDate: "2026-07-04",
  source: "daily_blundr_deck_completed",
  ringId: "daily_blundr",
  completionId: "daily-1",
  pointsAwarded: 5,
  xpAwarded: 50,
  createdAt: createdAtA,
});

assert.equal(event.id, "user-1:2026-07-04:daily_blundr_deck_completed:daily-1");
assert.equal(event.pointsAwarded, 5);
assert.equal(event.xpAwarded, 50);

console.log("dailyRingEvents.test.ts passed");
