import assert from "node:assert/strict";

import { resolveTrainerEvaluationDisplay } from "../trainerEvaluationDisplay";

assert.equal(resolveTrainerEvaluationDisplay(undefined), null);
assert.equal(resolveTrainerEvaluationDisplay(Number.NaN), null);
assert.deepEqual(resolveTrainerEvaluationDisplay(0), {
  whitePercent: 50,
  blackPercent: 50,
  label: "Equal",
});
assert.equal(resolveTrainerEvaluationDisplay(72)?.label, "White +0.7");
assert.equal(resolveTrainerEvaluationDisplay(-214)?.label, "Black +2.1");

console.log("trainerEvaluationDisplay ok");
