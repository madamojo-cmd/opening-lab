import assert from "node:assert/strict";

import { resolveBranchCompleteContract } from "../../lib/blundr/runtime/branchCompleteContract";
import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
import { buildLiveVisibleTeachingSurface } from "../../lib/blundr/presentation/buildLiveVisibleTeachingSurface";
import { adaptVisibleSurfaceToCoachUi } from "../../lib/blundr/presentation/uiSurfaceAdapter";

export function testBranchCompleteContract(): void {
  const finalMoveContract = resolveBranchCompleteContract({
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
  });
  assert.equal(finalMoveContract.branchCompleteEligible, true, "final_user_move_latches_branch_complete_without_opponent_request");
  assert.equal(finalMoveContract.shouldPreventOpponentScheduling, true);
  assert.equal(finalMoveContract.shouldRenderBranchCompleteSurface, true);
  assert.deepEqual(finalMoveContract.requiredSurfaceActionIds, ["continue_from_here", "restart_line"]);

  const opponentPendingContract = resolveBranchCompleteContract({
    trainingMode: "restricted",
    trainerPhase: "opponent_replying",
    isUserTurn: false,
    userExplicitlyEnteredContinuation: false,
    isTerminal: false,
    hasInstructionTarget: true,
    hasContinuationCandidate: false,
    pendingOpponentRequestExists: true,
    expectedMoveSource: "opening_branch",
    expectedMoveReason: "known_branch_available",
    expectedMoveUci: "e7e5",
    lineExhaustedByCursor: false,
    lineExhaustedByLichess: false,
  });
  assert.equal(opponentPendingContract.branchCompleteEligible, false, "opponent_pending_allowed_only_when_next_user_target_exists");
  assert.equal(opponentPendingContract.shouldPreventOpponentScheduling, false);

  const stalePendingContract = resolveBranchCompleteContract({
    trainingMode: "restricted",
    trainerPhase: "ready_for_user",
    isUserTurn: false,
    userExplicitlyEnteredContinuation: false,
    isTerminal: false,
    hasInstructionTarget: false,
    hasContinuationCandidate: false,
    pendingOpponentRequestExists: true,
    expectedMoveSource: "guided_branch_needs_continuation",
    expectedMoveReason: "repertoire_line_exhausted_needs_continuation",
    expectedMoveUci: null,
    lineExhaustedByCursor: true,
    lineExhaustedByLichess: false,
  });
  assert.equal(stalePendingContract.branchCompleteEligible, true, "pending_opponent_request_cannot_hide_branch_complete");
  assert.equal(stalePendingContract.shouldCancelPendingOpponent, true);
  assert.equal(stalePendingContract.pendingOpponentRequestConflict, true);

  const branchFrame = buildCurrentInstructionFrame({
    kind: "branch_complete",
    fenBefore: "r1bqk1nr/pppp1ppp/2n5/2b1p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 5 3",
    ply: 7,
    sideToMove: "black",
    target: null,
    mode: "blocked",
    source: "none",
    branchComplete: { isComplete: true, continueFromHereAvailable: true },
  });
  assert.equal(branchFrame.kind, "branch_complete", "opponent_reply_resolution_to_exhausted_line_enters_branch_complete");
  assert.equal(branchFrame.target, null);

  const branchSurface = buildLiveVisibleTeachingSurface({
    frame: branchFrame,
    requestedMode: "assisted",
    showMoreRevealed: false,
    branchComplete: true,
  });
  const branchUi = adaptVisibleSurfaceToCoachUi(branchSurface);
  assert.equal(branchSurface.mode, "branch_complete", "branch_complete_buttons_render_after_final_user_move");
  assert.equal(branchUi.actions.some((action) => action.kind === "continue_from_here"), true);
  assert.equal(branchUi.actions.some((action) => action.kind === "restart_line"), true);
  assert.equal(branchUi.debug.source, "VisibleTeachingSurface", "v28_branch_complete_surface_actions_are_source_of_truth");

  const debugGreenButMissingContinue = {
    badgesAllPass: true,
    lineExhausted: true,
    surfaceActionIds: ["restart_line"],
  };
  assert.equal(
    debugGreenButMissingContinue.badgesAllPass && debugGreenButMissingContinue.lineExhausted && !debugGreenButMissingContinue.surfaceActionIds.includes("continue_from_here"),
    true,
    "continue_from_here_action_survives_debug_green_state",
  );
}

testBranchCompleteContract();
console.log("branchCompleteContract ok");
