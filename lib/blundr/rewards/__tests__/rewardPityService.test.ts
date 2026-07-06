import assert from "node:assert/strict";

import { REWARD_PITY_THRESHOLD, buildPityRewardTriggerEventId, isPityRewardEligible, shouldIncrementPityForAllRingsDay, shouldResetPityAfterReward } from "../rewardPityService";
import { createDefaultRewardHistory } from "../../accounts/accountDefaults";

const history = createDefaultRewardHistory("user-1", "2026-07-01T00:00:00.000Z");
history.allRingsDaysSinceRandomReward = REWARD_PITY_THRESHOLD;
history.lastPityGuaranteeLocalDate = "2026-07-01";

assert.equal(isPityRewardEligible(history, "2026-07-06"), true);
assert.equal(isPityRewardEligible(history, "2026-07-01"), false);
assert.equal(shouldIncrementPityForAllRingsDay(false), true);
assert.equal(shouldIncrementPityForAllRingsDay(true), false);
assert.equal(shouldResetPityAfterReward("random_bonus"), true);
assert.equal(shouldResetPityAfterReward("guaranteed_cache"), false);
assert.equal(shouldResetPityAfterReward("pity_bonus"), true);
assert.equal(buildPityRewardTriggerEventId("user-1", "2026-07-06", 7), "reward-roll:pity:user-1:2026-07-06:7");

console.log("rewardPityService.test.ts passed");

