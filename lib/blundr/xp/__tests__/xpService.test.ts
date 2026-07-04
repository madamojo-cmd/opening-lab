import assert from "node:assert/strict";

import { applyXpEvent, createXpEvent, getXpAwardForActivity, getXpAwardForAllRingsClosed, getXpAwardForStreakMilestone } from "../xpService";
import type { XpProgress } from "../xpTypes";

assert.equal(getXpAwardForActivity("opening_run_completed"), 10);
assert.equal(getXpAwardForActivity("continuation_completed"), 20);
assert.equal(getXpAwardForActivity("daily_blundr_deck_completed"), 50);
assert.equal(getXpAwardForAllRingsClosed(), 100);
assert.equal(getXpAwardForStreakMilestone(7), 250);
assert.equal(getXpAwardForStreakMilestone(30), 1000);

const progress: XpProgress = {
  userId: "user-1",
  localDate: "2026-07-04",
  xpEarnedToday: 0,
  xpLifetime: 0,
  eventIds: [],
  updatedAt: "2026-07-04T08:00:00.000Z",
};
const event = createXpEvent({
  userId: "user-1",
  source: "opening_run_completed",
  xp: 10,
  activityId: "opening-1",
  createdAt: "2026-07-04T08:00:00.000Z",
  localDate: "2026-07-04",
});
const applied = applyXpEvent(progress, event);
const duplicate = applyXpEvent(applied, event);

assert.equal(applied.xpEarnedToday, 10);
assert.equal(applied.xpLifetime, 10);
assert.equal(duplicate.xpEarnedToday, 10);
assert.equal(duplicate.xpLifetime, 10);

console.log("xpService.test.ts passed");
