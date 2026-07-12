import assert from "node:assert/strict";
import { comparePreviewState, isPresentationOnlyPreview, isRewardsValidationViewport, isVariableTempoRewardType, REWARDS_VALIDATION_VIEWPORTS, VARIABLE_TEMPO_REWARD_TYPES } from "../../../../components/dev/rewardsValidationModel";
const base = { repertoire: { availablePoints: 10, unlockedOpeningIds: ["a"] }, rewardInventory: { openingFragments: 1, choiceTokens: 0 }, rewardHistory: { appliedRewardIds: [], allRingsDaysSinceRandomReward: 0 }, daily: { tempo: { current: 0 }, battery: { current: 0 }, blundr: { current: 0 } } };

assert.deepEqual(REWARDS_VALIDATION_VIEWPORTS, [375, 390, 414]);
assert.equal(isRewardsValidationViewport(375), true);
assert.equal(isRewardsValidationViewport(412), false);
assert.equal(isVariableTempoRewardType("future_reward"), true);
assert.equal(isVariableTempoRewardType("coins"), false);
assert.equal(VARIABLE_TEMPO_REWARD_TYPES.length, 4);
assert.equal(isPresentationOnlyPreview({ kind: "failure", title: "x", code: "x", message: "x" }), true);
assert.equal(comparePreviewState(base, base).message, "No mutation detected");
const changed = { ...base, repertoire: { ...base.repertoire, availablePoints: 9 } };
assert.equal(comparePreviewState(base, changed).message, "Unexpected mutation detected");
console.log("rewardsValidationModel.test.ts passed");
