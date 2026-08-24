import assert from "node:assert/strict";

import {
  resolveTrainerEvaluationBarDisplay,
  resolveTrainerEvaluationDisplay,
} from "../trainerEvaluationDisplay.ts";

const readyEvaluation = resolveTrainerEvaluationDisplay(120)!;

const initial = resolveTrainerEvaluationBarDisplay({
  enabled: true,
  confirmedEvaluation: null,
  state: "pending",
});
assert.deepEqual(initial, {
  state: "pending",
  label: "—",
});

const ready = resolveTrainerEvaluationBarDisplay({
  enabled: true,
  confirmedEvaluation: readyEvaluation,
  state: "ready",
});
assert.deepEqual(ready, {
  state: "ready",
  label: readyEvaluation.label,
  whitePercent: readyEvaluation.whitePercent,
  blackPercent: readyEvaluation.blackPercent,
});

const retainedDuringPending = resolveTrainerEvaluationBarDisplay({
  enabled: true,
  confirmedEvaluation: readyEvaluation,
  state: "pending",
});
assert.deepEqual(retainedDuringPending, {
  state: "pending",
  label: "Updating",
  whitePercent: readyEvaluation.whitePercent,
  blackPercent: readyEvaluation.blackPercent,
});

const retainedDuringUnavailable = resolveTrainerEvaluationBarDisplay({
  enabled: true,
  confirmedEvaluation: readyEvaluation,
  state: "unavailable",
});
assert.deepEqual(retainedDuringUnavailable, {
  state: "unavailable",
  label: "Unavailable",
  whitePercent: readyEvaluation.whitePercent,
  blackPercent: readyEvaluation.blackPercent,
});

const disabled = resolveTrainerEvaluationBarDisplay({
  enabled: false,
  confirmedEvaluation: readyEvaluation,
  state: "ready",
});
assert.equal(disabled, null);

console.log("trainerEvaluationBarLifecycle ok");
