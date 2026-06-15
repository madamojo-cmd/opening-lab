import assert from "node:assert/strict";

import { buildTrainerDebugSnapshot } from "../../lib/blundr/debug/trainerDebugSnapshot";
import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
import { resolveBranchCompleteContract } from "../../lib/blundr/runtime/branchCompleteContract";
import { buildStage2RuntimeBookIndex, getStage2RuntimeCandidatesForFrame, loadStage2RuntimeBook } from "../../lib/blundr/runtimeBook";
import { adaptVisibleSurfaceToCoachUi } from "../../lib/blundr/presentation/uiSurfaceAdapter";
import { buildLiveVisibleTeachingSurface } from "../../lib/blundr/presentation/buildLiveVisibleTeachingSurface";

const OPENING_ID = "italian-white";
const ACTIVE_LINE_NAME = "Italian Game";
const EXHAUSTED_PLAY_KEY_BEFORE = "e2e4,c7c5,g1f3,d7d6,d2d4,c5d4,f3d4,g8f6,b1c3,a7a6,c1e3,e7e5,d4b3,c8e6,f2f3";
const EXHAUSTED_FEN = "rn1qkb1r/1p3ppp/p2pbn2/4p3/4P3/1NN1BP2/PPP3PP/R2QKB1R b KQkq - 0 8";
const CONTROL_PLAY_KEY_BEFORE = "e2e4,e7e5,g1f3,b8c6,f1c4,f8c5,c2c3,g8f6,d2d4";
const BRANCH_COMPLETE_TITLE = "Line complete";
const BRANCH_COMPLETE_BODY = "You finished this training line. Continue from this position or train the line again.";

export async function testRestrictedRuntimeBookOpponentTurnHandoff(): Promise<void> {
  const loaded = await loadStage2RuntimeBook();
  const index = buildStage2RuntimeBookIndex(loaded);

  const exhausted = getStage2RuntimeCandidatesForFrame({
    index,
    openingId: OPENING_ID,
    playKeyBefore: EXHAUSTED_PLAY_KEY_BEFORE,
  });
  assert.equal(exhausted.candidates.length, 0, "exact_failing_play_key_must_have_no_runtime_candidates");
  assert.equal(exhausted.bookExhausted, true);

  const control = getStage2RuntimeCandidatesForFrame({
    index,
    openingId: OPENING_ID,
    playKeyBefore: CONTROL_PLAY_KEY_BEFORE,
  });
  assert.ok(control.candidates.length > 0, "control_position_should_still_have_runtime_candidates");
  assert.equal(control.bookExhausted, false);

  const branchCompleteContract = resolveBranchCompleteContract({
    trainingMode: "restricted",
    trainerPhase: "ready_for_user",
    isUserTurn: false,
    userExplicitlyEnteredContinuation: false,
    isTerminal: false,
    hasInstructionTarget: false,
    hasContinuationCandidate: false,
    pendingOpponentRequestExists: true,
    expectedMoveSource: "none",
    expectedMoveReason: "restricted_book_exhausted_on_opponent_turn_after_user_move",
    expectedMoveUci: null,
    lineExhaustedByCursor: true,
    lineExhaustedByLichess: false,
    afterFinalUserMove: true,
    selectedLineId: OPENING_ID,
    fen4: EXHAUSTED_FEN,
    lastUserMoveUci: "f2f3",
    lastUserMoveSan: "f3",
    exactNodeHasChildren: false,
    hasNextOpponentMove: false,
    hasNextUserMove: false,
    explicitCuratedTerminalNode: false,
    validBranchCompleteLatch: false,
  });
  assert.equal(branchCompleteContract.branchCompleteEligible, true);
  assert.equal(branchCompleteContract.shouldPreventOpponentScheduling, true);
  assert.equal(branchCompleteContract.shouldRenderBranchCompleteSurface, true);
  assert.deepEqual(branchCompleteContract.requiredSurfaceActionIds, ["continue_from_here", "restart_line"]);

  const branchFrame = buildCurrentInstructionFrame({
    kind: "branch_complete",
    fenBefore: EXHAUSTED_FEN,
    ply: 15,
    sideToMove: "black",
    target: null,
    mode: "blocked",
    source: "none",
    branchComplete: {
      isComplete: true,
      reason: "restricted_book_exhausted_on_opponent_turn_after_user_move",
      continueFromHereAvailable: true,
    },
  });
  const branchSurface = buildLiveVisibleTeachingSurface({
    frame: branchFrame,
    requestedMode: "assisted",
    showMoreRevealed: false,
    branchComplete: true,
  });
  const branchUi = adaptVisibleSurfaceToCoachUi(branchSurface);
  assert.equal(branchSurface.mode, "branch_complete");
  assert.equal(branchUi.title, BRANCH_COMPLETE_TITLE);
  assert.equal(branchUi.actions.some((action) => action.kind === "continue_from_here"), true);
  assert.equal(branchUi.actions.some((action) => action.kind === "restart_line"), true);

  const snapshot = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 99,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: false,
    selectedOpeningId: OPENING_ID,
    selectedLineId: OPENING_ID,
    activeLineName: ACTIVE_LINE_NAME,
    fen: EXHAUSTED_FEN,
    lastUserMoveSan: "f3",
    lastUserMoveUci: "f2f3",
    userExplicitlyEnteredContinuation: false,
    prematureContinuationBlocked: true,
    transitionToContinuationAllowed: false,
    runtimeBookQueried: true,
    runtimeBookOpeningId: OPENING_ID,
    runtimeBookPlayKeyBefore: EXHAUSTED_PLAY_KEY_BEFORE,
    runtimeBookStatus: "ready",
    runtimeBookCandidateCount: 0,
    runtimeBookTopCandidateUci: null,
    runtimeBookTopCandidateSan: null,
    runtimeBookTopCandidateRank: null,
    runtimeBookTopCandidateGames: null,
    runtimeBookTopCandidatePlayPct: null,
    runtimeBookBookExhausted: true,
    runtimeBookFallbackUsed: false,
    runtimeBookFallbackAuthority: null,
    selectedLineExhausted: true,
    selectedLineExhaustionReason: "restricted_book_exhausted_on_opponent_turn_after_user_move",
    selectedLineExhaustionBlockedReason: null,
    branchTransitionSurfaceRendered: true,
    branchTransitionPayloadValid: true,
    continueFromHereAvailable: true,
    continueFromHereButtonRendered: true,
    trainAgainButtonRendered: true,
    branchTransitionReason: "restricted_book_exhausted_on_opponent_turn_after_user_move",
    branchCompleteAfterFinalUserMove: true,
    pendingOpponentRequest: null,
    visibleTeachingSurface: {
      mode: "branch_complete",
      owner: "v28_visible_surface",
      coach: {
        shouldRender: true,
        title: BRANCH_COMPLETE_TITLE,
        body: BRANCH_COMPLETE_BODY,
      },
      actions: ["continue_from_here", "restart_line"],
    },
    presentationFrame: {
      visual: { shouldRender: false, source: "none" },
      coach: {
        shouldRender: true,
        owner: "branch_transition_surface",
        intent: "branch_transition",
        title: BRANCH_COMPLETE_TITLE,
        body: BRANCH_COMPLETE_BODY,
      },
      legacy: {},
    },
    coachDecision: {
      shouldShowCoachCard: true,
      title: BRANCH_COMPLETE_TITLE,
      body: BRANCH_COMPLETE_BODY,
      buttons: ["continue_from_here", "restart_line"],
      debug: { coachDecisionSource: "branch_transition_surface" },
    },
    eventLog: [],
  } as any);

  assert.equal((snapshot.health.criticalIssues ?? []).includes("restricted_line_exhausted_without_branch_complete_buttons"), false);
  assert.notEqual((snapshot.coach as any)?.visibleTitle, "Opponent is replying");
  assert.equal((snapshot.continuation as any)?.runtimeBookQueried, true);
  assert.equal((snapshot.continuation as any)?.runtimeBookCandidateCount, 0);
  assert.equal((snapshot.frame as any)?.branchTransitionSurfaceRendered, true);
  assert.equal((snapshot.frame as any)?.continueFromHereAvailable, true);

  const controlContract = resolveBranchCompleteContract({
    trainingMode: "restricted",
    trainerPhase: "opponent_replying",
    isUserTurn: false,
    userExplicitlyEnteredContinuation: false,
    isTerminal: false,
    hasInstructionTarget: false,
    hasContinuationCandidate: false,
    pendingOpponentRequestExists: false,
    expectedMoveSource: "opening_branch",
    expectedMoveReason: "known_branch_available",
    expectedMoveUci: "e7e5",
    lineExhaustedByCursor: false,
    lineExhaustedByLichess: false,
    afterFinalUserMove: true,
    selectedLineId: OPENING_ID,
    fen4: "rn1qkb1r/1p3ppp/p2pbn2/4p3/4P3/1NN1BP2/PPP3PP/R2QKB1R b KQkq - 0 8",
    lastUserMoveUci: "f2f3",
    lastUserMoveSan: "f3",
    exactNodeHasChildren: true,
    hasNextOpponentMove: true,
    hasNextUserMove: false,
    explicitCuratedTerminalNode: false,
    validBranchCompleteLatch: false,
  });
  assert.equal(controlContract.branchCompleteEligible, false, "book_candidate_should_keep_opponent_reply_flow");
  assert.equal(controlContract.shouldPreventOpponentScheduling, false);
}

testRestrictedRuntimeBookOpponentTurnHandoff()
  .then(() => {
    console.log("restrictedRuntimeBookOpponentTurnHandoff ok");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
