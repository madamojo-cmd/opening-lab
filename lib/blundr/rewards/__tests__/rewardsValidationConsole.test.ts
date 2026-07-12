import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { isPresentationOnlyPreview, isRewardsValidationViewport, isVariableTempoRewardType, REWARDS_VALIDATION_VIEWPORTS, VARIABLE_TEMPO_REWARD_TYPES } from "../../../../components/dev/rewardsValidationModel";

const source = readFileSync(new URL("../../../../components/dev/RewardsValidationConsole.tsx", import.meta.url), "utf8");
assert.deepEqual([...REWARDS_VALIDATION_VIEWPORTS], [375, 390, 414]);
assert.deepEqual([...VARIABLE_TEMPO_REWARD_TYPES], ["unlock_points", "opening_fragment", "choice_token", "future_reward"]);
assert.equal(isRewardsValidationViewport(390), true);
assert.equal(isVariableTempoRewardType("future_reward"), true);
assert.equal(isPresentationOnlyPreview({ kind: "reward", title: "preview", rarity: "common", rewardType: "unlock_points", amount: 1, description: "preview" }), true);
assert.doesNotMatch(source, /service_role|service-role|refresh_token|authorization\s*:/i);
assert.doesNotMatch(source, /targetUserId\s*=/);
assert.match(source, /Preview card/);
assert.match(source, /Execute eligible transaction/);
console.log("rewardsValidationConsole.test.ts passed");
