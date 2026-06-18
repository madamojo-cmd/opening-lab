import assert from "node:assert/strict";

import { resolveBranchCompleteContract } from "../../lib/blundr/runtime/branchCompleteContract";

export function testStage2ExpectedMovePreventsBookEnding(): void {
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
    lineExhaustedByCursor: false,
    lineExhaustedByLichess: false,
    afterFinalUserMove: false,
    selectedLineId: "italian-white",
    fen4: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR",
    lastUserMoveUci: null,
    lastUserMoveSan: null,
    exactNodeHasChildren: true,
    hasNextOpponentMove: true,
    hasNextUserMove: true,
    explicitCuratedTerminalNode: false,
    validBranchCompleteLatch: true,
  });

  assert.equal(contract.branchCompleteEligible, false);
  assert.equal(
    ["opponent_reply_expected", "next_user_target_exists", "selected_line_not_exhausted", "exact_node_has_children"].includes(String(contract.branchCompleteBlockedReason)),
    true,
  );
  assert.equal(contract.shouldRenderBranchCompleteSurface, false);
}

testStage2ExpectedMovePreventsBookEnding();
console.log("stage2ExpectedMovePreventsBookEnding ok");
