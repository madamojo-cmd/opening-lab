import assert from "node:assert/strict";

import { buildTrainerDebugSnapshot } from "../../lib/blundr/debug/trainerDebugSnapshot";
import { resolveBranchCompleteContract } from "../../lib/blundr/runtime/branchCompleteContract";

export function testStage2TrueBookEndStillRendersBranchComplete(): void {
  const contract = resolveBranchCompleteContract({
    trainingMode: "restricted",
    trainerPhase: "ready_for_user",
    isUserTurn: false,
    userExplicitlyEnteredContinuation: false,
    isTerminal: false,
    hasInstructionTarget: false,
    hasContinuationCandidate: false,
    pendingOpponentRequestExists: false,
    expectedMoveSource: "guided_branch_needs_continuation",
    expectedMoveReason: "repertoire_line_exhausted_needs_continuation",
    expectedMoveUci: null,
    lineExhaustedByCursor: true,
    lineExhaustedByLichess: false,
    afterFinalUserMove: true,
    selectedLineId: "italian-white",
    fen4: "r1bq1rk1/bpp2ppp/p1np1n2/4p3/4P3/1BPP1N2/PP1N1PPP/R1BQR1K1",
    lastUserMoveUci: "b1d2",
    lastUserMoveSan: "Nbd2",
    exactNodeHasChildren: false,
    hasNextOpponentMove: false,
    hasNextUserMove: false,
    explicitCuratedTerminalNode: false,
    validBranchCompleteLatch: false,
  });

  assert.equal(contract.branchCompleteEligible, true);
  assert.equal(contract.shouldRenderBranchCompleteSurface, true);
  assert.equal(contract.requiredSurfaceActionIds.includes("continue_from_here"), true);

  const snapshot = buildTrainerDebugSnapshot({
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
    acceptedTargetUci: null,
    coachMoveUci: null,
    coachPieceType: null,
    visualMoveUci: null,
    visualRecipeMoveUci: null,
    runtimeBookQueried: true,
    runtimeBookOpeningId: "italian-white",
    runtimeBookPlayKeyBefore: "e2e4,e7e5,g1f3,b8c6,f1c4",
    runtimeBookStatus: "ready",
    runtimeBookCandidateCount: 0,
    runtimeBookBookExhausted: true,
    branchTransitionSurfaceRendered: true,
    branchTransitionReason: "restricted_book_exhausted_on_opponent_turn_after_user_move",
    continueFromHereAvailable: true,
    continueFromHereButtonRendered: true,
    trainAgainButtonRendered: true,
    branchCompleteEligible: true,
    branchCompleteReason: "selected_line_exhausted",
    branchCompleteBlockedReason: null,
    branchCompleteLineExhaustedEvidence: true,
    branchCompleteAfterFinalUserMove: true,
    restrictedLineExhaustedOnOpponentTurn: true,
    selectedLineExhausted: true,
    selectedLineExhaustionReason: "selected_line_exhausted",
    selectedLineExhaustionBlockedReason: null,
    exactNodeHasChildren: false,
    hasNextOpponentMove: false,
    hasNextUserMove: false,
    explicitCuratedTerminalNode: false,
    visibleTeachingSurface: {
      owner: "v28_visible_surface",
      mode: "branch_complete",
      coach: {
        shouldRender: true,
        title: "Line complete",
        body: "You finished this training line. Continue from this position or train the line again.",
        buttons: ["continue_from_here", "restart_line"],
      },
      visual: { lines: [] },
      actions: [{ kind: "continue_from_here" }, { kind: "restart_line" }],
      safety: { blocked: false, criticalIssues: [] },
      debug: { visibleCoachOwner: "visible_surface_v28", visibleVisualOwner: "visible_surface_v28", visibleActionOwner: "visible_surface_v28" },
    },
    presentationFrame: {
      coach: { shouldRender: true, owner: "branch_transition_surface", title: "Line complete", body: "You finished this training line. Continue from this position or train the line again.", buttons: ["continue_from_here", "restart_line"] },
      visual: { shouldRender: false, source: "none" },
      legacy: {},
    },
    coachDecision: {
      shouldShowCoachCard: true,
      title: "Line complete",
      body: "You finished this training line. Continue from this position or train the line again.",
      buttons: ["continue_from_here", "restart_line"],
      debug: { coachDecisionSource: "branch_transition_surface", coachMoveUci: null, coachPieceType: null, coachQuality: { qualityScore: 90, targetAligned: false, pieceAligned: false, containsDebugLeak: false } },
    },
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

  assert.equal((snapshot.coach as any)?.visibleTitle, "Line complete");
  assert.equal((snapshot.coach as any)?.visibleButtons.includes("continue_from_here"), true);
  assert.equal((snapshot.frame as any)?.branchTransitionSurfaceRendered, true);
}

testStage2TrueBookEndStillRendersBranchComplete();
console.log("stage2TrueBookEndStillRendersBranchComplete ok");
