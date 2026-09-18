import assert from "node:assert/strict";
import test from "node:test";

import { normalizeDailyBlundrCardGoalPreference } from "../trainingPreferences.ts";

test("prefers explicit dailyBlundrCardGoal within range", () => {
  assert.equal(
    normalizeDailyBlundrCardGoalPreference(
      { dailyBlundrCardGoal: 12, dailyBlundrGoal: 99 },
      10,
    ),
    12,
  );
});

test("clamps explicit dailyBlundrCardGoal to 1-99", () => {
  assert.equal(
    normalizeDailyBlundrCardGoalPreference({ dailyBlundrCardGoal: 0 }, 10),
    10,
  );
  assert.equal(
    normalizeDailyBlundrCardGoalPreference({ dailyBlundrCardGoal: 99 }, 10),
    99,
  );
  assert.equal(
    normalizeDailyBlundrCardGoalPreference({ dailyBlundrCardGoal: 120 }, 10),
    10,
  );
});

test("uses legacy dailyBlundrGoal when card-goal is missing and meaningful", () => {
  assert.equal(
    normalizeDailyBlundrCardGoalPreference(
      { dailyBlundrCardGoal: undefined, dailyBlundrGoal: 8 },
      10,
    ),
    8,
  );
});

test("ignores legacy dailyBlundrGoal=1 and falls back to default", () => {
  assert.equal(
    normalizeDailyBlundrCardGoalPreference(
      { dailyBlundrCardGoal: undefined, dailyBlundrGoal: 1 },
      10,
    ),
    10,
  );
});

