import assert from "node:assert/strict";

import { buildTrainerDebugSnapshot } from "../../lib/blundr/debug/trainerDebugSnapshot";

export function testStage2TrueLineEndStillAllowsContinuationClick(): void {
  const snapshot = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 18,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: false,
    selectedOpeningId: "italian-white",
    selectedLineId: "italian-white",
    fen: "r2q1rk1/bpp2ppp/p1np1n2/4p3/4P3/1BPP1N2/PP1N1PPP/R1BQR1K1 b - - 16 10",
    instructionTargetUci: null,
    instructionTargetSan: null,
    branchTransitionSurfaceRendered: true,
    continueFromHereAvailable: true,
    continueFromHereButtonRendered: true,
    trainAgainButtonRendered: true,
    branchCompleteEligible: true,
    branchCompleteReason: "restricted_line_exhausted_after_final_known_move",
    branchCompleteBlockedReason: null,
    branchCompleteLineExhaustedEvidence: true,
    branchCompleteAfterFinalUserMove: true,
    restrictedLineExhaustedOnOpponentTurn: true,
    selectedLineExhausted: true,
    selectedLineExhaustionReason: "restricted_line_exhausted_after_final_known_move",
    selectedLineExhaustionBlockedReason: null,
    visibleTeachingSurface: {
      owner: "v28_visible_surface",
      mode: "branch_complete",
      coach: { shouldRender: true, title: "Line complete", body: "You finished this training line. Continue from this position or train the line again.", buttons: ["continue_from_here", "restart_line"] },
      visual: { lines: [] },
      actions: [{ kind: "continue_from_here" }, { kind: "restart_line" }],
      safety: { blocked: false, criticalIssues: [] },
      debug: { visibleCoachOwner: "visible_surface_v28", visibleVisualOwner: "visible_surface_v28", visibleActionOwner: "visible_surface_v28" },
    },
    presentationFrame: { coach: { shouldRender: true, owner: "branch_transition_surface", title: "Line complete", body: "You finished this training line. Continue from this position or train the line again.", buttons: ["continue_from_here", "restart_line"] }, visual: { shouldRender: false, source: "none" }, legacy: {} },
    coachDecision: { shouldShowCoachCard: true, title: "Line complete", body: "You finished this training line. Continue from this position or train the line again.", buttons: ["continue_from_here", "restart_line"], debug: { coachDecisionSource: "branch_transition_surface" } },
    actualCoachCardTitle: "Line complete",
    actualCoachCardBody: "You finished this training line. Continue from this position or train the line again.",
    actualCoachCardButtons: ["continue_from_here", "restart_line"],
    actualCoachCardSource: "surfaceCoachCardDecision",
    actualVisualSource: "visible_surface_v28",
    renderedActionIds: ["continue_from_here", "restart_line"],
    surfaceActionIds: ["continue_from_here", "restart_line"],
    renderedVisualPrimitiveCount: 0,
    surfaceVisualPrimitiveCount: 0,
    coachQuality: { qualityScore: 90, qualityScoreSource: "final_rendered", source: "final_rendered", targetAligned: false, pieceAligned: false, usedFallback: false, containsDebugLeak: false },
    eventLog: [],
  } as any);

  assert.equal((snapshot.frame as any)?.branchTransitionSurfaceRendered, true);
  assert.equal((snapshot.frame as any)?.continueFromHereAvailable, true);
  assert.equal((snapshot.coach as any)?.visibleButtons.includes("continue_from_here"), true);
}

testStage2TrueLineEndStillAllowsContinuationClick();
console.log("stage2TrueLineEndStillAllowsContinuationClick ok");
