import assert from "node:assert/strict";

import { buildRewardReward, deterministicRandom, getRewardRarityWeightTotal, pickRewardAmount, pickRewardRarity, pickRewardTypeForRarity } from "../rewardRarity";

const seed = "user-1:reward-roll:ring:user-1:2026-07-06:daily_tempo:daily_tempo";

assert.equal(deterministicRandom(seed), deterministicRandom(seed));
assert.equal(getRewardRarityWeightTotal(), 100);
assert.equal(pickRewardRarity(seed, "rare"), "rare");
assert.equal(pickRewardTypeForRarity("rare"), "choice_token");

const commonAmount = pickRewardAmount("common", seed);
assert.ok(commonAmount === 5 || commonAmount === 10, `Unexpected common reward amount: ${commonAmount}`);

const epicReward = buildRewardReward({
  triggerEventId: "reward-cache:weekly:user-1:2026-07-06:7",
  trigger: "weekly_cache",
  userId: "user-1",
  forcedRarity: "epic",
  grantLabel: "7-day streak cache",
  grantModeLabel: "guaranteed cache",
});

assert.equal(epicReward.rarity, "epic");
assert.equal(epicReward.rewardType, "unlock_points");
assert.equal(epicReward.amount, 100);
assert.ok(epicReward.displayName.toLowerCase().includes("epic"));

console.log("rewardRarity.test.ts passed");

