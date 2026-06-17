import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { BlundrDiagnosticsPanel, buildDebugCopyEverythingPayload } from "../../components/debug/BlundrDiagnosticsPanel";
import { buildTrainerDebugSnapshot } from "../../lib/blundr/debug/trainerDebugSnapshot";
import { healthyLocalRuntimeContext, warningIds } from "./stage2ProviderWarningTestHelpers";

export function testStage2ProviderDebugCopyEverythingTruth(): void {
  const snapshot = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 303,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: true,
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    runtimeDataSource: "local_crawled_package",
    liveLichessCalled: false,
    runtimeAvailable: true,
    selectedOpeningRuntimeAvailable: true,
    selectedOpeningContentStatus: "fallback_only",
    candidateSource: "local_runtime_package",
    stage2ApprovedContentEnabled: false,
    stage2SafeFallbackEnabled: true,
    stage2CoachingResolverEnabled: false,
    visibleTeachingSurface: { mode: "assisted", coach: { title: "T", body: "B", buttons: [] } },
    coachDecision: { shouldShowCoachCard: true, title: "T", body: "B", buttons: [] },
    actualCoachCardTitle: "T",
    actualCoachCardBody: "B",
    actualCoachCardButtons: [],
    actualVisualSource: "visible_surface_v28",
    presentationFrame: { visual: { shouldRender: true, source: "visible_surface_v28" }, coach: { owner: "intent_first_coach" }, legacy: {} },
    runtimeBookQueried: true,
    runtimeBookOpeningId: "london-white",
    runtimeBookPlayKeyBefore: "d2d4",
    runtimeBookStatus: "ready",
    runtimeBookCandidateCount: 0,
    runtimeBookBookExhausted: true,
    runtimeBookFallbackUsed: true,
    runtimeBookFallbackAuthority: "safe_fallback",
    runtimeSafeFallbackUsed: true,
    runtimeSafeFallbackReason: "stockfish_provider_unavailable",
    stockfishProviderStatus: "unavailable",
    stockfishValidationStatus: "unavailable",
    maiaProviderStatus: "disabled",
    maiaRuntimeStatus: "disabled",
    maiaAllowedThisFrame: false,
    selectedOpeningId: "london-white",
    selectedLineId: "line-1",
    selectedOpeningRuntimeAvailable: true,
    selectedOpeningApprovedContentAvailable: false,
    stage2CoachingPacketKind: "safe_fallback",
    stage2CoachingSafetyStatus: "safe",
    stage2CoachingRuntimeMatched: true,
    stage2CoachingSourceFile: "debug-copy.jsonl",
    approvedContentMatched: false,
    approvedPacketKind: "safe_fallback",
    approvedPacketFallbackReason: "approved_content_not_matched",
    approvedPacketMissReason: "approved_content_not_matched",
    coachQuality: { qualityScore: 70, qualityScoreSource: "debug", usedFallback: true, fallbackReason: "stockfish_provider_unavailable", targetAligned: true, pieceAligned: true, containsDebugLeak: false },
    eventLog: [],
  } as any);

  const snapshotWarnings = warningIds((snapshot as any).providerWarnings);
  assert.equal(snapshotWarnings.includes("local_runtime_loaded"), true);
  assert.equal(snapshotWarnings.includes("approved_content_not_matched"), true);
  assert.equal((snapshot as any).providerWarningSummary.totalWarnings, snapshotWarnings.length);

  const copied = buildDebugCopyEverythingPayload(snapshot as any) as any;
  assert.equal(warningIds(copied.providerWarnings).includes("safe_fallback_used"), true);
  assert.equal(copied.providerWarningSummary.totalWarnings, snapshotWarnings.length);

  const html = renderToStaticMarkup(
    React.createElement(BlundrDiagnosticsPanel, {
      snapshot: snapshot as any,
      enabled: true,
      onEnabledChange: () => {},
      onClearEvents: () => {},
    }),
  );
  assert.equal(typeof html, "string");
  assert.equal(html.length > 0, true);
}

testStage2ProviderDebugCopyEverythingTruth();
console.log("stage2ProviderDebugCopyEverythingTruth ok");
