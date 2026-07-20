import assert from "node:assert/strict";
import test from "node:test";

import {
  isBatteryCompletionEligible,
  isTempoCompletionEligible,
} from "../trainingCompletionEligibility";

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

test("a committed legal continuation rep closes one Battery activity", () => {
  assert.equal(
    isBatteryCompletionEligible({
      trainingMode: "continuation",
      userEnteredContinuation: true,
      moveUci: "c2c3",
      legal: true,
      stale: false,
    }),
    true,
  );
});

test("restricted, absent, illegal, and stale continuation moves cannot close Battery", () => {
  for (const input of [
    {
      trainingMode: "restricted" as const,
      userEnteredContinuation: true,
      moveUci: "c2c3",
      legal: true,
      stale: false,
    },
    {
      trainingMode: "continuation" as const,
      userEnteredContinuation: false,
      moveUci: "c2c3",
      legal: true,
      stale: false,
    },
    {
      trainingMode: "continuation" as const,
      userEnteredContinuation: true,
      moveUci: null,
      legal: true,
      stale: false,
    },
    {
      trainingMode: "continuation" as const,
      userEnteredContinuation: true,
      moveUci: "c2c3",
      legal: false,
      stale: false,
    },
    {
      trainingMode: "continuation" as const,
      userEnteredContinuation: true,
      moveUci: "c2c3",
      legal: true,
      stale: true,
    },
  ]) {
    assert.equal(isBatteryCompletionEligible(input), false);
  }
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
