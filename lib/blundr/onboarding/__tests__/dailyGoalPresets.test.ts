import assert from "node:assert/strict";

import { getAllDailyGoalPresets, getDefaultDailyGoalPreset, getDailyGoalPresetById, normalizeDailyGoalPreset } from "../dailyGoalPresets";

assert.equal(getAllDailyGoalPresets().length, 3);
assert.equal(getDefaultDailyGoalPreset().id, "standard");
assert.equal(normalizeDailyGoalPreset("Light"), "light");
assert.equal(normalizeDailyGoalPreset("serious"), "serious");
assert.equal(getDailyGoalPresetById("standard")?.dailyTempoGoal, 10);

console.log("dailyGoalPresets.test.ts passed");
