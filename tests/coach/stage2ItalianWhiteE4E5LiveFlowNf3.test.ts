import assert from "node:assert/strict";

import { buildTrainerDebugSnapshot } from "../../lib/blundr/debug/trainerDebugSnapshot";

export function testStage2ItalianWhiteE4E5LiveFlowNf3(): void {
  const snapshot = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 6,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: true,
    selectedOpeningId: "italian-white",
    selectedLineId: "italian-white",
    activeLineName: "Italian Game",
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
    runtimeBookQueried: false,
    runtimeBookOpeningId: "italian-white",
    runtimeBookPlayKeyBefore: "e2e4,e7e5",
    runtimeBookStatus: "idle",
    runtimeBookCandidateCount: 0,
    runtimeBookBookExhausted: false,
    runtimeBookFallbackUsed: false,
    runtimeBookFallbackAuthority: null,
    branchTransitionSurfaceRendered: false,
    continueFromHereAvailable: false,
    continueFromHereButtonRendered: false,
    selectedLineExhausted: false,
    selectedLineExhaustionReason: null,
    exactNodeHasChildren: true,
    hasNextOpponentMove: true,
    hasNextUserMove: true,
    explicitCuratedTerminalNode: false,
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

  assert.equal((snapshot.frame as any)?.instructionTargetUci, "g1f3");
  assert.equal((snapshot.frame as any)?.branchTransitionSurfaceRendered, false);
  assert.equal((snapshot.frame as any)?.continueFromHereAvailable, false);
  assert.equal((snapshot.coach as any)?.visibleTitle, "Nf3 — Develop the knight");
  assert.equal((snapshot.coach as any)?.visibleTitle.includes("Line complete"), false);
}

testStage2ItalianWhiteE4E5LiveFlowNf3();
console.log("stage2ItalianWhiteE4E5LiveFlowNf3 ok");
