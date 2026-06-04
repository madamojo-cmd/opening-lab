import assert from "node:assert/strict";

import { resolveBranchCompleteContract } from "../../lib/blundr/runtime/branchCompleteContract";
import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
import { buildLiveVisibleTeachingSurface } from "../../lib/blundr/presentation/buildLiveVisibleTeachingSurface";
import { adaptVisibleSurfaceToCoachUi } from "../../lib/blundr/presentation/uiSurfaceAdapter";
import { buildTrainerDebugSnapshot } from "../../lib/blundr/debug/trainerDebugSnapshot";

function buildBranchCompleteUi() {
  const frame = buildCurrentInstructionFrame({
    kind: "branch_complete",
    fenBefore: "r2q1rk1/bpp2ppp/p1np1n2/4p3/4P3/1BPP1N2/PP1N1PPP/R1BQR1K1 b - - 1 11",
    ply: 21,
    sideToMove: "black",
    target: null,
    mode: "blocked",
    source: "none",
    branchComplete: {
      isComplete: true,
      reason: "restricted_line_exhausted_after_final_known_move",
      continueFromHereAvailable: true,
    },
  });
  const surface = buildLiveVisibleTeachingSurface({
    frame,
    requestedMode: "assisted",
    showMoreRevealed: false,
    branchComplete: true,
  });
  return adaptVisibleSurfaceToCoachUi(surface);
}

export function testRestrictedLineExhaustedBranchCompleteButtons(): void {
  const exhaustedContract = resolveBranchCompleteContract({
    trainingMode: "restricted",
    trainerPhase: "ready_for_user",
    isUserTurn: false,
    userExplicitlyEnteredContinuation: false,
    isTerminal: false,
    hasInstructionTarget: false,
    hasContinuationCandidate: false,
    pendingOpponentRequestExists: true,
    expectedMoveSource: "none",
    expectedMoveReason: "side_to_move_is_opponent",
    expectedMoveUci: null,
    lineExhaustedByCursor: false,
    lineExhaustedByLichess: false,
    afterFinalUserMove: true,
    selectedLineId: "italian-white",
    fen4: "r2q1rk1/bpp2ppp/p1np1n2/4p3/4P3/1BPP1N2/PP1N1PPP/R1BQR1K1 b - -",
    lastUserMoveUci: "g1f3",
    lastUserMoveSan: "Nf3",
    exactNodeHasChildren: true,
    hasNextOpponentMove: false,
    hasNextUserMove: true,
    explicitCuratedTerminalNode: false,
    validBranchCompleteLatch: false,
  });

  assert.equal(exhaustedContract.branchCompleteEligible, true);
  assert.equal(exhaustedContract.shouldRenderBranchCompleteSurface, true);
  assert.equal(exhaustedContract.shouldCancelPendingOpponent, true);

  const branchUi = buildBranchCompleteUi();
  assert.equal(branchUi.title.includes("Line complete"), true);
  assert.equal(branchUi.actions.some((action) => action.kind === "continue_from_here"), true);
  assert.equal(branchUi.targetUci, null);
  assert.notEqual(branchUi.title, "Opponent is replying");
  assert.notEqual(branchUi.title, "Status");

  const snapshot = buildTrainerDebugSnapshot({
    trainingMode: "restricted",
    trainerPhase: "ready_for_user",
    isUserTurn: false,
    fen: "r2q1rk1/bpp2ppp/p1np1n2/4p3/4P3/1BPP1N2/PP1N1PPP/R1BQR1K1 b - - 1 11",
    expectedMoveUci: null,
    instructionTargetUci: null,
    selectedCandidateUci: null,
    exactNodeHasChildren: true,
    hasNextOpponentMove: false,
    branchTransitionSurfaceRendered: true,
    visibleTeachingSurface: {
      mode: "branch_complete",
      owner: "v28_visible_surface",
      coach: { title: "Line complete", body: "You finished this training line." },
      actions: ["continue_from_here", "restart_line"],
    },
    presentationFrame: { coach: { shouldRender: true, title: "Line complete", body: "You finished this training line." }, visual: { shouldRender: false } },
  });
  assert.equal((snapshot.health.criticalIssues ?? []).includes("restricted_line_exhausted_without_branch_complete_buttons"), false);

  const knownOpponentReplyContract = resolveBranchCompleteContract({
    trainingMode: "restricted",
    trainerPhase: "ready_for_user",
    isUserTurn: false,
    userExplicitlyEnteredContinuation: false,
    isTerminal: false,
    hasInstructionTarget: false,
    hasContinuationCandidate: false,
    pendingOpponentRequestExists: true,
    expectedMoveSource: "none",
    expectedMoveReason: "side_to_move_is_opponent",
    expectedMoveUci: null,
    lineExhaustedByCursor: false,
    lineExhaustedByLichess: false,
    afterFinalUserMove: true,
    selectedLineId: "italian-white",
    fen4: "r2q1rk1/bpp2ppp/p1np1n2/4p3/4P3/1BPP1N2/PP1N1PPP/R1BQR1K1 b - -",
    lastUserMoveUci: "g1f3",
    lastUserMoveSan: "Nf3",
    exactNodeHasChildren: true,
    hasNextOpponentMove: true,
    hasNextUserMove: false,
    explicitCuratedTerminalNode: false,
    validBranchCompleteLatch: false,
  });
  assert.equal(knownOpponentReplyContract.branchCompleteEligible, false);

  const providerUnavailableBranchUi = buildBranchCompleteUi();
  assert.equal(providerUnavailableBranchUi.title.includes("Line complete"), true);
  assert.equal(providerUnavailableBranchUi.actions.some((action) => action.kind === "continue_from_here"), true);
  assert.notEqual(providerUnavailableBranchUi.title, "Safety Blocked");
}

testRestrictedLineExhaustedBranchCompleteButtons();
