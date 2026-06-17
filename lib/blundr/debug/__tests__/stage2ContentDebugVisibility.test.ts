import assert from "node:assert/strict";
import fs from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { buildTrainerDebugSnapshot } from "../trainerDebugSnapshot";
import {
  BlundrDiagnosticsPanel,
  buildDebugCopyEverythingPayload,
  buildFullSessionDebugPayload,
} from "../../../../components/debug/BlundrDiagnosticsPanel";

export function testStage2ContentDebugVisibility(): void {
  assert.doesNotThrow(() => buildDebugCopyEverythingPayload(null));
  assert.doesNotThrow(() => buildDebugCopyEverythingPayload(undefined));

  const nullPayload = buildDebugCopyEverythingPayload(null);
  assert.equal(nullPayload.generatedAt, null);
  assert.equal(nullPayload.frame, null);

  const snapshot = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 901,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "continuation",
    isUserTurn: true,
    fen: "rnbqkbnr/pp2pppp/8/2pp4/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",
    selectedOpeningId: "italian-white",
    runtimeBookQueried: true,
    runtimeBookOpeningId: "italian-white",
    runtimeBookPlayKeyBefore: "e2e4,e7e5,g1f3,b8c6,f1c4",
    runtimeBookStatus: "ready",
    runtimeBookCandidateCount: 2,
    runtimeBookTopCandidateUci: "e4d5",
    runtimeBookTopCandidateSan: "exd5",
    runtimeBookTopCandidateRank: 1,
    runtimeBookTopCandidateGames: 999,
    runtimeBookBookExhausted: false,
    runtimeBookFallbackUsed: false,
    runtimeBookFallbackAuthority: null,
    stage2CoachingResolverEnabled: true,
    stage2ApprovedContentEnabled: true,
    stage2SafeFallbackEnabled: true,
    stage2CoachingPacketKind: "approved_packet",
    stage2CoachingSafetyStatus: "safe",
    stage2CoachingSurface: "assisted",
    stage2CoachingSourceFile: "stage2://approved",
    stage2CoachingRuntimeMatched: true,
    stage2ApprovedPacketMatched: true,
    stage2ApprovedPacketKind: "approved_packet",
    stage2ApprovedPacketId: "italian-white.line-001.ply-05.f1c4",
    stage2ApprovedPacketSourceBundle: "stage2-approved-content-approved-5openings-v1",
    stage2ApprovedPacketSourceFile: "data/blundr/stage2-approved-content-approved-5openings-v1/approved-packets.jsonl",
    stage2ApprovedPacketStatus: "approved",
    stage2ApprovedPacketApprovalReadiness: "app_validated",
    stage2ApprovedPacketMissReason: null,
    stage2ApprovedPacketFallbackReason: null,
    stage2ApprovedPacketVisualSource: "approved_recipe",
    presentationFrame: { visual: { shouldRender: true, source: "continuation_candidate" }, coach: { owner: "intent_first_coach" }, legacy: {} },
    eventLog: [],
  });

  assert.equal((snapshot.continuation as any).runtimeBookQueried, true);
  assert.equal((snapshot.continuation as any).runtimeBookOpeningId, "italian-white");
  assert.equal((snapshot.continuation as any).runtimeBookCandidateCount, 2);
  assert.equal((snapshot.continuation as any).runtimeBookTopCandidateUci, "e4d5");
  assert.equal((snapshot as any).runtime.approvedContentInventoryCount, 21);
  assert.equal((snapshot as any).runtime.approvedContentMatchedCount, 21);
  assert.equal((snapshot as any).runtime.selectedOpeningContentStatus, "approved");
  assert.equal((snapshot as any).runtime.selectedOpeningApprovedContentAvailable, true);
  assert.equal((snapshot as any).runtime.stage2CoachingTargetMatched, true);
  assert.equal((snapshot as any).runtime.stage2CoachingPlainViewSafe, true);
  assert.equal((snapshot as any).runtime.stage2CoachingReasonRejected, null);
  assert.equal((snapshot as any).runtime.approvedPacketMatched, true);
  assert.equal((snapshot as any).runtime.approvedPacketKind, "approved_packet");

  const copyEverythingPayload = buildDebugCopyEverythingPayload(snapshot);
  const payloadString = JSON.stringify(copyEverythingPayload);
  assert.equal(payloadString.includes("\"runtimeBook\""), true);
  assert.equal(payloadString.includes("\"openingId\":\"italian-white\""), true);
  assert.equal(payloadString.includes("\"topCandidateUci\":\"e4d5\""), true);
  assert.equal(payloadString.includes("\"stage2Coaching\""), true);
  assert.equal((copyEverythingPayload.runtime as any).approvedContentInventoryCount, 21);
  assert.equal((copyEverythingPayload.featureTrace as any).approvedPacket.matched, true);
  assert.equal((copyEverythingPayload.featureTrace as any).approvedPacket.packetKind, "approved_packet");
  assert.equal(Object.prototype.hasOwnProperty.call(copyEverythingPayload, "history"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(copyEverythingPayload, "derivedAudit"), false);

  assert.doesNotThrow(() =>
    buildFullSessionDebugPayload({
      currentSnapshot: null,
      historySnapshots: [],
    }),
  );
  assert.doesNotThrow(() =>
    buildFullSessionDebugPayload({
      currentSnapshot: null,
      historySnapshots: [],
      coachTimeline: [],
      coachCardRenderTimeline: [],
      surfaceTimeline: [],
      actionTimeline: [],
      visualTimeline: [],
      plainLeakTimeline: [],
      maiaTimeline: [],
      eventLog: [],
    }),
  );

  const fakeHistory = [1, 2, 3].map((frameId) => ({
    generatedAt: frameId,
    build: { debugEnabled: true },
    frame: {
      trainerFrameId: frameId,
      expectedMoveSan: frameId === 3 ? "Nf3" : "e4",
      expectedMoveUci: frameId === 3 ? "g1f3" : "e2e4",
    },
    coach: {
      visibleTitle: "Active Piece Development",
      visibleBody: frameId === 3 ? "Continue the position" : "Improve your position",
      coachDecisionSource: frameId === 3 ? "runtime_safe_fallback" : "live_coach",
      selectedTemplateId: frameId === 3 ? "fallback:verified_safe" : "tpl:active_piece_development",
      targetAligned: frameId === 1,
      pieceAligned: frameId !== 2,
    },
    coachPipeline: {
      qualityScore: 88,
      selectedTemplateId: frameId === 3 ? "fallback:verified_safe" : "tpl:active_piece_development",
    },
    continuation: {
      runtimeSafeFallbackUsed: frameId === 3,
      runtimeSafeFallbackReason: frameId === 3 ? "claim_validation_failed" : null,
      genericFallbackUsed: frameId === 3,
      stage2CoachingPacketKind: frameId === 3 ? "safe_fallback" : "approved_packet",
      stage2CoachingSafetyStatus: frameId === 3 ? "safe" : "approved",
      stage2CoachingSourceFile: frameId === 3 ? "stage2://safe-fallback" : "stage2://approved",
    },
    features: {
      featurePacketExists: true,
      tacticalMotifSummary: "blocked_debug_only",
      whyVisualRecipeOpportunityLost: "not_exposed_from_module",
      whyContinuationCandidateOpportunityLost: "not_exposed_from_module",
      plainLeakDetected: frameId === 2,
    },
    visual: {
      visualRecipeTargetMatchesInstructionTarget: frameId !== 1,
    },
    actions: {
      revealTargetMismatchDetected: frameId === 2,
    },
    health: {
      criticalIssues: frameId === 2 ? ["coach_piece_mismatch"] : [],
      warnings: frameId === 3 ? ["fallback_used"] : [],
    },
  })) as any[];

  const fullPayload = buildFullSessionDebugPayload({
    currentSnapshot: snapshot,
    historySnapshots: fakeHistory,
    coachTimeline: fakeHistory.map((entry) => ({
      entryKind: "instructional",
      trainerFrameId: entry.frame.trainerFrameId,
      qualityScore: entry.coachPipeline.qualityScore,
      visibleTitle: entry.coach.visibleTitle,
      visibleBody: entry.coach.visibleBody,
      coachDecisionSource: entry.coach.coachDecisionSource,
      runtimeSafeFallbackUsed: entry.continuation.runtimeSafeFallbackUsed,
    })),
    coachPipelineTimeline: fakeHistory.map((entry) => ({
      trainerFrameId: entry.frame.trainerFrameId,
      entryKind: "instructional",
      visibleTitle: entry.frame.trainerFrameId === 3 ? "e4 — Challenge the center" : entry.coach.visibleTitle,
      visibleBody: entry.frame.trainerFrameId === 3 ? "Move the pawn to e4. This contests central space." : entry.coach.visibleBody,
      instructionTargetUci: entry.frame.expectedMoveUci,
      instructionTargetSan: entry.frame.expectedMoveSan,
      instructionTargetPieceType: "p",
      trainingMode: "continuation",
      trainerPhase: "ready_for_user",
      coachDecisionSource: entry.coach.coachDecisionSource,
    })),
    coachCardRenderTimeline: [
      {
        frameId: 3,
        trainerFrameId: 3,
        trainerPhase: "ready_for_user",
        trainingMode: "continuation",
        isUserTurn: true,
        instructionTargetUci: "g1f3",
        instructionTargetSan: "Nf3",
        instructionTargetPieceType: "n",
        actualCoachCardTitle: "Active Piece Development",
        actualCoachCardBody: "Improve your position and keep the position moving.",
        actualCoachCardSource: "surfaceCoachCardDecision",
        pipelineCoachCardTitle: "Nf3 — Develop and prepare castling",
        pipelineCoachCardBody: "Move the knight to f3. This supports central control and king safety.",
        pipelineCoachCardSource: "live_coach",
      },
    ],
    surfaceTimeline: [{ frameId: 1, mode: "assisted" }],
    actionTimeline: [{ frameId: 2, action: "show_more" }],
    visualTimeline: [{ frameId: 2, rendered: true }],
    plainLeakTimeline: [{ frameId: 2, preShowMoreLeak: true }],
    maiaTimeline: [{ frameId: 1, providerStatus: "disabled" }],
    eventLog: [{ id: 1, type: "frame_changed" }],
  });

  assert.equal(fullPayload.current != null, true);
  assert.equal(Array.isArray((fullPayload as any).history?.snapshots), true);
  assert.equal(Array.isArray((fullPayload as any).history?.coachCardRenderTimeline), true);
  assert.equal(Array.isArray((fullPayload as any).history?.coachPipelineTimeline), true);
  assert.equal(Array.isArray((fullPayload as any).history?.visualTimeline), true);
  assert.equal(Array.isArray((fullPayload as any).history?.surfaceModeTransitionTimeline), true);
  assert.equal(typeof (fullPayload as any).derivedAudit?.qualityScoreDistribution, "object");
  assert.equal(typeof (fullPayload as any).derivedAudit?.pipelineQualityScoreDistribution, "object");
  assert.equal(typeof (fullPayload as any).derivedAudit?.renderedQualityScoreDistribution, "object");
  assert.equal(Array.isArray((fullPayload as any).derivedAudit?.repeatedTitles), true);
  assert.equal(Array.isArray((fullPayload as any).derivedAudit?.fallbackFrames), true);
  assert.equal(Array.isArray((fullPayload as any).derivedAudit?.claimValidationFailedFrames), true);
  assert.equal(Array.isArray((fullPayload as any).derivedAudit?.stage2PacketUsage), true);
  assert.equal(Array.isArray((fullPayload as any).derivedAudit?.featureExposureGaps), true);
  assert.equal(Array.isArray((fullPayload as any).derivedAudit?.renderedVsPipelineCopyMismatches), true);
  assert.equal(Array.isArray((fullPayload as any).derivedAudit?.restrictedLineExhaustedFrames), true);
  assert.equal(Array.isArray((fullPayload as any).derivedAudit?.pendingOpponentRequestStallFrames), true);
  assert.equal((fullPayload as any).derivedAudit?.qualityScoreDistribution?.["88"], 3);
  assert.equal(
    ((fullPayload as any).derivedAudit?.repeatedTitles ?? []).some((entry: any) => entry.title === "Active Piece Development"),
    true,
  );
  assert.equal(
    ((fullPayload as any).derivedAudit?.genericTitleHits ?? []).some((entry: any) => entry.title === "Active Piece Development"),
    true,
  );
  assert.equal(
    ((fullPayload as any).derivedAudit?.claimValidationFailedFrames ?? []).some((entry: any) => entry.frameId === 3),
    true,
  );
  assert.equal(
    ((fullPayload as any).derivedAudit?.renderedVsPipelineCopyMismatches ?? []).some((entry: any) => entry.frameId === 3),
    true,
  );
  assert.equal(
    ((fullPayload as any).derivedAudit?.renderedVsPipelineCopyMismatches ?? []).some((entry: any) => entry.reason === "raw_or_generic_rendered_copy_overrode_move_specific_pipeline_copy"),
    true,
  );
  assert.equal(
    ((fullPayload as any).derivedAudit?.warningFrames ?? []).some((entry: any) => String(entry?.warnings ?? []).includes("identical_rendered_quality_scores_detected")),
    true,
  );
  assert.equal(Array.isArray((fullPayload as any).history?.snapshots), true);
  assert.equal(((fullPayload as any).history?.snapshots ?? []).length, 3);

  const cleanAuthorityPayload = buildFullSessionDebugPayload({
    currentSnapshot: null,
    historySnapshots: [],
    coachTimeline: [],
    coachPipelineTimeline: [],
    coachCardRenderTimeline: [
      {
        frameId: 4,
        trainerFrameId: 4,
        trainerPhase: "ready_for_user",
        trainingMode: "restricted",
        isUserTurn: true,
        instructionTargetUci: "e2e4",
        instructionTargetSan: "e4",
        actualCoachCardTitle: "e4 — Challenge the center",
        actualCoachCardBody: "Move the pawn to e4. This contests central space and opens lines for your pieces.",
        visibleTitle: "e4 — Challenge the center",
        visibleBody: "Move the pawn to e4. This contests central space and opens lines for your pieces.",
        preAuthoritySurfaceTitle: "Active Piece Development",
        preAuthoritySurfaceBody: "Play e4 with the pawn; it improves central control through Active Piece Development.",
        pipelineCoachCardTitle: "e4 — Challenge the center",
        pipelineCoachCardBody: "Move the pawn to e4. This contests central space and opens lines for your pieces.",
        pipelineQualityScore: 88,
        renderedQualityScore: 88,
      },
    ],
  });
  assert.equal((cleanAuthorityPayload as any).derivedAudit?.renderedVsPipelineMismatchCount, 0);
  assert.equal((cleanAuthorityPayload as any).derivedAudit?.renderedRawConceptLabelCount, 0);

  const panelSource = fs.readFileSync("components/debug/BlundrDiagnosticsPanel.tsx", "utf8");
  assert.equal(panelSource.includes("Copy ALL Session Debug"), true);
  assert.equal(panelSource.includes("JSON.stringify(fullSessionDebug, null, 2)"), true);

  const html = renderToStaticMarkup(
    React.createElement(BlundrDiagnosticsPanel, {
      snapshot,
      enabled: true,
      onEnabledChange: () => {},
      onClearEvents: () => {},
    }),
  );
  assert.equal(html.includes("Blundr Diagnostics"), true);
}
