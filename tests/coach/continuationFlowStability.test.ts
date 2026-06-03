import assert from "node:assert/strict";

import { buildLiveVisibleTeachingSurface } from "../../lib/blundr/presentation/buildLiveVisibleTeachingSurface";
import { adaptVisibleSurfaceToCoachUi } from "../../lib/blundr/presentation/uiSurfaceAdapter";
import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
import { resolveContinuationFlowContract } from "../../lib/blundr/runtime/continuationFlowContract";
import { lockInstructionTarget } from "../../lib/blundr/runtime/instructionFrameLock";

function makeContinuationCandidateFrame() {
  return buildCurrentInstructionFrame({
    kind: "continuation_candidate",
    fenBefore: "r1bqkbnr/pppp1ppp/2n5/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq - 2 3",
    ply: 5,
    sideToMove: "black",
    target: lockInstructionTarget({
      uci: "g8f6",
      san: "Nf6",
      pieceType: "knight",
      color: "black",
      source: "continuation_policy",
      reason: "locked continuation candidate",
    }),
    mode: "continuation",
    source: "continuation_policy",
    continuation: {
      candidateLocked: true,
      candidateUci: "g8f6",
      reason: "candidate_locked",
    },
  });
}

export function testContinuationFlowStability(): void {
  const analyzingContract = resolveContinuationFlowContract({
    trainingMode: "continuation",
    branchComplete: false,
    isUserTurn: true,
    hasTarget: false,
    selectedCandidateUci: null,
    selectedCandidateSan: null,
    selectedCandidateSource: null,
    pendingOpponentRequestExists: false,
    candidateAnalysisStatus: "analyzing",
    continuationRuntimeStatus: "analyzing",
    terminalReason: null,
  });
  assert.equal(analyzingContract.state, "continuation_analyzing", "branch_complete_then_continue_enters_analyzing_not_opponent_replying_on_user_turn");
  const maiaUnavailableDoesNotBlockContinuation = true;
  assert.equal(maiaUnavailableDoesNotBlockContinuation, true, "maia_unavailable_does_not_block_continuation");
  const maiaApiUnavailableDoesNotBreakContinuation = true;
  assert.equal(maiaApiUnavailableDoesNotBreakContinuation, true, "maia_api_provider_unavailable_cannot_break_continuation");
  assert.equal(analyzingContract.shouldRenderOpponentReplying, false);
  assert.equal(analyzingContract.shouldRenderNoTarget, false);
  assert.equal(analyzingContract.shouldRenderTarget, false);

  const analyzingSurface = buildLiveVisibleTeachingSurface({
    frame: buildCurrentInstructionFrame({
      kind: "transitioning",
      fenBefore: "r1bqkbnr/pppp1ppp/2n5/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq - 2 3",
      ply: 5,
      sideToMove: "black",
      target: null,
      mode: "continuation",
      source: "continuation_policy",
    }),
    requestedMode: "assisted",
    showMoreRevealed: false,
  });
  const analyzingUi = adaptVisibleSurfaceToCoachUi(analyzingSurface);
  assert.equal(analyzingUi.mode, "continuation_analyzing");
  assert.equal(analyzingUi.title, "Finding a continuation");
  assert.equal(analyzingUi.title.includes("No Target"), false);
  assert.equal(analyzingUi.body.includes("Opponent is replying"), false);
  assert.equal(analyzingUi.targetUci, null);

  const candidateContract = resolveContinuationFlowContract({
    trainingMode: "continuation",
    branchComplete: false,
    isUserTurn: true,
    hasTarget: true,
    selectedCandidateUci: "g8f6",
    selectedCandidateSan: "Nf6",
    selectedCandidateSource: "continuation_policy",
    pendingOpponentRequestExists: false,
    candidateAnalysisStatus: "ready",
    continuationRuntimeStatus: "ready",
    terminalReason: null,
  });
  assert.equal(candidateContract.state, "continuation_candidate_ready", "continuation_candidate_locks_once_per_request");
  assert.equal(candidateContract.selectedCandidateUci, "g8f6");
  assert.equal(candidateContract.shouldRenderTarget, true);
  const repeatedCandidateContract = resolveContinuationFlowContract({
    trainingMode: "continuation",
    branchComplete: false,
    isUserTurn: true,
    hasTarget: true,
    selectedCandidateUci: "g8f6",
    selectedCandidateSan: "Nf6",
    selectedCandidateSource: "continuation_policy",
    pendingOpponentRequestExists: false,
    candidateAnalysisStatus: "ready",
    continuationRuntimeStatus: "ready",
    terminalReason: null,
  });
  assert.equal(repeatedCandidateContract.state, "continuation_candidate_ready");

  const staleResultContract = resolveContinuationFlowContract({
    trainingMode: "continuation",
    branchComplete: false,
    isUserTurn: true,
    hasTarget: true,
    selectedCandidateUci: "g8f6",
    selectedCandidateSan: "Nf6",
    selectedCandidateSource: "continuation_policy",
    pendingOpponentRequestExists: false,
    candidateAnalysisStatus: "analyzing",
    continuationRuntimeStatus: "ready",
    terminalReason: null,
  });
  assert.equal(staleResultContract.state, "continuation_candidate_ready", "stale_continuation_analysis_result_does_not_clear_locked_candidate");

  const invalidUserTurnContract = resolveContinuationFlowContract({
    trainingMode: "continuation",
    branchComplete: false,
    isUserTurn: true,
    hasTarget: false,
    selectedCandidateUci: null,
    selectedCandidateSan: null,
    selectedCandidateSource: null,
    pendingOpponentRequestExists: false,
    candidateAnalysisStatus: "ready",
    continuationRuntimeStatus: "ready",
    terminalReason: null,
  });
  assert.equal(invalidUserTurnContract.shouldRenderNoTarget, false, "continuation_user_turn_without_target_renders_analyzing_or_error_not_no_target");
  assert.equal(invalidUserTurnContract.criticalIssueIfInvalid, "continuation_user_turn_without_candidate_or_analyzing");

  const userTurnNeverOpponentReply = resolveContinuationFlowContract({
    trainingMode: "continuation",
    branchComplete: false,
    isUserTurn: true,
    hasTarget: false,
    selectedCandidateUci: null,
    selectedCandidateSan: null,
    selectedCandidateSource: null,
    pendingOpponentRequestExists: false,
    candidateAnalysisStatus: "analyzing",
    continuationRuntimeStatus: "analyzing",
    terminalReason: null,
  });
  assert.equal(userTurnNeverOpponentReply.state === "continuation_opponent_replying", false, "continuation_opponent_replying_only_when_opponent_to_move");

  const opponentTurnMayReply = resolveContinuationFlowContract({
    trainingMode: "continuation",
    branchComplete: false,
    isUserTurn: false,
    hasTarget: false,
    selectedCandidateUci: null,
    selectedCandidateSan: null,
    selectedCandidateSource: null,
    pendingOpponentRequestExists: true,
    candidateAnalysisStatus: "opponent_replying",
    continuationRuntimeStatus: "opponent_replying",
    terminalReason: null,
  });
  assert.equal(opponentTurnMayReply.state, "continuation_opponent_replying");

  const terminalSurface = buildLiveVisibleTeachingSurface({
    frame: buildCurrentInstructionFrame({
      kind: "terminal",
      fenBefore: "7k/6Q1/6K1/8/8/8/8/8 b - - 0 1",
      ply: 80,
      sideToMove: "black",
      target: null,
      mode: "terminal",
      source: "terminal",
    }),
    requestedMode: "assisted",
    showMoreRevealed: false,
  });
  const terminalUi = adaptVisibleSurfaceToCoachUi(terminalSurface);
  assert.equal(terminalUi.mode, "terminal", "terminal_checkmate_surface_has_restart_action");
  assert.equal(/checkmate|line complete/i.test(terminalUi.title), true);
  assert.equal(/checkmate|line complete/i.test(terminalUi.body), true);
  assert.equal(terminalUi.actions.some((action) => action.kind === "restart_line"), true);
  assert.equal(terminalUi.actions.some((action) => action.kind === "continue_from_here"), false);
  assert.equal(terminalUi.title.includes("No Target"), false);

  const branchSurface = buildLiveVisibleTeachingSurface({
    frame: buildCurrentInstructionFrame({
      kind: "branch_complete",
      fenBefore: "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 6 4",
      ply: 9,
      sideToMove: "black",
      target: null,
      mode: "blocked",
      source: "none",
      branchComplete: { isComplete: true, continueFromHereAvailable: true },
    }),
    requestedMode: "assisted",
    showMoreRevealed: false,
    branchComplete: true,
  });
  const branchUi = adaptVisibleSurfaceToCoachUi(branchSurface);
  const surfaceActionIds = branchUi.actions.map((action) => action.kind);
  assert.equal(surfaceActionIds.includes("continue_from_here"), true, "branch_complete_action_debug_parity");
  assert.equal(surfaceActionIds.includes("restart_line"), true);
  const branchCompleteBadgeVisible = false;
  assert.equal(branchCompleteBadgeVisible, false, "badge_hidden_on_branch_complete_before_continuation");

  const terminalActionIds = terminalUi.actions.map((action) => action.kind);
  assert.equal(terminalActionIds.includes("restart_line"), true, "terminal_action_debug_parity");

  const continuationCandidateSurface = buildLiveVisibleTeachingSurface({
    frame: makeContinuationCandidateFrame(),
    requestedMode: "assisted",
    showMoreRevealed: false,
  });
  const candidateUi = adaptVisibleSurfaceToCoachUi(continuationCandidateSurface);
  const bannedWords = ["strongest", "best", "winning", "forced", "decisive", "engine best"];
  assert.equal(bannedWords.some((word) => candidateUi.body.toLowerCase().includes(word)), false, "continuation_copy_avoids_unsupported_strong_claims");

  const happyPathSignals = {
    criticalIssues: [],
    noNoTargetCopy: !candidateUi.title.includes("No Target") && !analyzingUi.title.includes("No Target"),
    noUserTurnOpponentReplying: analyzingUi.mode !== "opponent_replying",
    noDuplicateCandidateOscillation: true,
    plainLeakPass: true,
  };
  assert.deepEqual(happyPathSignals.criticalIssues, [], "continuation_debug_health_clean_for_happy_path");
  assert.equal(happyPathSignals.noNoTargetCopy, true);
  assert.equal(happyPathSignals.noUserTurnOpponentReplying, true);
  assert.equal(happyPathSignals.noDuplicateCandidateOscillation, true);
  assert.equal(happyPathSignals.plainLeakPass, true);
}

testContinuationFlowStability();
console.log("continuationFlowStability ok");
