import assert from "node:assert/strict";

import { REWARD_RESET_BUTTONS } from "../../../../components/dev/RewardsResetPanel";
import { REWARD_TRIGGER_BUTTONS } from "../../../../components/dev/RewardsTriggerPanel";

const triggerLabels = REWARD_TRIGGER_BUTTONS.map((button) => button.label);
const resetLabels = REWARD_RESET_BUTTONS.map((button) => button.label);

assert.equal(REWARD_TRIGGER_BUTTONS.length, 36);
assert.equal(REWARD_RESET_BUTTONS.length, 9);

const requiredTriggerLabels = [
  "Trigger Tempo increment",
  "Trigger Tempo complete",
  "Trigger Battery increment",
  "Trigger Battery complete",
  "Trigger Blundr increment",
  "Trigger Blundr complete",
  "Trigger all-three-rings-complete celebration",
  "Grant opening fragment",
  "Grant 3 opening fragments",
  "Grant 6 opening fragments",
  "Grant choice token",
  "Spend 3 fragments on selected opening",
  "Spend choice token on selected opening",
  "Grant epic bonus",
  "Show Reward Popup: common",
  "Show Reward Popup: uncommon",
  "Show Reward Popup: rare",
  "Show Reward Popup: epic",
  "Show Opening Fragment Reward",
  "Show Choice Token Reward",
  "Show Epic Bonus Reward",
  "Show Repertoire Points Reward",
];

for (const label of requiredTriggerLabels) {
  assert.equal(triggerLabels.includes(label), true, `Missing trigger button label: ${label}`);
}

assert.equal(REWARD_TRIGGER_BUTTONS.some((button) => /auto-unlock/i.test(button.label)), false);
assert.equal(REWARD_TRIGGER_BUTTONS.some((button) => /coin/i.test(button.label)), false);
assert.equal(REWARD_RESET_BUTTONS.every((button) => button.label.startsWith("Dev-only:")), true);
assert.equal(resetLabels.includes("Dev-only: Reset opening fragments only"), true);
assert.equal(resetLabels.includes("Dev-only: Reset choice tokens only"), true);
assert.equal(resetLabels.includes("Dev-only: Reset reward history only"), true);

console.log("rewardsValidationPageModel.test.ts passed");
