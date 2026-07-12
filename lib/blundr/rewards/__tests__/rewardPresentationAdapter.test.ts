import assert from "node:assert/strict";
import { adaptRewardGrantToPresentation, type RewardPresentationSource } from "../rewardPresentationAdapter";

function grant(rewardType: string, rarity: RewardPresentationSource["rarity"] = "common", amount = 12): RewardPresentationSource {
  return { id: `grant-${rewardType}`, rewardId: `reward-${rewardType}`, rewardRollId: "roll", trigger: "weekly_cache", triggerEventId: `event-${rewardType}`, rarity, rewardType, amount, displayName: "", description: "", pointsApplied: rewardType === "unlock_points" ? amount : 0, applied: true, pendingChoice: false, grantMode: "guaranteed_cache", createdAt: "2026-07-10T00:00:00.000Z" };
}

assert.equal(adaptRewardGrantToPresentation(grant("unlock_points")).rewardType, "repertoire_points");
assert.equal(adaptRewardGrantToPresentation(grant("opening_fragment", "uncommon", 1)).displayName, "Opening Fragment");
assert.equal(adaptRewardGrantToPresentation(grant("choice_token", "rare", 1)).rewardType, "choice_token");
const epic = adaptRewardGrantToPresentation(grant("unlock_points", "epic", 50));
assert.equal(epic.rewardType, "epic_bonus");
assert.equal(epic.displayName, "Repertoire Points");
const unknown = adaptRewardGrantToPresentation(grant("future_reward", "common", 3));
assert.equal(unknown.rewardType, "unknown");
assert.equal(unknown.rawRewardType, "future_reward");
assert.throws(() => adaptRewardGrantToPresentation(grant("unlock_points", "common", 0)), RangeError);
console.log("rewardPresentationAdapter.test.ts passed");
