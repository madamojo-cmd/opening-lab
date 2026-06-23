import assert from "node:assert/strict";

import { buildTrainerDebugSnapshot } from "../../lib/blundr/debug/trainerDebugSnapshot";
import { buildTrainerFrameResolution } from "../../lib/blundr/debug/buildTrainerFrameResolution";

export function testStage2RuyWhiteAliasDoesNotPrematurelyBranchComplete(): void {
  const frameResolution = buildTrainerFrameResolution({
    trainerFrameId: 41,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: false,
    fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
    selectedOpeningId: "ruy-white",
    selectedLineId: "ruy-white",
    runtimeBookOpeningId: "ruy-lopez-white",
    selectedOpeningRuntimeAvailable: false,
    selectedLineCompleteConfirmed: false,
    exactNodeHasChildren: "unknown",
    hasNextOpponentMove: "unknown",
    hasNextUserMove: "unknown",
    validBranchCompleteLatch: true,
    bookCompleteAllowed: true,
    guidedCompleteAllowed: true,
    runtimeBookBookExhausted: true,
    runtimeBookCandidateCount: 0,
    runtimeBookStatus: "ready",
    visibleTeachingSurface: {
      owner: "v28_visible_surface",
      mode: "branch_complete",
      coach: { shouldRender: true, title: "Line complete", body: "You finished this training line.", buttons: ["continue_from_here", "restart_line"] },
      visual: { lines: [] },
      actions: ["continue_from_here", "restart_line"],
      safety: { blocked: false, criticalIssues: [] },
      debug: { visibleCoachOwner: "visible_surface_v28", visibleVisualOwner: "visible_surface_v28", visibleActionOwner: "visible_surface_v28" },
    },
    presentationFrame: {
      visual: { shouldRender: false, source: "none" },
      coach: { shouldRender: true, owner: "branch_transition_surface", title: "Line complete", body: "You finished this training line.", buttons: ["continue_from_here", "restart_line"] },
      legacy: {},
    },
    actualCoachCardTitle: "Line complete",
    actualCoachCardBody: "You finished this training line.",
    actualCoachCardButtons: ["continue_from_here", "restart_line"],
    actualCoachCardSource: "surfaceCoachCardDecision",
    actualVisualSource: "visible_surface_v28",
    renderedVisualPrimitiveCount: 0,
    surfaceVisualPrimitiveCount: 0,
    coachQuality: { qualityScore: 90, qualityScoreSource: "final_rendered", source: "final_rendered", targetAligned: false, pieceAligned: false, usedFallback: false, containsDebugLeak: false },
    eventLog: [],
  } as any);

  const snapshot = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 41,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: false,
    fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
    selectedOpeningId: "ruy-white",
    selectedLineId: "ruy-white",
    activeLineName: "Ruy Lopez",
    runtimeBookQueried: true,
    runtimeBookOpeningId: "ruy-lopez-white",
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
    visibleTeachingSurface: {
      owner: "v28_visible_surface",
      mode: "branch_complete",
      coach: { shouldRender: true, title: "Line complete", body: "You finished this training line.", buttons: ["continue_from_here", "restart_line"] },
      visual: { lines: [] },
      actions: ["continue_from_here", "restart_line"],
      safety: { blocked: false, criticalIssues: [] },
      debug: { visibleCoachOwner: "visible_surface_v28", visibleVisualOwner: "visible_surface_v28", visibleActionOwner: "visible_surface_v28" },
    },
    presentationFrame: {
      visual: { shouldRender: false, source: "none" },
      coach: { shouldRender: true, owner: "branch_transition_surface", title: "Line complete", body: "You finished this training line.", buttons: ["continue_from_here", "restart_line"] },
      legacy: {},
    },
    coachDecision: {
      shouldShowCoachCard: true,
      title: "Line complete",
      body: "You finished this training line.",
      buttons: ["continue_from_here", "restart_line"],
      debug: { coachDecisionSource: "surfaceCoachCardDecision", coachMoveUci: null, coachPieceType: null, coachQuality: { qualityScore: 90, targetAligned: false, pieceAligned: false, containsDebugLeak: false } },
    },
    actualCoachCardTitle: "Line complete",
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
    trainerFrameResolution: frameResolution,
  } as any);

  assert.equal(frameResolution.openingIdentity?.canonicalSelectedOpeningId, "ruy-lopez-white");
  assert.equal(frameResolution.terminalProof?.proven, false);
  assert.equal(frameResolution.finalSurfaceAuthority?.branchCompleteAllowedByTerminalProof, false);
  assert.equal((snapshot.frame as any)?.terminalProof?.proven, false);
  assert.equal((snapshot.coach as any)?.visibleTitle, "Line complete");
  assert.equal((snapshot.runtime as any)?.selectedOpeningId, "ruy-white");
  assert.equal((snapshot.runtime as any)?.canonicalSelectedOpeningId, "ruy-lopez-white");
}

testStage2RuyWhiteAliasDoesNotPrematurelyBranchComplete();
console.log("stage2RuyWhiteAliasDoesNotPrematurelyBranchComplete ok");
