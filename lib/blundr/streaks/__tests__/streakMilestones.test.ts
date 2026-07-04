import assert from "node:assert/strict";

import { buildStreakMilestoneEventId, getAllStreakMilestones, getStreakMilestoneByDays, getStreakMilestoneBonusesForStreakDays } from "../streakMilestones";

assert.equal(getAllStreakMilestones().length, 2);
assert.equal(getStreakMilestoneByDays(7)?.pointsAwarded, 35);
assert.equal(getStreakMilestoneByDays(30)?.xpAwarded, 1000);

const bonus7 = getStreakMilestoneBonusesForStreakDays({
  userId: "user-1",
  localDate: "2026-07-10",
  currentStreakDays: 7,
});
assert.equal(bonus7.length, 1);
assert.equal(bonus7[0].eventId, buildStreakMilestoneEventId("user-1", "2026-07-10", 7, 7));

const bonus30 = getStreakMilestoneBonusesForStreakDays({
  userId: "user-1",
  localDate: "2026-08-01",
  currentStreakDays: 30,
  alreadyAwardedEventIds: [buildStreakMilestoneEventId("user-1", "2026-08-01", 30, 30)],
});
assert.equal(bonus30.length, 0);

console.log("streakMilestones.test.ts passed");
