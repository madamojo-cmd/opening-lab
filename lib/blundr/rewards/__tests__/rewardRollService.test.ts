import assert from "node:assert/strict";

import { evaluateRewardRoll, buildRewardTriggerEventId, getRewardTriggerChance } from "../rewardRollService";

const context = {
  userId: "user-1",
  localDate: "2026-07-06",
  trigger: "weekly_cache" as const,
  triggerEventId: buildRewardTriggerEventId({
    userId: "user-1",
    localDate: "2026-07-06",
    trigger: "weekly_cache",
    streakDays: 7,
  }),
  streakDays: 7,
  now: "2026-07-06T12:00:00.000Z",
};

assert.equal(getRewardTriggerChance("daily_tempo_ring_closed"), 0.01);

const first = evaluateRewardRoll(context, []);
assert.equal(first.didReward, true);
assert.equal(first.grantMode, "guaranteed_cache");
assert.equal(first.roll.id, context.triggerEventId);

const second = evaluateRewardRoll(context, [first.roll]);
assert.equal(second.didReward, true);
assert.equal(second.roll.id, context.triggerEventId);
assert.equal(second.roll.seed, first.roll.seed);

assert.equal(buildRewardTriggerEventId({
  userId: "user-1",
  localDate: "2026-07-06",
  trigger: "daily_tempo_ring_closed",
  ringId: "daily_tempo",
}), "reward-roll:ring:user-1:2026-07-06:daily_tempo");

console.log("rewardRollService.test.ts passed");
