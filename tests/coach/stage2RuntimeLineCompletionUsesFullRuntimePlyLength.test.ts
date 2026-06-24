import assert from "node:assert/strict";

import { buildTrainerDebugSnapshot } from "../../lib/blundr/debug/trainerDebugSnapshot";

function buildSnapshot(selectedRuntimeLineCurrentPly: number, selectedRuntimeLinePlyLength: number, branchTransitionSurfaceRendered: boolean, continueFromHereAvailable: boolean, visibleTitle: string) {
  return buildTrainerDebugSnapshot({
    debugEnabled: true,
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    trainerFrameId: 610,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: false,
    userExplicitlyEnteredContinuation: false,
    selectedOpeningId: "italian-white",
    selectedLineId: "italian-white:0",
    selectedRuntimeLineId: "italian-white:0",
    selectedRuntimeLineKey: "italian-white:0:e2e4,e7e5,g1f3,b8c6,f1c4,bc5",
    selectedRuntimeLinePlyLength,
    selectedRuntimeLineCurrentPly,
    selectedRuntimeLineExhausted: selectedRuntimeLineCurrentPly >= selectedRuntimeLinePlyLength,
    selectedLineCompleteConfirmed: selectedRuntimeLineCurrentPly >= selectedRuntimeLinePlyLength,
    terminalProofLineAuthority: "selected_runtime_line_play_sequence_uci",
    terminalProofBlockedReason: selectedRuntimeLineCurrentPly >= selectedRuntimeLinePlyLength ? null : "runtime_line_not_exhausted",
    runtimeBookQueried: true,
    runtimeBookOpeningId: "italian-white",
    runtimeBookPlayKeyBefore: "e2e4,e7e5,g1f3,b8c6,f1c4",
    runtimeBookStatus: "ready",
    runtimeBookCandidateCount: 0,
    runtimeBookBookExhausted: true,
    branchTransitionSurfaceRendered,
    continueFromHereAvailable,
    continueFromHereButtonRendered: continueFromHereAvailable,
    branchCompleteEligible: continueFromHereAvailable,
    branchCompleteReason: continueFromHereAvailable ? "selected_line_exhausted" : null,
    branchCompleteBlockedReason: null,
    selectedLineExhausted: selectedRuntimeLineCurrentPly >= selectedRuntimeLinePlyLength,
    explicitCuratedTerminalNode: selectedRuntimeLineCurrentPly >= selectedRuntimeLinePlyLength,
    exactNodeHasChildren: false,
    hasNextOpponentMove: false,
    hasNextUserMove: false,
    visibleTeachingSurface: {
      owner: "v28_visible_surface",
      mode: branchTransitionSurfaceRendered ? "branch_complete" : "guided_move",
      coach: { shouldRender: true, title: visibleTitle, body: visibleTitle, buttons: branchTransitionSurfaceRendered ? ["continue_from_here", "restart_line"] : [] },
      visual: { lines: [] },
      actions: branchTransitionSurfaceRendered ? [{ kind: "continue_from_here" }, { kind: "restart_line" }] : [],
      safety: { blocked: false, criticalIssues: [] },
      debug: { visibleCoachOwner: "visible_surface_v28", visibleVisualOwner: "visible_surface_v28", visibleActionOwner: "visible_surface_v28" },
    },
    presentationFrame: {
      coach: { shouldRender: true, owner: branchTransitionSurfaceRendered ? "branch_transition_surface" : "visible_surface_v28", title: visibleTitle, body: visibleTitle, buttons: branchTransitionSurfaceRendered ? ["continue_from_here", "restart_line"] : [] },
      visual: { shouldRender: false, source: "none" },
      legacy: {},
    },
    coachDecision: {
      shouldShowCoachCard: true,
      title: visibleTitle,
      body: visibleTitle,
      buttons: branchTransitionSurfaceRendered ? ["continue_from_here", "restart_line"] : [],
      debug: {
        coachDecisionSource: branchTransitionSurfaceRendered ? "branch_transition_surface" : "visible_surface_v28",
        coachMoveUci: null,
        coachPieceType: null,
        coachQuality: { qualityScore: 90, targetAligned: false, pieceAligned: false, containsDebugLeak: false },
      },
    },
    actualCoachCardTitle: visibleTitle,
    actualCoachCardBody: visibleTitle,
    actualCoachCardButtons: branchTransitionSurfaceRendered ? ["continue_from_here", "restart_line"] : [],
    actualCoachCardSource: branchTransitionSurfaceRendered ? "surfaceCoachCardDecision" : "visible_surface_v28",
    actualVisualSource: "visible_surface_v28",
    renderedActionIds: branchTransitionSurfaceRendered ? ["continue_from_here", "restart_line"] : [],
    surfaceActionIds: branchTransitionSurfaceRendered ? ["continue_from_here", "restart_line"] : [],
    renderedVisualPrimitiveCount: 0,
    surfaceVisualPrimitiveCount: 0,
    coachQuality: { qualityScore: 90, qualityScoreSource: "final_rendered", source: "final_rendered", targetAligned: false, pieceAligned: false, usedFallback: false, containsDebugLeak: false },
    eventLog: [],
  } as any);
}

export function testStage2RuntimeLineCompletionUsesFullRuntimePlyLength(): void {
  const threeOfSix = buildSnapshot(3, 6, false, false, "Book progress");
  assert.equal((threeOfSix.frame as any)?.terminalProof?.proven, false);
  assert.equal((threeOfSix.frame as any)?.branchTransitionSurfaceRendered, false);
  assert.equal((threeOfSix.frame as any)?.continueFromHereButtonRendered, false);
  assert.equal((threeOfSix.runtime as any)?.selectedRuntimeLinePlyLength, 6);
  assert.equal((threeOfSix.runtime as any)?.selectedRuntimeLineCurrentPly, 3);
  assert.equal((threeOfSix.runtime as any)?.selectedRuntimeLineExhausted, false);
  assert.equal((threeOfSix.runtime as any)?.terminalProofLineAuthority, "selected_runtime_line_play_sequence_uci");

  const sixOfSix = buildSnapshot(6, 6, true, true, "Line complete");
  assert.equal((sixOfSix.frame as any)?.terminalProof?.proven, true);
  assert.equal((sixOfSix.frame as any)?.branchTransitionSurfaceRendered, true);
  assert.equal((sixOfSix.frame as any)?.continueFromHereButtonRendered, true);
  assert.equal((sixOfSix.runtime as any)?.selectedRuntimeLinePlyLength, 6);
  assert.equal((sixOfSix.runtime as any)?.selectedRuntimeLineCurrentPly, 6);
  assert.equal((sixOfSix.runtime as any)?.selectedRuntimeLineExhausted, true);
}

testStage2RuntimeLineCompletionUsesFullRuntimePlyLength();
console.log("stage2RuntimeLineCompletionUsesFullRuntimePlyLength ok");
