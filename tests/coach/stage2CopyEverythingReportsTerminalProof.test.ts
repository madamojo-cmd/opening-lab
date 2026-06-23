import assert from "node:assert/strict";

import { buildDebugCopyEverythingPayload } from "../../components/debug/BlundrDiagnosticsPanel";
import { buildTrainerDebugSnapshot } from "../../lib/blundr/debug/trainerDebugSnapshot";

export function testStage2CopyEverythingReportsTerminalProof(): void {
  const snapshot = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 4,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: true,
    fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
    selectedOpeningId: "italian-white",
    selectedLineId: "italian-white",
    runtimeBookQueried: true,
    runtimeBookOpeningId: "italian-white",
    runtimeBookPlayKeyBefore: "e2e4,e7e5",
    runtimeBookStatus: "ready",
    runtimeBookCandidateCount: 0,
    runtimeBookBookExhausted: true,
    selectedLineExhausted: false,
    selectedLineExhaustionReason: null,
    selectedLineExhaustionBlockedReason: "opponent_reply_expected",
    branchTransitionSurfaceRendered: false,
    continueFromHereAvailable: false,
    continueFromHereButtonRendered: false,
    trainAgainButtonRendered: false,
    visibleTeachingSurface: {
      owner: "v28_visible_surface",
      mode: "guided_move",
      coach: { shouldRender: true, title: "Nf3 — Develop the knight", body: "Develop the knight.", buttons: [] },
      visual: { lines: [] },
      actions: [],
      safety: { blocked: false, criticalIssues: [] },
    },
    presentationFrame: { visual: { shouldRender: true, source: "visible_surface_v28" }, coach: { shouldRender: true, owner: "intent_first_coach", title: "Nf3 — Develop the knight", body: "Develop the knight.", buttons: [] }, legacy: {} },
    coachDecision: { shouldShowCoachCard: true, title: "Nf3 — Develop the knight", body: "Develop the knight.", buttons: [], debug: { coachDecisionSource: "live_coach", coachMoveUci: "g1f3", coachPieceType: "n", coachQuality: { qualityScore: 90, targetAligned: true, pieceAligned: true, containsDebugLeak: false } } },
    actualCoachCardTitle: "Nf3 — Develop the knight",
    actualCoachCardBody: "Develop the knight.",
    actualCoachCardButtons: [],
    actualCoachCardSource: "surfaceCoachCardDecision",
    actualVisualSource: "visible_surface_v28",
    renderedActionIds: [],
    surfaceActionIds: [],
    renderedVisualPrimitiveCount: 0,
    surfaceVisualPrimitiveCount: 0,
    coachQuality: { qualityScore: 90, qualityScoreSource: "final_rendered", source: "final_rendered", targetAligned: true, pieceAligned: true, usedFallback: false, containsDebugLeak: false },
    eventLog: [],
  } as any);

  const payload = buildDebugCopyEverythingPayload(snapshot as any) as any;
  const raw = JSON.stringify(payload);
  assert.match(raw, /"terminalProof"/);
  assert.match(raw, /"finalSurfaceAuthority"/);
  assert.match(raw, /"runtimeBookExhaustionObserved":true/);
  assert.match(raw, /"runtimeBookExhaustionTreatedAsDebugOnly":true/);
}

testStage2CopyEverythingReportsTerminalProof();
console.log("stage2CopyEverythingReportsTerminalProof ok");
