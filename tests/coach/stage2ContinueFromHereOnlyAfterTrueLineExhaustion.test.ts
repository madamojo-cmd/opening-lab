import assert from "node:assert/strict";

import { resolveBranchCompleteContract } from "../../lib/blundr/runtime/branchCompleteContract";

export function testStage2ContinueFromHereOnlyAfterTrueLineExhaustion(): void {
  const contract = resolveBranchCompleteContract({
    trainingMode: "restricted",
    trainerPhase: "ready_for_user",
    isUserTurn: false,
    userExplicitlyEnteredContinuation: false,
    isTerminal: false,
    hasInstructionTarget: false,
    hasContinuationCandidate: false,
    pendingOpponentRequestExists: true,
    expectedMoveSource: "none",
    expectedMoveReason: "restricted_book_exhausted_on_opponent_turn_after_user_move",
    expectedMoveUci: null,
    lineExhaustedByCursor: true,
    lineExhaustedByLichess: false,
    afterFinalUserMove: true,
    selectedLineId: "italian-white",
    fen4: "r2q1rk1/bpp2ppp/p1np1n2/4p3/4P3/1BPP1N2/PP1N1PPP/R1BQR1K1 b - -",
    lastUserMoveUci: "g1f3",
    lastUserMoveSan: "Nf3",
    exactNodeHasChildren: false,
    hasNextOpponentMove: false,
    hasNextUserMove: false,
    explicitCuratedTerminalNode: false,
    validBranchCompleteLatch: false,
  });

  assert.equal(contract.branchCompleteEligible, true);
  assert.equal(contract.shouldRenderBranchCompleteSurface, true);
  assert.equal(contract.shouldPreventOpponentScheduling, true);
  assert.deepEqual(contract.requiredSurfaceActionIds, ["continue_from_here", "restart_line"]);
}

testStage2ContinueFromHereOnlyAfterTrueLineExhaustion();
console.log("stage2ContinueFromHereOnlyAfterTrueLineExhaustion ok");
