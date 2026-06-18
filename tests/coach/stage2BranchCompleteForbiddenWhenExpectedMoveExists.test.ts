import assert from "node:assert/strict";

import { resolveBranchCompleteContract } from "../../lib/blundr/runtime/branchCompleteContract";

export function testStage2BranchCompleteForbiddenWhenExpectedMoveExists(): void {
  const contract = resolveBranchCompleteContract({
    trainingMode: "restricted",
    trainerPhase: "ready_for_user",
    isUserTurn: true,
    userExplicitlyEnteredContinuation: false,
    isTerminal: false,
    hasInstructionTarget: true,
    hasContinuationCandidate: false,
    pendingOpponentRequestExists: false,
    expectedMoveSource: "lesson_line",
    expectedMoveReason: "exact_fen_repertoire_node",
    expectedMoveUci: "g1f3",
    lineExhaustedByCursor: true,
    lineExhaustedByLichess: false,
    afterFinalUserMove: false,
    selectedLineId: "italian-white",
    fen4: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -",
    lastUserMoveUci: "e7e5",
    lastUserMoveSan: "e5",
    exactNodeHasChildren: true,
    hasNextOpponentMove: true,
    hasNextUserMove: false,
    explicitCuratedTerminalNode: false,
    validBranchCompleteLatch: false,
  });

  assert.equal(contract.branchCompleteEligible, false);
  assert.equal(contract.shouldRenderBranchCompleteSurface, false);
  assert.equal(contract.shouldPreventOpponentScheduling, false);
  assert.equal(contract.blockedReason, "next_user_target_exists");
}

testStage2BranchCompleteForbiddenWhenExpectedMoveExists();
console.log("stage2BranchCompleteForbiddenWhenExpectedMoveExists ok");
