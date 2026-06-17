import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { BlundrDiagnosticsPanel, buildDebugCopyEverythingPayload } from "../../components/debug/BlundrDiagnosticsPanel";
import { buildStage2FeatureTrace } from "../../lib/blundr/debug/buildStage2FeatureTrace";
import { buildTrainerDebugSnapshot } from "../../lib/blundr/debug/trainerDebugSnapshot";

function providerWarningIds(value: any): string[] {
  return Array.isArray(value) ? value.map((entry) => String(entry.warningId)) : [];
}

export function testStage2ProviderWarningDebugTruth(): void {
  const baseInput = {
    debugEnabled: true,
    trainerFrameId: 905,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "continuation",
    isUserTurn: true,
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    selectedOpeningId: "london-white",
    selectedLineId: "line-1",
    instructionTargetUci: "g1f3",
    instructionTargetSan: "Nf3",
    instructionTargetPieceType: "n",
    coachMoveUci: "g1f3",
    coachPieceType: "n",
    acceptedTargetUci: "g1f3",
    runtimeDataSource: "local_crawled_package",
    liveLichessCalled: false,
    runtimeAvailable: true,
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
    candidateSource: "local_runtime_package",
    stage2CoachingResolverEnabled: true,
    stage2ApprovedContentEnabled: true,
    stage2SafeFallbackEnabled: true,
    stage2CoachingPacketKind: "safe_fallback",
    stage2CoachingSafetyStatus: "safe",
    stage2CoachingSourceFile: "provider-warning-safe-fallback.jsonl",
    stage2CoachingRuntimeMatched: true,
    stage2ApprovedPacketMatched: false,
    stage2ApprovedPacketKind: "safe_fallback",
    stage2ApprovedPacketFallbackReason: "approved_content_not_matched",
    coachDecision: {
      shouldShowCoachCard: true,
      title: "Nf3 — Develop the knight",
      body: "Develop the knight.",
      buttons: ["hint"],
      debug: {
        coachDecisionSource: "verified_safe_fallback",
        verifiedFallbackUsed: true,
        fallbackReason: "stockfish_provider_unavailable",
        coachMoveUci: "g1f3",
        coachPieceType: "n",
      },
    },
    displayedCoachDecision: {
      title: "Nf3 — Develop the knight",
      body: "Develop the knight.",
      buttons: ["hint"],
      debug: {
        coachDecisionSource: "displayedCoachDecision",
        coachMoveUci: "g1f3",
        coachPieceType: "n",
      },
    },
    visibleTeachingSurface: {
      owner: "v28_visible_surface",
      mode: "assisted",
      coach: {
        shouldRender: true,
        title: "Nf3 — Develop the knight",
        body: "Develop the knight.",
        buttons: ["hint"],
      },
      visual: { lines: [{ from: "g1", to: "f3" }] },
      actions: [],
    },
    presentationFrame: {
      visual: { shouldRender: true, source: "visible_surface_v28" },
      coach: { owner: "intent_first_coach" },
      legacy: {},
    },
    actualCoachCardTitle: "Nf3 — Develop the knight",
    actualCoachCardBody: "Develop the knight.",
    actualCoachCardButtons: ["hint"],
    actualCoachCardSource: "surfaceCoachCardDecision",
    actualVisualSource: "visible_surface_v28",
    renderedVisualPrimitiveCount: 1,
    surfaceVisualPrimitiveCount: 1,
    coachQuality: {
      qualityScore: 74,
      qualityScoreSource: "verified_safe_fallback",
      usedFallback: true,
      fallbackReason: "stockfish_provider_unavailable",
      targetAligned: true,
      pieceAligned: true,
      containsDebugLeak: false,
    },
    eventLog: [],
  };

  const snapshot = buildTrainerDebugSnapshot(baseInput as any);
  const snapshotWarnings = providerWarningIds((snapshot as any).providerWarnings);
  assert.equal(snapshotWarnings.includes("local_runtime_loaded"), true);
  assert.equal(snapshotWarnings.includes("no_live_lichess_required"), true);
  assert.equal(snapshotWarnings.includes("stockfish_unavailable"), true);
  assert.equal(snapshotWarnings.includes("approved_content_not_matched"), true);
  assert.equal(snapshotWarnings.includes("safe_fallback_used"), true);
  assert.equal((snapshot as any).providerWarningSummary.totalWarnings, snapshotWarnings.length);
  assert.equal((snapshot as any).providerWarningSummary.byProviderId.local_runtime_package >= 2, true);
  assert.equal((snapshot as any).runtime.liveLichessCalled, false);
  assert.equal((snapshot as any).runtime.runtimeDataSource, "local_crawled_package");

  const copyEverything = buildDebugCopyEverythingPayload(snapshot as any);
  assert.equal(providerWarningIds((copyEverything as any).providerWarnings).includes("stockfish_unavailable"), true);
  assert.equal((copyEverything as any).providerWarningSummary.totalWarnings, snapshotWarnings.length);

  const trace = buildStage2FeatureTrace({
    ...baseInput,
    trainerFrameResolution: (snapshot as any).trainerFrameResolution,
    featureTraceTimeline: [],
  } as any).featureTrace as any;
  assert.equal(providerWarningIds(trace.providerWarnings).includes("stockfish_unavailable"), true);
  assert.equal(providerWarningIds(trace.providerWarnings).includes("approved_content_not_matched"), true);
  assert.equal(trace.providerWarningSummary.totalWarnings, trace.providerWarnings.length);
  assert.equal(trace.approvedContentMatched, false);
  assert.equal(trace.coachCardResult.fallbackUsed, true);
  assert.equal(trace.coachCardResult.fallbackReason, "stockfish_provider_unavailable");

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

testStage2ProviderWarningDebugTruth();
console.log("stage2ProviderWarningDebugTruth ok");
