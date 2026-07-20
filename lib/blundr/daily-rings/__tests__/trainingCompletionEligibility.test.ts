import assert from "node:assert/strict";
import test from "node:test";

import { isTempoCompletionEligible } from "../trainingCompletionEligibility";

test("authoritative restricted branch completion closes Tempo", () => {
  assert.equal(
    isTempoCompletionEligible({
      trainingMode: "restricted",
      bookComplete: false,
      branchCompleteEligible: true,
      terminalProof: true,
    }),
    true,
  );
});

test("partial, unproven, and continuation states cannot close Tempo", () => {
  assert.equal(
    isTempoCompletionEligible({
      trainingMode: "restricted",
      bookComplete: false,
      branchCompleteEligible: true,
      terminalProof: false,
    }),
    false,
  );
  assert.equal(
    isTempoCompletionEligible({
      trainingMode: "continuation",
      bookComplete: true,
      branchCompleteEligible: true,
      terminalProof: true,
    }),
    false,
  );
});
