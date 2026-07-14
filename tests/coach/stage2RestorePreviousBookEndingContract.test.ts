import assert from "node:assert/strict";

import { buildTrainerDebugSnapshot } from "../../lib/blundr/debug/trainerDebugSnapshot";
import { resolveBranchCompleteContract } from "../../lib/blundr/runtime/branchCompleteContract";

export function testStage2RestorePreviousBookEndingContract(): void {
  const expectedMoveExists = resolveBranchCompleteContract({
    trainingMode: "restricted",
    trainerPhase: "ready_for_user",
    isUserTurn: true,
    userExplicitlyEnteredContinuation: false,
    isTerminal: false,
    hasInstructionTarget: true,
    hasContinuationCandidate: false,
    pendingOpponentRequestExists: false,
    expectedMoveSource: "lesson_line",
    expectedMoveReason: "exact_fen_repertoire_node",
    expectedMoveUci: "g1f3",
    lineExhaustedByCursor: false,
    lineExhaustedByLichess: false,
    afterFinalUserMove: false,
    selectedLineId: "italian-white",
    fen4: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR",
    lastUserMoveUci: null,
    lastUserMoveSan: null,
    exactNodeHasChildren: true,
    hasNextOpponentMove: true,
    hasNextUserMove: true,
    explicitCuratedTerminalNode: false,
    validBranchCompleteLatch: true,
  });

  assert.equal(expectedMoveExists.branchCompleteEligible, false);
  assert.equal(
    // A prior latch is stale while the exact runtime node still has a verified next move.
    ["opponent_reply_expected", "next_user_target_exists", "selected_line_not_exhausted", "exact_node_has_children", "stale_branch_complete_latch"].includes(String(expectedMoveExists.branchCompleteBlockedReason)),
    true,
  );
  assert.equal(expectedMoveExists.selectedLineExhausted, false);

  const snapshot = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 4,
    currentPly: 2,
    currentMoveIndex: 1,
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
    runtimeBookTopCandidateUci: null,
    runtimeBookTopCandidateSan: null,
    runtimeBookTopCandidateRank: null,
    runtimeBookTopCandidateGames: null,
    runtimeBookTopCandidatePlayPct: null,
    runtimeBookBookExhausted: false,
    runtimeBookFallbackUsed: false,
    runtimeBookFallbackAuthority: null,
    branchTransitionSurfaceRendered: false,
    branchTransitionReason: null,
    continueFromHereAvailable: false,
    continueFromHereButtonRendered: false,
    trainAgainButtonRendered: false,
    branchCompleteEligible: false,
    branchCompleteReason: null,
    branchCompleteBlockedReason: null,
    branchCompleteLineExhaustedEvidence: false,
    branchCompleteAfterFinalUserMove: false,
    restrictedLineExhaustedOnOpponentTurn: false,
    branchCompleteRecoveredFromOpponentTurn: false,
    blockedOpponentRequestInRestrictedExhaustedLine: false,
    selectedLineExhausted: false,
    selectedLineExhaustionReason: null,
    selectedLineExhaustionBlockedReason: null,
    exactNodeHasChildren: true,
    hasNextOpponentMove: true,
    hasNextUserMove: true,
    knownFinalFenMatched: false,
    knownFinalMoveMatched: false,
    finalGuidedUserMoveCompletedLine: false,
    explicitCuratedTerminalNode: false,
    pendingOpponentRequestConflict: false,
    pendingOpponentRequestCancelledForBranchComplete: false,
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
      coach: { shouldRender: true, owner: "intent_first_coach", title: "Nf3 — Develop the knight", body: "Develop the knight.", buttons: [] },
      visual: { shouldRender: true, source: "visible_surface_v28" },
      legacy: {},
    },
    coachDecision: {
      shouldShowCoachCard: true,
      title: "Nf3 — Develop the knight",
      body: "Develop the knight.",
      buttons: [],
      debug: { coachDecisionSource: "live_coach", coachMoveUci: "g1f3", coachPieceType: "n", coachQuality: { qualityScore: 90, targetAligned: true, pieceAligned: true, containsDebugLeak: false } },
    },
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

  assert.equal((snapshot.coach as any)?.visibleTitle, "Nf3 — Develop the knight");
  assert.equal((snapshot.frame as any)?.instructionTargetUci, "g1f3");
  assert.equal((snapshot.frame as any)?.branchTransitionSurfaceRendered, false);
  assert.equal((snapshot.frame as any)?.continueFromHereAvailable, false);
  assert.equal((snapshot.featureTrace as any)?.frameKind !== "branch_complete", true);
}

testStage2RestorePreviousBookEndingContract();
console.log("stage2RestorePreviousBookEndingContract ok");
