import assert from "node:assert/strict";

import { resolveBranchCompleteContract } from "../../lib/blundr/runtime/branchCompleteContract";
import { resolveEffectiveContinuationCandidate } from "../../lib/blundr/runtime/resolveEffectiveContinuationCandidate";

export function testStage2AppPageContinuationParity(): void {
  const branchCompleteBeforeContinue = resolveBranchCompleteContract({
    trainingMode: "restricted",
    trainerPhase: "ready_for_user",
    isUserTurn: true,
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
    selectedLineId: "italian-white-line-001",
    fen4: "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R",
    exactNodeHasChildren: false,
    hasNextOpponentMove: false,
    hasNextUserMove: false,
    explicitCuratedTerminalNode: false,
    validBranchCompleteLatch: false,
  });
  assert.equal(branchCompleteBeforeContinue.branchCompleteEligible, true);
  assert.equal(branchCompleteBeforeContinue.shouldRenderBranchCompleteSurface, true);
  assert.equal(branchCompleteBeforeContinue.requiredSurfaceActionIds.includes("continue_from_here"), true);

  const branchCompleteAfterContinue = resolveBranchCompleteContract({
    trainingMode: "restricted",
    trainerPhase: "ready_for_user",
    isUserTurn: true,
    userExplicitlyEnteredContinuation: true,
    isTerminal: false,
    hasInstructionTarget: false,
    hasContinuationCandidate: false,
    pendingOpponentRequestExists: false,
    expectedMoveSource: "guided_branch_needs_continuation",
    expectedMoveReason: "repertoire_line_exhausted_needs_continuation",
    expectedMoveUci: null,
    lineExhaustedByCursor: true,
    lineExhaustedByLichess: false,
    selectedLineId: "italian-white-line-001",
    fen4: "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R",
    exactNodeHasChildren: false,
    hasNextOpponentMove: false,
    hasNextUserMove: false,
    explicitCuratedTerminalNode: false,
    validBranchCompleteLatch: false,
  });
  assert.equal(branchCompleteAfterContinue.branchCompleteEligible, false);

  const continuationCandidateBeforeClick = resolveEffectiveContinuationCandidate({
    trainingMode: "restricted",
    isUserTurn: true,
    trainerPhase: "ready_for_user",
    boardFen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 1 2",
    boardFen4: "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R",
    legalMoveUcis: ["f1c4", "d2d4"],
    continuationResolvedTargetUci: null,
    continuationResolvedTargetSan: null,
    continuationResolvedTargetSource: null,
    continuationResolvedTargetLabel: null,
    continuationResolvedTargetFen4: null,
  });
  assert.equal(continuationCandidateBeforeClick.candidate, null);
  assert.equal(
    ["missing_resolved_target", "not_continuation_mode"].includes(String(continuationCandidateBeforeClick.guard.blockedReason)),
    true,
  );

  const continuationCandidateAfterClick = resolveEffectiveContinuationCandidate({
    trainingMode: "continuation",
    isUserTurn: true,
    trainerPhase: "ready_for_user",
    boardFen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 1 2",
    boardFen4: "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R",
    legalMoveUcis: ["f1c4", "d2d4"],
    continuationResolvedTargetUci: "f1c4",
    continuationResolvedTargetSan: "Bc4",
    continuationResolvedTargetSource: "stage2-runtime-book",
    continuationResolvedTargetLabel: "Best",
    continuationResolvedTargetFen4: "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R",
  });
  assert.equal(continuationCandidateAfterClick.candidate?.uci, "f1c4");
  assert.equal(continuationCandidateAfterClick.guard.effectiveContinuationCandidateSource, "stage2-runtime-book");
  assert.equal(continuationCandidateAfterClick.guard.blockedReason, null);

  const fallbackProviderDoesNotCreateTarget = resolveEffectiveContinuationCandidate({
    trainingMode: "continuation",
    isUserTurn: true,
    trainerPhase: "ready_for_user",
    boardFen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 1 2",
    boardFen4: "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R",
    legalMoveUcis: [],
    continuationResolvedTargetUci: null,
    continuationResolvedTargetSan: null,
    continuationResolvedTargetSource: null,
    continuationResolvedTargetLabel: null,
    continuationResolvedTargetFen4: null,
  });
  assert.equal(fallbackProviderDoesNotCreateTarget.candidate, null);
  assert.equal(
    ["missing_resolved_target", "not_continuation_mode"].includes(String(fallbackProviderDoesNotCreateTarget.guard.blockedReason)),
    true,
  );
}

testStage2AppPageContinuationParity();
console.log("stage2AppPageContinuationParity ok");
