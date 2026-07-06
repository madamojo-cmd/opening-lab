import assert from "node:assert/strict";

import { createDefaultRewardHistory, createDefaultRewardRoll } from "../../accounts/accountDefaults";
import { resetLocalAccountState, getLocalRewardHistory, getLocalRewardRolls } from "../../accounts/localAccountStorage";
import { applyRewardHistoryBatch, loadRewardHistorySnapshot, persistRewardHistoryLocally } from "../rewardHistoryService";

resetLocalAccountState("user-1");

const history = createDefaultRewardHistory("user-1", "2026-07-01T00:00:00.000Z");

const incremented = applyRewardHistoryBatch(history, {
  localDate: "2026-07-06",
  allRingsClosedThisAction: true,
  randomBonusGranted: false,
  now: "2026-07-06T12:00:00.000Z",
});

assert.equal(incremented.allRingsDaysSinceRandomReward, 1);
assert.equal(incremented.randomBonusPityCounter, 1);

const reward = {
  id: "reward-1",
  rarity: "common" as const,
  rewardType: "unlock_points" as const,
  amount: 5,
  displayName: "Common bonus",
  description: "+5 repertoire points.",
};

const roll = createDefaultRewardRoll("user-1", "weekly_cache", "seed-1", "2026-07-06T12:00:00.000Z", true, reward, "reward-cache:weekly:user-1:2026-07-06:7");
const snapshot = persistRewardHistoryLocally("user-1", incremented, [roll]);

assert.equal(snapshot.history.userId, "user-1");
assert.equal(snapshot.rewardRolls.length, 1);
assert.equal(getLocalRewardHistory("user-1")?.allRingsDaysSinceRandomReward, 1);
assert.equal(getLocalRewardRolls("user-1")[0].id, "reward-cache:weekly:user-1:2026-07-06:7");

const loaded = loadRewardHistorySnapshot("user-1");
assert.equal(loaded.history.userId, "user-1");
assert.equal(loaded.rewardRolls.length, 1);

console.log("rewardHistoryService.test.ts passed");

