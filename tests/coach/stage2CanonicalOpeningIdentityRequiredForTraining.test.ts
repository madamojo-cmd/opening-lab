import assert from "node:assert/strict";

import { buildTrainerFrameResolution } from "../../lib/blundr/debug/buildTrainerFrameResolution";
import { resolveStage2TerminalProof } from "../../lib/blundr/runtime/terminalProof";

export function testStage2CanonicalOpeningIdentityRequiredForTraining(): void {
  const proof = resolveStage2TerminalProof({
    trainingMode: "restricted",
    isUserTurn: false,
    userExplicitlyEnteredContinuation: false,
    selectedOpeningId: "ruy-white",
    selectedLineId: "ruy-white",
    runtimeOpeningId: "ruy-lopez-white",
    selectedOpeningRuntimeAvailable: false,
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
  assert.equal(proof.blockedReasons.includes("noncanonical_selected_opening"), true);
  assert.equal(proof.blockedReasons.includes("selected_opening_runtime_unavailable"), true);
  assert.equal(proof.blockedReasons.includes("stale_branch_complete_latch"), true);

  const frame = buildTrainerFrameResolution({
    trainerFrameId: 11,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: false,
    selectedOpeningId: "ruy-white",
    selectedLineId: "ruy-white",
    runtimeBookOpeningId: "ruy-lopez-white",
    selectedOpeningRuntimeAvailable: false,
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
    terminalProof: proof,
  } as any);

  assert.equal(frame.openingIdentity?.canonicalSelectedOpeningId, "ruy-lopez-white");
  assert.equal(frame.openingIdentity?.openingIdentityMatched, false);
  assert.equal(frame.finalSurfaceAuthority?.branchCompleteAllowedByTerminalProof, false);
}

testStage2CanonicalOpeningIdentityRequiredForTraining();
console.log("stage2CanonicalOpeningIdentityRequiredForTraining ok");
