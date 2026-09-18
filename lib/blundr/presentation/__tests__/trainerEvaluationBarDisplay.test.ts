import assert from "node:assert/strict";

import {
  resolveTrainerEvaluationBarDisplay,
  resolveTrainerEvaluationDisplay,
} from "../trainerEvaluationDisplay.ts";

const readyEvaluation = resolveTrainerEvaluationDisplay(0)!;

assert.deepEqual(
  resolveTrainerEvaluationBarDisplay({
    enabled: true,
    confirmedEvaluation: readyEvaluation,
    state: "ready",
  }),
  {
    state: "ready",
    label: "Equal",
    whitePercent: 50,
    blackPercent: 50,
  },
);

assert.deepEqual(
  resolveTrainerEvaluationBarDisplay({
    enabled: true,
    confirmedEvaluation: null,
    state: "pending",
  }),
  {
    state: "pending",
    label: "—",
  },
);

assert.equal(
  resolveTrainerEvaluationBarDisplay({
    enabled: true,
    confirmedEvaluation: null,
    state: "pending",
  })?.label,
  "—",
);
assert.equal(
  resolveTrainerEvaluationBarDisplay({
    enabled: true,
    confirmedEvaluation: null,
    state: "pending",
  })?.label.includes("Equal"),
  false,
);
assert.equal(
  resolveTrainerEvaluationBarDisplay({
    enabled: true,
    confirmedEvaluation: readyEvaluation,
    state: "ready",
  })?.state,
  "ready",
);
assert.deepEqual(
  resolveTrainerEvaluationBarDisplay({
    enabled: true,
    confirmedEvaluation: readyEvaluation,
    state: "unavailable",
  }),
  {
    state: "unavailable",
    label: "Unavailable",
    whitePercent: readyEvaluation!.whitePercent,
    blackPercent: readyEvaluation!.blackPercent,
  },
);
assert.equal(
  resolveTrainerEvaluationBarDisplay({
    enabled: false,
    confirmedEvaluation: readyEvaluation,
    state: "ready",
  }),
  null,
);

console.log("trainerEvaluationBarDisplay ok");
