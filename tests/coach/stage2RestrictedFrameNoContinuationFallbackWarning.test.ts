import assert from "node:assert/strict";

import { buildTrainerDebugSnapshot } from "../../lib/blundr/debug/trainerDebugSnapshot";

export function testStage2RestrictedFrameNoContinuationFallbackWarning(): void {
  const snapshot = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 8,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: true,
    fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
    selectedOpeningId: "italian-white",
    selectedLineId: "italian-white",
    runtimeSafeFallbackUsed: true,
    runtimeSafeFallbackReason: "stockfish_provider_unavailable",
    stage2CoachingPacketKind: "safe_fallback",
    coachDecision: {
      shouldShowCoachCard: true,
      title: "Nf3 — Develop the knight",
      body: "Develop the knight.",
      buttons: [],
      debug: { coachDecisionSource: "verified_safe_fallback", verifiedFallbackUsed: true, fallbackReason: "stockfish_provider_unavailable", coachMoveUci: "g1f3", coachPieceType: "n", coachQuality: { qualityScore: 74, targetAligned: true, pieceAligned: true, containsDebugLeak: false } },
    },
    visibleTeachingSurface: {
      owner: "v28_visible_surface",
      mode: "guided_move",
      coach: { shouldRender: true, title: "Nf3 — Develop the knight", body: "Develop the knight.", buttons: [] },
      visual: { lines: [] },
      actions: [],
      safety: { blocked: false, criticalIssues: [] },
      debug: { visibleCoachOwner: "visible_surface_v28", visibleVisualOwner: "visible_surface_v28", visibleActionOwner: "visible_surface_v28" },
    },
    presentationFrame: {
      visual: { shouldRender: true, source: "visible_surface_v28" },
      coach: { shouldRender: true, owner: "intent_first_coach", title: "Nf3 — Develop the knight", body: "Develop the knight.", buttons: [] },
      legacy: {},
    },
    actualCoachCardTitle: "Nf3 — Develop the knight",
    actualCoachCardBody: "Develop the knight.",
    actualCoachCardButtons: [],
    actualCoachCardSource: "surfaceCoachCardDecision",
    actualVisualSource: "visible_surface_v28",
    renderedVisualPrimitiveCount: 0,
    surfaceVisualPrimitiveCount: 0,
    coachQuality: { qualityScore: 74, qualityScoreSource: "verified_safe_fallback", source: "verified_safe_fallback", targetAligned: true, pieceAligned: true, usedFallback: true, fallbackReason: "stockfish_provider_unavailable", containsDebugLeak: false },
    eventLog: [],
  } as any);

  const warningIds = (snapshot.providerWarnings ?? []).map((warning: any) => String(warning.warningId));
  assert.equal(warningIds.includes("continuation_provider_fallback_used"), false);
}

testStage2RestrictedFrameNoContinuationFallbackWarning();
console.log("stage2RestrictedFrameNoContinuationFallbackWarning ok");
