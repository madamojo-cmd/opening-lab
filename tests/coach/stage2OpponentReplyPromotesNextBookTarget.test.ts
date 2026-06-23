import assert from "node:assert/strict";

import { buildTrainerDebugSnapshot } from "../../lib/blundr/debug/trainerDebugSnapshot";

export function testStage2OpponentReplyPromotesNextBookTarget(): void {
  const snapshot = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 5,
    trainerPhase: "opponent_replying",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: false,
    selectedOpeningId: "italian-white",
    selectedLineId: "italian-white",
    fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 2",
    runtimeBookQueried: true,
    runtimeBookOpeningId: "italian-white",
    runtimeBookPlayKeyBefore: "e2e4",
    runtimeBookStatus: "ready",
    runtimeBookCandidateCount: 1,
    runtimeBookTopCandidateUci: "e7e5",
    runtimeBookTopCandidateSan: "e5",
    runtimeBookTopCandidateRank: 1,
    runtimeBookTopCandidateGames: 1024,
    runtimeBookTopCandidatePlayPct: 100,
    runtimeBookBookExhausted: false,
    runtimeBookFallbackUsed: false,
    runtimeBookFallbackAuthority: null,
    branchTransitionSurfaceRendered: false,
    continueFromHereAvailable: false,
    continueFromHereButtonRendered: false,
    branchCompleteEligible: false,
    selectedLineExhausted: false,
    selectedLineExhaustionReason: null,
    visibleTeachingSurface: {
      owner: "v28_visible_surface",
      mode: "opponent_replying",
      coach: { shouldRender: true, title: "Opponent reply", body: "The opponent is choosing a reply before Blundr can suggest your continuation.", buttons: ["hide"] },
      visual: { lines: [] },
      actions: [],
      safety: { blocked: false, criticalIssues: [] },
      debug: { visibleCoachOwner: "visible_surface_v28", visibleVisualOwner: "visible_surface_v28", visibleActionOwner: "visible_surface_v28" },
    },
    presentationFrame: { visual: { shouldRender: true, source: "visible_surface_v28" }, coach: { shouldRender: true, owner: "intent_first_coach", title: "Opponent reply", body: "The opponent is choosing a reply before Blundr can suggest your continuation.", buttons: ["hide"] }, legacy: {} },
    coachDecision: { shouldShowCoachCard: true, title: "Opponent reply", body: "The opponent is choosing a reply before Blundr can suggest your continuation.", buttons: ["hide"], debug: { coachDecisionSource: "live_coach" } },
    actualCoachCardTitle: "Opponent reply",
    actualCoachCardBody: "The opponent is choosing a reply before Blundr can suggest your continuation.",
    actualCoachCardButtons: ["hide"],
    actualCoachCardSource: "surfaceCoachCardDecision",
    actualVisualSource: "visible_surface_v28",
    renderedActionIds: ["hide"],
    surfaceActionIds: [],
    renderedVisualPrimitiveCount: 0,
    surfaceVisualPrimitiveCount: 0,
    coachQuality: { qualityScore: 60, qualityScoreSource: "final_rendered", source: "final_rendered", targetAligned: false, pieceAligned: false, usedFallback: true, containsDebugLeak: false },
    eventLog: [],
  } as any);

  assert.equal((snapshot.continuation as any)?.runtimeBookQueried, true);
  assert.equal((snapshot.continuation as any)?.runtimeBookCandidateCount, 1);
  assert.equal((snapshot.frame as any)?.branchTransitionSurfaceRendered, false);
  assert.equal((snapshot.coach as any)?.visibleTitle, "Opponent reply");
  assert.equal((snapshot.frame as any)?.transitionToContinuationAllowed, false);
}

testStage2OpponentReplyPromotesNextBookTarget();
console.log("stage2OpponentReplyPromotesNextBookTarget ok");
