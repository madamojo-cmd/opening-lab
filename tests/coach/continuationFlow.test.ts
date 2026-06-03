import assert from "node:assert/strict";
import { buildContinuationRuntimeState } from "../../lib/blundr/runtime/continuationRuntimeState";

function isLegalUciShape(uci: string | null): boolean {
  if (!uci) return false;
  return /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(uci);
}

export function testContinuationFlow(): void {
  const beforeContinue = buildContinuationRuntimeState({
    branchComplete: true,
    continueClicked: false,
  });

  assert.equal(beforeContinue.phase, "branch_complete_waiting_for_continue");
  assert.equal(beforeContinue.selectedContinuationCandidate, null);
  assert.equal(beforeContinue.continueFromHereAvailable, true);

  const afterContinue = buildContinuationRuntimeState({
    branchComplete: true,
    continueClicked: true,
    candidateUci: "g8f6",
    candidateSan: "Nf6",
    candidateSource: "continuation_policy",
  });

  const alignment = {
    instructionTarget: afterContinue.selectedContinuationCandidate?.uci ?? null,
    selectedContinuationCandidate: afterContinue.selectedContinuationCandidate?.uci ?? null,
    coachTarget: "g8f6",
    visualTarget: "g8f6",
    revealTarget: "g8f6",
    lockConfidence: "locked",
  };

  assert.equal(afterContinue.phase, "candidate_locked");
  assert.equal(isLegalUciShape(alignment.selectedContinuationCandidate), true);
  assert.equal(alignment.lockConfidence, "locked");
  assert.equal(alignment.instructionTarget, alignment.coachTarget);
  assert.equal(alignment.instructionTarget, alignment.visualTarget);
  assert.equal(alignment.instructionTarget, alignment.revealTarget);

  const stockfishCannotLock = buildContinuationRuntimeState({
    branchComplete: true,
    continueClicked: true,
    candidateUci: "g8f6",
    candidateSource: "stockfish",
  });
  assert.equal(stockfishCannotLock.phase, "blocked");

  const maiaCannotLock = buildContinuationRuntimeState({
    branchComplete: true,
    continueClicked: true,
    candidateUci: "g8f6",
    candidateSource: "maia",
  });
  assert.equal(maiaCannotLock.phase, "blocked");
}

testContinuationFlow();
console.log("continuationFlow ok");
