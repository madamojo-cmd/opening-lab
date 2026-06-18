import assert from "node:assert/strict";

import { buildTrainerDebugSnapshot } from "../../lib/blundr/debug/trainerDebugSnapshot";

export function testStage2RuntimeBookNotExhaustedWhenExpectedMoveExists(): void {
  const snapshot = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 7,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: true,
    fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
    selectedOpeningId: "italian-white",
    selectedLineId: "italian-white",
    expectedMoveResolution: {
      source: "lesson_line",
      reason: "exact_fen_repertoire_node",
      expectedMoveUci: "g1f3",
      expectedMoveSan: "Nf3",
      candidateMoves: [{ uci: "g1f3", san: "Nf3" }],
      lineCursor: 2,
      lineLength: 5,
      shouldTransitionToContinuation: false,
      debug: { exactFenNodeFound: true, transpositionNodeFound: false },
    },
    runtimeBookQueried: false,
    runtimeBookOpeningId: "italian-white",
    runtimeBookPlayKeyBefore: "e2e4,e7e5",
    runtimeBookStatus: "idle",
    runtimeBookCandidateCount: 0,
    runtimeBookBookExhausted: false,
    runtimeBookFallbackUsed: false,
    runtimeBookFallbackAuthority: null,
    coachDecision: {
      shouldShowCoachCard: true,
      title: "Nf3 — Develop the knight",
      body: "Develop the knight.",
      buttons: [],
      debug: { coachDecisionSource: "live_coach", coachMoveUci: "g1f3", coachPieceType: "n", coachQuality: { qualityScore: 90, targetAligned: true, pieceAligned: true, containsDebugLeak: false } },
    },
    visibleTeachingSurface: {
      owner: "v28_visible_surface",
      mode: "guided_move",
      coach: { shouldRender: true, title: "Nf3 — Develop the knight", body: "Develop the knight.", buttons: [] },
      visual: { lines: [] },
      actions: [],
      safety: { blocked: false, criticalIssues: [] },
      debug: { visibleCoachOwner: "visible_surface_v28", visibleVisualOwner: "visible_surface_v28", visibleActionOwner: "visible_surface_v28" },
    },
    presentationFrame: {
      visual: { shouldRender: true, source: "visible_surface_v28" },
      coach: { shouldRender: true, owner: "intent_first_coach", title: "Nf3 — Develop the knight", body: "Develop the knight.", buttons: [] },
      legacy: {},
    },
    actualCoachCardTitle: "Nf3 — Develop the knight",
    actualCoachCardBody: "Develop the knight.",
    actualCoachCardButtons: [],
    actualCoachCardSource: "surfaceCoachCardDecision",
    actualVisualSource: "visible_surface_v28",
    renderedVisualPrimitiveCount: 0,
    surfaceVisualPrimitiveCount: 0,
    coachQuality: { qualityScore: 90, qualityScoreSource: "final_rendered", source: "final_rendered", targetAligned: true, pieceAligned: true, usedFallback: false, containsDebugLeak: false },
    eventLog: [],
  } as any);

  assert.equal((snapshot.continuation as any)?.runtimeBookQueried, false);
  assert.equal((snapshot.continuation as any)?.runtimeBookCandidateCount, 0);
  assert.equal((snapshot.continuation as any)?.runtimeBookBookExhausted, false);
  assert.equal((snapshot.health.criticalIssues ?? []).includes("premature_branch_complete_rendered"), false);
}

testStage2RuntimeBookNotExhaustedWhenExpectedMoveExists();
console.log("stage2RuntimeBookNotExhaustedWhenExpectedMoveExists ok");
