import assert from "node:assert/strict";

import { applyAllRingsClosedDay, createDefaultStreakRecord, getStreakMilestoneBonuses, isConsecutiveLocalDateWrapper } from "../streakService";

const day1 = applyAllRingsClosedDay(createDefaultStreakRecord("user-1", "2026-07-04T08:00:00.000Z"), "2026-07-04", "2026-07-04T08:00:00.000Z");
assert.equal(day1.currentStreakDays, 1);
assert.equal(day1.longestStreakDays, 1);
assert.equal(day1.totalAllRingsClosedDays, 1);

const sameDay = applyAllRingsClosedDay(day1, "2026-07-04", "2026-07-04T09:00:00.000Z");
assert.equal(sameDay.currentStreakDays, 1);
assert.equal(sameDay.totalAllRingsClosedDays, 1);

const day2 = applyAllRingsClosedDay(day1, "2026-07-05", "2026-07-05T08:00:00.000Z");
assert.equal(day2.currentStreakDays, 2);
assert.equal(day2.longestStreakDays, 2);
assert.equal(day2.totalAllRingsClosedDays, 2);
assert.equal(isConsecutiveLocalDateWrapper("2026-07-04", "2026-07-05"), true);

const sevenDayRecord = {
  ...day2,
  currentStreakDays: 7,
  longestStreakDays: 7,
  totalAllRingsClosedDays: 7,
};
assert.equal(getStreakMilestoneBonuses(sevenDayRecord, "2026-07-10").length, 1);

const resetAfterGap = applyAllRingsClosedDay(
  {
    ...day2,
    lastCompletedLocalDate: "2026-07-01",
  },
  "2026-07-10",
  "2026-07-10T08:00:00.000Z",
);
assert.equal(resetAfterGap.currentStreakDays, 1);

console.log("streakService.test.ts passed");
