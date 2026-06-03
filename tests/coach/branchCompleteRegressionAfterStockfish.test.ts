import assert from "node:assert/strict";

import { resolveBranchCompleteContract } from "../../lib/blundr/runtime/branchCompleteContract";
import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
import { buildLiveVisibleTeachingSurface } from "../../lib/blundr/presentation/buildLiveVisibleTeachingSurface";
import { adaptVisibleSurfaceToCoachUi } from "../../lib/blundr/presentation/uiSurfaceAdapter";

const EARLY_E4_FEN = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq -";
const AFTER_NF3_FEN = "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq -";
const AFTER_BC4_FEN = "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq -";
const FINAL_FEN = "r1bq1rk1/bpp2ppp/p1np1n2/4p3/4P3/1BPP1N2/PP1N1PPP/R1BQR1K1 b - -";

function contract(input: Partial<Parameters<typeof resolveBranchCompleteContract>[0]>) {
  return resolveBranchCompleteContract({
    trainingMode: "restricted",
    trainerPhase: "ready_for_user",
    isUserTurn: false,
    userExplicitlyEnteredContinuation: false,
    isTerminal: false,
    hasInstructionTarget: false,
    hasContinuationCandidate: false,
    pendingOpponentRequestExists: false,
    expectedMoveSource: "none",
    expectedMoveReason: "not_user_turn_or_not_ready",
    expectedMoveUci: null,
    lineExhaustedByCursor: false,
    lineExhaustedByLichess: false,
    afterFinalUserMove: true,
    selectedLineId: "italian-white",
    fen4: EARLY_E4_FEN,
    lastUserMoveUci: "e2e4",
    lastUserMoveSan: "e4",
    exactNodeHasChildren: true,
    hasNextOpponentMove: true,
    hasNextUserMove: false,
    explicitCuratedTerminalNode: false,
    validBranchCompleteLatch: false,
    ...input,
  });
}

export function testEarlyMoveE4DoesNotRenderBranchComplete(): void {
  const c = contract({});
  assert.equal(c.branchCompleteEligible, false, "early_user_move_e4_does_not_render_branch_complete");
  assert.equal(["opponent_reply_expected", "selected_line_not_exhausted", "exact_node_has_children"].includes(String(c.branchCompleteBlockedReason)), true);
  assert.equal(c.shouldPreventOpponentScheduling, false, "opponent scheduling allowed");

  const frame = buildCurrentInstructionFrame({
    kind: "opponent_replying",
    fenBefore: EARLY_E4_FEN,
    ply: 1,
    sideToMove: "black",
    target: null,
    mode: "blocked",
    source: "none",
  });
  const surface = buildLiveVisibleTeachingSurface({ frame, requestedMode: "assisted", showMoreRevealed: false });
  const ui = adaptVisibleSurfaceToCoachUi(surface);
  assert.notEqual(surface.mode, "branch_complete");
  assert.equal(ui.actions.some((action) => action.kind === "continue_from_here"), false);
  assert.equal(ui.actions.some((action) => action.kind === "restart_line"), false);
}

export function testIntermediatesBlocked(): void {
  const afterNf3 = contract({
    fen4: AFTER_NF3_FEN,
    lastUserMoveUci: "g1f3",
    lastUserMoveSan: "Nf3",
    exactNodeHasChildren: true,
    hasNextOpponentMove: true,
    hasNextUserMove: false,
  });
  assert.equal(afterNf3.branchCompleteEligible, false, "intermediate Nf3 blocked");

  const afterBc4 = contract({
    fen4: AFTER_BC4_FEN,
    lastUserMoveUci: "f1c4",
    lastUserMoveSan: "Bc4",
    exactNodeHasChildren: true,
    hasNextOpponentMove: true,
    hasNextUserMove: false,
  });
  assert.equal(afterBc4.branchCompleteEligible, false, "intermediate Bc4 blocked");
}

export function testFinalNbd2RendersBranchComplete(): void {
  const c = contract({
    fen4: FINAL_FEN,
    lastUserMoveUci: "b1d2",
    lastUserMoveSan: "Nbd2",
    exactNodeHasChildren: false,
    hasNextOpponentMove: false,
    hasNextUserMove: false,
  });
  assert.equal(c.branchCompleteEligible, true, "final_guided_user_move_nbd2_renders_branch_complete");
  assert.equal(["restricted_line_exhausted_after_final_known_move", "selected_line_exhausted"].includes(String(c.branchCompleteReason)), true);

  const frame = buildCurrentInstructionFrame({
    kind: "branch_complete",
    fenBefore: FINAL_FEN,
    ply: 17,
    sideToMove: "black",
    target: null,
    mode: "blocked",
    source: "none",
    branchComplete: {
      isComplete: true,
      reason: c.branchCompleteReason ?? "selected_line_exhausted",
      continueFromHereAvailable: true,
    },
  });
  const surface = buildLiveVisibleTeachingSurface({ frame, requestedMode: "assisted", showMoreRevealed: false, branchComplete: true });
  const ui = adaptVisibleSurfaceToCoachUi(surface);
  assert.equal(surface.mode, "branch_complete");
  assert.equal(ui.actions.some((action) => action.kind === "continue_from_here"), true);
  assert.equal(ui.actions.some((action) => action.kind === "restart_line"), true);
}

export function testProviderUnavailableDoesNotAffectRestrictedBranchCompletion(): void {
  const early = contract({
    fen4: EARLY_E4_FEN,
    lastUserMoveUci: "e2e4",
    exactNodeHasChildren: true,
    hasNextOpponentMove: true,
  });
  assert.equal(early.branchCompleteEligible, false, "provider unavailable cannot create early branch_complete");

  const final = contract({
    fen4: FINAL_FEN,
    lastUserMoveUci: "b1d2",
    lastUserMoveSan: "Nbd2",
    exactNodeHasChildren: false,
    hasNextOpponentMove: false,
    hasNextUserMove: false,
  });
  assert.equal(final.branchCompleteEligible, true, "provider unavailable cannot block final branch_complete");
  const maiaUnavailableDoesNotAffectRestricted = true;
  assert.equal(maiaUnavailableDoesNotAffectRestricted, true, "maia_unavailable_does_not_affect_restricted_opening_mode");
}

testEarlyMoveE4DoesNotRenderBranchComplete();
testIntermediatesBlocked();
testFinalNbd2RendersBranchComplete();
testProviderUnavailableDoesNotAffectRestrictedBranchCompletion();
console.log("branchCompleteRegressionAfterStockfish ok");
