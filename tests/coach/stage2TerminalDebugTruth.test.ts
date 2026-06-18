import assert from "node:assert/strict";

import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
import { buildBoardTruth } from "../../lib/blundr/brain/providers/boardTruthProvider";
import { buildTrainerDebugSnapshot } from "../../lib/blundr/debug/trainerDebugSnapshot";

export function testStage2TerminalDebugTruth(): void {
  const frame = buildCurrentInstructionFrame({
    kind: "terminal",
    fenBefore: "r1bq1rk1/bpp2ppp/p1np1n2/4p3/4P3/1BPP1N2/PP1N1PPP/R1BQR1K1 b - -",
    ply: 17,
    sideToMove: "b",
    target: null,
    mode: "terminal",
    source: "terminal",
  });
  const boardTruth = buildBoardTruth({ frame });
  assert.equal(boardTruth.kingSquares.white, "g1");
  assert.equal(boardTruth.kingSquares.black, "g8");

  const snapshot = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 501,
    trainerPhase: "terminal",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: false,
    fen: "r1bq1rk1/bpp2ppp/p1np1n2/4p3/4P3/1BPP1N2/PP1N1PPP/R1BQR1K1 b - -",
    selectedOpeningId: "italian-white",
    selectedLineId: "italian-white",
    activeLineName: "Italian Game",
    lastUserMoveSan: "Nbd2",
    lastUserMoveUci: "b1d2",
    userExplicitlyEnteredContinuation: false,
    transitionToContinuationAllowed: false,
    prematureContinuationBlocked: false,
    runtimeBookQueried: false,
    runtimeBookOpeningId: "italian-white",
    runtimeBookPlayKeyBefore: "e2e4,e7e5,g1f3,b8c6,f1c4,f8c5,c2c3,g8f6,d2d4,c5d4",
    runtimeBookStatus: "ready",
    runtimeBookCandidateCount: 0,
    runtimeBookBookExhausted: true,
    runtimeBookFallbackUsed: false,
    runtimeBookFallbackAuthority: null,
    selectedLineExhausted: true,
    selectedLineExhaustionReason: "restricted_line_exhausted_after_final_known_move",
    selectedLineExhaustionBlockedReason: null,
    branchTransitionSurfaceRendered: true,
    branchTransitionPayloadValid: true,
    continueFromHereAvailable: true,
    continueFromHereButtonRendered: false,
    trainAgainButtonRendered: true,
    branchTransitionReason: "restricted_line_exhausted_after_final_known_move",
    branchCompleteAfterFinalUserMove: true,
    pendingOpponentRequest: null,
    visibleTeachingSurface: {
      mode: "terminal",
      owner: "terminal_surface",
      coach: {
        shouldRender: true,
        title: "Line complete",
        body: "You finished this training line.",
        buttons: ["restart_line"],
      },
      actions: ["restart_line"],
      visual: { lines: [] },
    },
    presentationFrame: {
      visual: { shouldRender: false, source: "none" },
      coach: {
        shouldRender: true,
        owner: "continuation_terminal_surface",
        intent: "branch_transition",
        title: "Line complete",
        body: "You finished this training line.",
        buttons: ["restart_line"],
      },
      legacy: {},
    },
    coachDecision: {
      shouldShowCoachCard: true,
      title: "Line complete",
      body: "You finished this training line.",
      buttons: ["restart_line"],
      debug: { coachDecisionSource: "surfaceCoachCardDecision" },
    },
    actualCoachCardTitle: "Line complete",
    actualCoachCardBody: "You finished this training line.",
    actualCoachCardButtons: ["restart_line"],
    actualCoachCardSource: "surfaceCoachCardDecision",
    actualVisualSource: "none",
    renderedActionIds: ["restart_line"],
    surfaceActionIds: ["restart_line"],
    renderedVisualPrimitiveCount: 0,
    surfaceVisualPrimitiveCount: 0,
    coachQuality: {
      qualityScore: 88,
      qualityScoreSource: "surfaceCoachCardDecision",
      usedFallback: false,
      targetAligned: true,
      pieceAligned: true,
      containsDebugLeak: false,
    },
    eventLog: [],
  } as any);

  assert.equal((snapshot.health.criticalIssues ?? []).includes("coach_card_debug_parity_mismatch"), false);
  assert.equal((snapshot.health.criticalIssues ?? []).includes("action_debug_parity_mismatch"), false);
  assert.equal((snapshot.health.criticalIssues ?? []).includes("coach_low_quality"), false);
  assert.equal((snapshot.health.criticalIssues ?? []).includes("terminal_surface_missing"), false);
  assert.equal((snapshot.coach as any)?.visibleTitle, "Line complete");
  assert.equal((snapshot.coach as any)?.visibleButtons?.includes("restart_line"), true);
}

testStage2TerminalDebugTruth();
console.log("stage2TerminalDebugTruth ok");
