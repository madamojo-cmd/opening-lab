import assert from "node:assert/strict";

import { buildTrainerDebugSnapshot } from "../../lib/blundr/debug/trainerDebugSnapshot";

export function testStage2NoContinuationAtLearnerMove3OfRuntime6(): void {
  const snapshot = buildTrainerDebugSnapshot({
    debugEnabled: true,
    fen: "r1bqk2r/ppp2ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 w kq - 0 6",
    trainerFrameId: 733,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: true,
    userExplicitlyEnteredContinuation: false,
    selectedOpeningId: "italian-white",
    selectedLineId: "italian-white:0",
    selectedRuntimeLineId: "italian-white:0",
    selectedRuntimeLineKey: "italian-white:0:e2e4,e7e5,g1f3,b8c6,f1c4,f8c5",
    selectedRuntimeLinePlayKey: "e2e4,e7e5,g1f3,b8c6,f1c4,f8c5",
    selectedRuntimeLinePlaySequenceUci: ["e2e4", "e7e5", "g1f3", "b8c6", "f1c4", "f8c5"],
    selectedRuntimeLinePlyLength: 6,
    selectedRuntimeLineCurrentPly: 3,
    selectedRuntimeLineExhausted: false,
    selectedLineCompleteConfirmed: false,
    terminalProofLineAuthority: "selected_runtime_line_play_sequence_uci",
    terminalProofBlockedReason: "runtime_line_not_exhausted",
    runtimeBookQueried: true,
    runtimeBookOpeningId: "italian-white",
    runtimeBookPlayKeyBefore: "e2e4,e7e5,g1f3",
    runtimeBookStatus: "ready",
    runtimeBookCandidateCount: 2,
    runtimeBookTopCandidateUci: "b8c6",
    runtimeBookTopCandidateSan: "Nc6",
    runtimeBookBookExhausted: false,
    branchTransitionSurfaceRendered: false,
    continueFromHereAvailable: false,
    continueFromHereButtonRendered: false,
    branchCompleteEligible: false,
    branchCompleteReason: null,
    branchCompleteBlockedReason: null,
    explicitCuratedTerminalNode: false,
    exactNodeHasChildren: true,
    hasNextOpponentMove: true,
    hasNextUserMove: false,
    visibleTeachingSurface: {
      owner: "v28_visible_surface",
      mode: "guided_move",
      coach: { shouldRender: true, title: "Bc4", body: "Develop the bishop.", buttons: [] },
      visual: { lines: [] },
      actions: [],
      safety: { blocked: false, criticalIssues: [] },
      debug: {
        visibleCoachOwner: "visible_surface_v28",
        visibleVisualOwner: "visible_surface_v28",
        visibleActionOwner: "visible_surface_v28",
      },
    },
    presentationFrame: {
      coach: { shouldRender: true, owner: "intent_first_coach", title: "Bc4", body: "Develop the bishop.", buttons: [] },
      visual: { shouldRender: true, source: "fallback_current_surface" },
      legacy: {},
    },
    coachDecision: {
      shouldShowCoachCard: true,
      title: "Bc4",
      body: "Develop the bishop.",
      buttons: [],
      debug: {
        coachDecisionSource: "visible_surface_v28",
        coachMoveUci: "f1c4",
        coachPieceType: "b",
        coachQuality: { qualityScore: 90, targetAligned: true, pieceAligned: true, containsDebugLeak: false },
      },
    },
    actualCoachCardTitle: "Bc4",
    actualCoachCardBody: "Develop the bishop.",
    actualCoachCardButtons: [],
    actualCoachCardSource: "surfaceCoachCardDecision",
    actualVisualSource: "fallback_current_surface",
    renderedActionIds: [],
    surfaceActionIds: [],
    renderedVisualPrimitiveCount: 0,
    surfaceVisualPrimitiveCount: 0,
    coachQuality: {
      qualityScore: 90,
      qualityScoreSource: "final_rendered",
      source: "final_rendered",
      targetAligned: true,
      pieceAligned: true,
      usedFallback: false,
      containsDebugLeak: false,
    },
    eventLog: [],
  } as any);

  assert.equal((snapshot.runtime as any)?.selectedRuntimeLinePlyLength, 6);
  assert.equal((snapshot.runtime as any)?.selectedRuntimeLineCurrentPly, 3);
  assert.equal((snapshot.runtime as any)?.selectedRuntimeLineExhausted, false);
  assert.equal((snapshot.runtime as any)?.terminalProofLineAuthority, "selected_runtime_line_play_sequence_uci");
  assert.equal((snapshot.runtime as any)?.terminalProofBlockedReason, "runtime_line_not_exhausted");
  assert.equal((snapshot.frame as any)?.terminalProof?.proven, false);
  assert.equal((snapshot.frame as any)?.branchTransitionSurfaceRendered, false);
  assert.equal((snapshot.frame as any)?.continueFromHereButtonRendered, false);
  assert.equal((snapshot.frame as any)?.continueFromHereAvailable, false);
  assert.equal((snapshot.frame as any)?.trainerPhase, "ready_for_user");
}

testStage2NoContinuationAtLearnerMove3OfRuntime6();
console.log("stage2NoContinuationAtLearnerMove3OfRuntime6 ok");
