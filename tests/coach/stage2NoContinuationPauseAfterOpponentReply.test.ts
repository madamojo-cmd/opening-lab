import assert from "node:assert/strict";

import { buildTrainerDebugSnapshot } from "../../lib/blundr/debug/trainerDebugSnapshot";

export function testStage2NoContinuationPauseAfterOpponentReply(): void {
  const snapshot = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 5,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: true,
    selectedOpeningId: "italian-white",
    selectedLineId: "italian-white",
    fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
    instructionTargetUci: "g1f3",
    instructionTargetSan: "Nf3",
    branchTransitionSurfaceRendered: false,
    continueFromHereAvailable: false,
    continueFromHereButtonRendered: false,
    selectedLineExhausted: false,
    selectedLineExhaustionReason: null,
    transitionToContinuationAllowed: false,
    pendingOpponentRequest: null,
    visibleTeachingSurface: {
      owner: "v28_visible_surface",
      mode: "guided_move",
      coach: { shouldRender: true, title: "Nf3 — Develop the knight", body: "Develop the knight.", buttons: [] },
      visual: { lines: [] },
      actions: [],
      safety: { blocked: false, criticalIssues: [] },
      debug: { visibleCoachOwner: "visible_surface_v28", visibleVisualOwner: "visible_surface_v28", visibleActionOwner: "visible_surface_v28" },
    },
    presentationFrame: { visual: { shouldRender: true, source: "visible_surface_v28" }, coach: { shouldRender: true, owner: "intent_first_coach", title: "Nf3 — Develop the knight", body: "Develop the knight.", buttons: [] }, legacy: {} },
    coachDecision: { shouldShowCoachCard: true, title: "Nf3 — Develop the knight", body: "Develop the knight.", buttons: [], debug: { coachDecisionSource: "live_coach" } },
    actualCoachCardTitle: "Nf3 — Develop the knight",
    actualCoachCardBody: "Develop the knight.",
    actualCoachCardButtons: [],
    actualCoachCardSource: "surfaceCoachCardDecision",
    actualVisualSource: "visible_surface_v28",
    renderedActionIds: [],
    surfaceActionIds: [],
    renderedVisualPrimitiveCount: 0,
    surfaceVisualPrimitiveCount: 0,
    coachQuality: { qualityScore: 90, qualityScoreSource: "final_rendered", source: "final_rendered", targetAligned: true, pieceAligned: true, usedFallback: false, containsDebugLeak: false },
    eventLog: [],
  } as any);

  assert.equal((snapshot.frame as any)?.branchTransitionSurfaceRendered, false);
  assert.equal((snapshot.frame as any)?.continueFromHereAvailable, false);
  assert.equal((snapshot.coach as any)?.visibleTitle.includes("Line complete"), false);
  assert.equal((snapshot.frame as any)?.transitionToContinuationAllowed, false);
}

testStage2NoContinuationPauseAfterOpponentReply();
console.log("stage2NoContinuationPauseAfterOpponentReply ok");
