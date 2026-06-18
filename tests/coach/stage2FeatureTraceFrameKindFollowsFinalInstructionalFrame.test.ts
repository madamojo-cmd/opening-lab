import assert from "node:assert/strict";

import { buildTrainerDebugSnapshot } from "../../lib/blundr/debug/trainerDebugSnapshot";

export function testStage2FeatureTraceFrameKindFollowsFinalInstructionalFrame(): void {
  const snapshot = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 4,
    currentPly: 2,
    currentMoveIndex: 1,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: true,
    fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
    expectedMoveResolution: {
      source: "lesson_line",
      reason: "exact_fen_repertoire_node",
      expectedMoveUci: "g1f3",
      expectedMoveSan: "Nf3",
      candidateMoves: [{ uci: "g1f3", san: "Nf3" }],
      lineCursor: 2,
      lineLength: 5,
      shouldTransitionToContinuation: false,
      debug: { exactFenNodeFound: true, transpositionNodeFound: true },
    },
    instructionTargetUci: "g1f3",
    instructionTargetSan: "Nf3",
    instructionTargetPieceType: "n",
    acceptedTargetUci: "g1f3",
    coachMoveUci: "g1f3",
    coachPieceType: "n",
    visualMoveUci: "g1f3",
    visualRecipeMoveUci: "g1f3",
    visualRecipeMoveSan: "Nf3",
    visualRecipeTargetMatchesInstructionTarget: true,
    runtimeBookBookExhausted: false,
    branchTransitionSurfaceRendered: false,
    continueFromHereAvailable: false,
    branchCompleteEligible: false,
    visibleTeachingSurface: {
      owner: "v28_visible_surface",
      mode: "guided_move",
      coach: { shouldRender: true, title: "Nf3 — Develop the knight", body: "Develop the knight.", buttons: [] },
      visual: { lines: [] },
      actions: [],
      safety: { blocked: false, criticalIssues: [] },
      debug: { visibleCoachOwner: "visible_surface_v28", visibleVisualOwner: "visible_surface_v28", visibleActionOwner: "visible_surface_v28" },
    },
    presentationFrame: { coach: { shouldRender: true, owner: "intent_first_coach", title: "Nf3 — Develop the knight", body: "Develop the knight.", buttons: [] }, visual: { shouldRender: true, source: "visible_surface_v28" }, legacy: {} },
    coachDecision: { shouldShowCoachCard: true, title: "Nf3 — Develop the knight", body: "Develop the knight.", buttons: [], debug: { coachDecisionSource: "live_coach", coachMoveUci: "g1f3", coachPieceType: "n", coachQuality: { qualityScore: 90, targetAligned: true, pieceAligned: true, containsDebugLeak: false } } },
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

  assert.notEqual((snapshot.featureTrace as any)?.frameKind, "branch_complete");
  assert.equal((snapshot.featureTrace as any)?.targetUci, "g1f3");
  assert.equal((snapshot.featureTrace as any)?.finalRenderedTitle, (snapshot.coach as any)?.visibleTitle);
  assert.equal((snapshot.featureTrace as any)?.finalRenderedBody, (snapshot.coach as any)?.visibleBody);
}

testStage2FeatureTraceFrameKindFollowsFinalInstructionalFrame();
console.log("stage2FeatureTraceFrameKindFollowsFinalInstructionalFrame ok");
