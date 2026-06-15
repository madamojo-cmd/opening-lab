import assert from "node:assert/strict";

import { resolveBranchCompleteContract } from "../branchCompleteContract";

export function testRestrictedLineExhaustionContract(): void {
  const afterNf3 = resolveBranchCompleteContract({
    trainingMode: "restricted",
    trainerPhase: "opponent_replying",
    isUserTurn: false,
    userExplicitlyEnteredContinuation: false,
    isTerminal: false,
    hasInstructionTarget: false,
    hasContinuationCandidate: false,
    pendingOpponentRequestExists: false,
    expectedMoveSource: "none",
    expectedMoveReason: "restricted_book_exhausted_on_opponent_turn_after_user_move",
    expectedMoveUci: null,
    lineExhaustedByCursor: true,
    lineExhaustedByLichess: false,
    afterFinalUserMove: true,
    selectedLineId: "italian-white",
    fen4: "rnbqkb1r/pp1n1ppp/4p3/2ppP3/3P1P2/2N2N2/PPP3PP/R1BQKB1R b KQkq -",
    lastUserMoveUci: "g1f3",
    lastUserMoveSan: "Nf3",
    exactNodeHasChildren: false,
    hasNextOpponentMove: false,
    hasNextUserMove: false,
    explicitCuratedTerminalNode: false,
    validBranchCompleteLatch: false,
  });

  assert.equal(afterNf3.branchCompleteEligible, true);
  assert.equal(afterNf3.shouldPreventOpponentScheduling, true);
  assert.equal(afterNf3.shouldRenderBranchCompleteSurface, true);
  assert.deepEqual(afterNf3.requiredSurfaceActionIds, ["continue_from_here", "restart_line"]);
}

testRestrictedLineExhaustionContract();
console.log("restrictedLineExhaustionContract ok");
