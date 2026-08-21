import assert from "node:assert/strict";

import {
  resolveTrainerEvaluationBarDisplay,
  resolveTrainerEvaluationDisplay,
} from "../trainerEvaluationDisplay";

const currentFen = "8/8/8/8/8/8/8/K6k w - - 0 1";
const readyEvaluation = resolveTrainerEvaluationDisplay(0);

assert.deepEqual(
  resolveTrainerEvaluationBarDisplay({
    enabled: true,
    currentFen,
    evaluationFen: currentFen,
    evaluation: readyEvaluation,
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
    currentFen,
    evaluationFen: currentFen,
    evaluation: null,
    state: "pending",
  }),
  {
    state: "pending",
    label: "Analyzing",
  },
);

assert.equal(
  resolveTrainerEvaluationBarDisplay({
    enabled: true,
    currentFen,
    evaluationFen: currentFen,
    evaluation: null,
    state: "pending",
  })?.label,
  "Analyzing",
);
assert.equal(
  resolveTrainerEvaluationBarDisplay({
    enabled: true,
    currentFen,
    evaluationFen: currentFen,
    evaluation: null,
    state: "pending",
  })?.label.includes("Equal"),
  false,
);
assert.equal(
  resolveTrainerEvaluationBarDisplay({
    enabled: true,
    currentFen,
    evaluationFen: "8/8/8/8/8/8/8/K6k b - - 1 1",
    evaluation: readyEvaluation,
    state: "ready",
  })?.state,
  "pending",
);
assert.deepEqual(
  resolveTrainerEvaluationBarDisplay({
    enabled: true,
    currentFen,
    evaluationFen: currentFen,
    evaluation: null,
    state: "unavailable",
  }),
  {
    state: "unavailable",
    label: "Unavailable",
  },
);
assert.equal(
  resolveTrainerEvaluationBarDisplay({
    enabled: false,
    currentFen,
    evaluationFen: currentFen,
    evaluation: readyEvaluation,
    state: "ready",
  }),
  null,
);

console.log("trainerEvaluationBarDisplay ok");
