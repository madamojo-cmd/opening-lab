import assert from "node:assert/strict";

import { DAILY_TRAINING_TARGET_REGISTRY, getDailyTrainingTargetDefinition } from "../trainingTargets/dailyTrainingTargetRegistry";

export function testDailyTrainingTargetRegistry(): void {
  assert.equal(DAILY_TRAINING_TARGET_REGISTRY.length, 5);
  assert.deepEqual(DAILY_TRAINING_TARGET_REGISTRY.map((definition) => definition.id), [
    "reply_radar",
    "opening_branch_builder",
    "opponent_reply_trainer",
    "break_timing_drill",
    "key_square_click",
  ]);

  for (const definition of DAILY_TRAINING_TARGET_REGISTRY) {
    const lookup = getDailyTrainingTargetDefinition(definition.id);
    assert.ok(lookup);
    assert.equal(lookup?.id, definition.id);
    assert.equal(typeof lookup?.generate, "function");
    assert.equal(typeof lookup?.scoreAttempt, "function");
  }

  assert.equal(getDailyTrainingTargetDefinition("reply_radar")?.title, "Reply Radar");
}

testDailyTrainingTargetRegistry();
console.log("dailyTrainingTargetRegistry ok");
