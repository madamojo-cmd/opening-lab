import assert from "node:assert/strict";

import { resolveStage2TerminalProof } from "../../lib/blundr/runtime/terminalProof";

export function testStage2TerminalProofRejectsStaleBranchCompleteLatch(): void {
  const proof = resolveStage2TerminalProof({
    trainingMode: "restricted",
    isUserTurn: false,
    userExplicitlyEnteredContinuation: false,
    selectedOpeningId: "ruy-lopez-white",
    selectedLineId: "ruy-lopez-white",
    runtimeOpeningId: "ruy-lopez-white",
    selectedOpeningRuntimeAvailable: true,
    fen4: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR",
    lastUserMoveUci: "g1f3",
    lastUserMoveSan: "Nf3",
    afterFinalUserMove: true,
    explicitCuratedTerminalNode: false,
    selectedLineCompleteConfirmed: false,
    exactNodeHasChildren: "unknown",
    hasNextOpponentMove: "unknown",
    hasNextUserMove: "unknown",
    validBranchCompleteLatch: true,
    bookCompleteAllowed: true,
    guidedCompleteAllowed: true,
    runtimeBookBookExhausted: true,
    runtimeBookCandidateCount: 0,
    runtimeBookStatus: "ready",
  });

  assert.equal(proof.proven, false);
  assert.equal(proof.blockedReasons.includes("stale_branch_complete_latch"), true);
}

testStage2TerminalProofRejectsStaleBranchCompleteLatch();
console.log("stage2TerminalProofRejectsStaleBranchCompleteLatch ok");
