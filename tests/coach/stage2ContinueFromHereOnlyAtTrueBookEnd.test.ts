import assert from "node:assert/strict";

import { buildTrainerDebugSnapshot } from "../../lib/blundr/debug/trainerDebugSnapshot";

export function testStage2ContinueFromHereOnlyAtTrueBookEnd(): void {
  const before = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 4,
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
    runtimeBookBookExhausted: false,
    branchTransitionSurfaceRendered: false,
    continueFromHereAvailable: false,
    continueFromHereButtonRendered: false,
    branchCompleteEligible: false,
    branchCompleteReason: null,
    selectedLineExhausted: false,
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

  assert.equal((before.coach as any)?.visibleButtons.includes("continue_from_here"), false);
  assert.equal((before.frame as any)?.branchTransitionSurfaceRendered, false);

  const end = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 18,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: false,
    fen: "r1bq1rk1/bpp2ppp/p1np1n2/4p3/4P3/1BPP1N2/PP1N1PPP/R1BQR1K1 b - - 16 10",
    expectedMoveResolution: {
      source: "guided_branch_needs_continuation",
      reason: "repertoire_line_exhausted_needs_continuation",
      expectedMoveUci: null,
      expectedMoveSan: null,
      candidateMoves: [],
      lineCursor: 5,
      lineLength: 5,
      shouldTransitionToContinuation: true,
      debug: { exactFenNodeFound: true, transpositionNodeFound: true },
    },
    instructionTargetUci: null,
    instructionTargetSan: null,
    instructionTargetPieceType: null,
    runtimeBookBookExhausted: true,
    branchTransitionSurfaceRendered: true,
    continueFromHereAvailable: true,
    continueFromHereButtonRendered: true,
    selectedLineExhausted: true,
    selectedLineExhaustionReason: "selected_line_exhausted",
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
    coachDecision: { shouldShowCoachCard: true, title: "Line complete", body: "You finished this training line. Continue from this position or train the line again.", buttons: ["continue_from_here", "restart_line"], debug: { coachDecisionSource: "branch_transition_surface", coachQuality: { qualityScore: 90, targetAligned: false, pieceAligned: false, containsDebugLeak: false } } },
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

  assert.equal((end.coach as any)?.visibleButtons.includes("continue_from_here"), true);
  assert.equal((end.frame as any)?.branchTransitionSurfaceRendered, true);
}

testStage2ContinueFromHereOnlyAtTrueBookEnd();
console.log("stage2ContinueFromHereOnlyAtTrueBookEnd ok");
