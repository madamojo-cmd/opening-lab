import assert from "node:assert/strict";

import { buildTrainerDebugSnapshot } from "../../lib/blundr/debug/trainerDebugSnapshot";

export function testStage2BookEndTransitionsToContinuationOnlyAfterUserClick(): void {
  const beforeClick = buildTrainerDebugSnapshot({
    debugEnabled: true,
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    trainerFrameId: 88,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: false,
    userExplicitlyEnteredContinuation: false,
    selectedOpeningId: "italian-white",
    selectedLineId: "italian-white:0",
    selectedRuntimeLineId: "italian-white:0",
    runtimeBookQueried: true,
    runtimeBookOpeningId: "italian-white",
    runtimeBookPlayKeyBefore: "e2e4,e7e5,g1f3,b8c6,f1c4",
    runtimeBookStatus: "ready",
    runtimeBookCandidateCount: 0,
    runtimeBookBookExhausted: true,
    branchTransitionSurfaceRendered: false,
    continueFromHereAvailable: false,
    continueFromHereButtonRendered: false,
    branchCompleteEligible: false,
    branchCompleteReason: null,
    branchCompleteBlockedReason: null,
    selectedLineCompleteConfirmed: true,
    explicitCuratedTerminalNode: false,
    exactNodeHasChildren: false,
    hasNextOpponentMove: false,
    hasNextUserMove: false,
    visibleTeachingSurface: {
      owner: "v28_visible_surface",
      mode: "guided_move",
      coach: { shouldRender: true, title: "Book complete", body: "You finished this training line.", buttons: ["continue_from_here", "restart_line"] },
      visual: { lines: [] },
      actions: [{ kind: "continue_from_here" }, { kind: "restart_line" }],
      safety: { blocked: false, criticalIssues: [] },
      debug: { visibleCoachOwner: "visible_surface_v28", visibleVisualOwner: "visible_surface_v28", visibleActionOwner: "visible_surface_v28" },
    },
    presentationFrame: {
      coach: { shouldRender: true, owner: "branch_transition_surface", title: "Book complete", body: "You finished this training line.", buttons: ["continue_from_here", "restart_line"] },
      visual: { shouldRender: false, source: "none" },
      legacy: {},
    },
    coachDecision: {
      shouldShowCoachCard: true,
      title: "Book complete",
      body: "You finished this training line.",
      buttons: ["continue_from_here", "restart_line"],
      debug: { coachDecisionSource: "branch_transition_surface", coachMoveUci: null, coachPieceType: null, coachQuality: { qualityScore: 90, targetAligned: false, pieceAligned: false, containsDebugLeak: false } },
    },
    actualCoachCardTitle: "Book complete",
    actualCoachCardBody: "You finished this training line.",
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

  const afterClick = buildTrainerDebugSnapshot({
    debugEnabled: true,
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    trainerFrameId: 89,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "continuation",
    isUserTurn: false,
    userExplicitlyEnteredContinuation: true,
    continueFromHereClicked: true,
    continueFromHereClickHandled: true,
    continueFromHereClickBlockedReason: null,
    continuationSessionId: "continuation-session-1",
    selectedOpeningId: "italian-white",
    selectedLineId: "italian-white:0",
    selectedRuntimeLineId: "italian-white:0",
    runtimeBookQueried: true,
    runtimeBookOpeningId: "italian-white",
    runtimeBookPlayKeyBefore: "e2e4,e7e5,g1f3,b8c6,f1c4",
    runtimeBookStatus: "ready",
    runtimeBookCandidateCount: 0,
    runtimeBookBookExhausted: true,
    branchTransitionSurfaceRendered: false,
    continueFromHereAvailable: false,
    continueFromHereButtonRendered: false,
    branchCompleteEligible: false,
    branchCompleteReason: null,
    branchCompleteBlockedReason: null,
    selectedLineCompleteConfirmed: true,
    explicitCuratedTerminalNode: true,
    exactNodeHasChildren: false,
    hasNextOpponentMove: false,
    hasNextUserMove: false,
    visibleTeachingSurface: {
      owner: "v28_visible_surface",
      mode: "guided_move",
      coach: { shouldRender: true, title: "Continuation mode active", body: "Continue from this exact position.", buttons: [] },
      visual: { lines: [] },
      actions: [],
      safety: { blocked: false, criticalIssues: [] },
      debug: { visibleCoachOwner: "visible_surface_v28", visibleVisualOwner: "visible_surface_v28", visibleActionOwner: "visible_surface_v28" },
    },
    presentationFrame: {
      coach: { shouldRender: true, owner: "visible_surface_v28", title: "Continuation mode active", body: "Continue from this exact position.", buttons: [] },
      visual: { shouldRender: false, source: "none" },
      legacy: {},
    },
    coachDecision: {
      shouldShowCoachCard: true,
      title: "Continuation mode active",
      body: "Continue from this exact position.",
      buttons: [],
      debug: { coachDecisionSource: "visible_surface_v28", coachMoveUci: null, coachPieceType: null, coachQuality: { qualityScore: 90, targetAligned: false, pieceAligned: false, containsDebugLeak: false } },
    },
    actualCoachCardTitle: "Continuation mode active",
    actualCoachCardBody: "Continue from this exact position.",
    actualCoachCardButtons: [],
    actualCoachCardSource: "visible_surface_v28",
    actualVisualSource: "visible_surface_v28",
    renderedActionIds: [],
    surfaceActionIds: [],
    renderedVisualPrimitiveCount: 0,
    surfaceVisualPrimitiveCount: 0,
    coachQuality: { qualityScore: 90, qualityScoreSource: "final_rendered", source: "final_rendered", targetAligned: false, pieceAligned: false, usedFallback: false, containsDebugLeak: false },
    eventLog: [],
  } as any);

  assert.equal((beforeClick.frame as any)?.terminalProof?.proven, false);
  assert.equal((beforeClick.frame as any)?.branchTransitionSurfaceRendered, false);
  assert.equal((beforeClick.frame as any)?.continueFromHereAvailable, false);
  assert.equal((beforeClick.coach as any)?.visibleTitle, "Book complete");

  assert.equal((afterClick.frame as any)?.terminalProof?.proven, false);
  assert.equal((afterClick.frame as any)?.branchTransitionSurfaceRendered, false);
  assert.equal((afterClick.frame as any)?.continueFromHereAvailable, false);
  assert.equal((afterClick.frame as any)?.trainingMode, "continuation");
  assert.equal((afterClick.frame as any)?.userExplicitlyEnteredContinuation, true);
  assert.equal((afterClick.frame as any)?.continueFromHereClickHandled, true);
  assert.equal((afterClick.coach as any)?.visibleTitle, "Continuation mode active");
}

testStage2BookEndTransitionsToContinuationOnlyAfterUserClick();
console.log("stage2BookEndTransitionsToContinuationOnlyAfterUserClick ok");
