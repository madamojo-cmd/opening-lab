import assert from "node:assert/strict";

import { buildTrainerFrameResolution } from "../../lib/blundr/debug/buildTrainerFrameResolution";
import { buildStage2CoachContext, resolveStage2CoachingPacket } from "../../lib/blundr/stage2Coaching";
import { findApprovedPacket, packetPlayKeyAtTarget, packetPlayKeyBefore } from "./stage2ApprovedContentTestHelpers";
import { buildLegacyAuditFrameResolution } from "./stage2LegacyNoBypassTestHelpers";

export function testStage2LegacyNoCoachCardBypass(): void {
  const packet = findApprovedPacket((entry) => entry.openingId === "italian-white" && entry.moveUci === "f1c4" && entry.status === "approved");
  const exactResolution = resolveStage2CoachingPacket(
    buildStage2CoachContext({
      openingId: packet.openingId,
      playKeyBefore: packetPlayKeyBefore(packet),
      playKey: packetPlayKeyAtTarget(packet),
      learnerSide: packet.learnerSide,
      sideToMove: packet.sideToMove,
      targetUci: packet.moveUci,
      targetSan: packet.moveSan,
      targetPieceType: "b",
      surface: "assisted",
      runtimeBook: {
        status: "ready",
        candidateCount: 1,
        topCandidateUci: packet.moveUci,
        topCandidateSan: packet.moveSan,
        topCandidateRank: 1,
        topCandidateTotalGames: 1000,
        bookExhausted: false,
      },
      plainRevealState: "revealed",
    }),
  );
  assert.equal(exactResolution.kind, "approved_packet");

  const mismatchResolution = resolveStage2CoachingPacket(
    buildStage2CoachContext({
      openingId: packet.openingId,
      playKeyBefore: packetPlayKeyBefore(packet),
      playKey: packetPlayKeyAtTarget(packet),
      learnerSide: packet.learnerSide,
      sideToMove: packet.sideToMove,
      targetUci: "g1f3",
      targetSan: "Nf3",
      targetPieceType: "b",
      surface: "plain_hint",
      runtimeBook: {
        status: "ready",
        candidateCount: 0,
        topCandidateUci: null,
        topCandidateSan: null,
        topCandidateRank: null,
        topCandidateTotalGames: null,
        bookExhausted: true,
      },
      plainRevealState: "hidden",
      approvedPacketsPath: "data/blundr/does-not-exist.jsonl",
    }),
  );
  assert.equal(mismatchResolution.kind === "safe_fallback" || mismatchResolution.kind === "none", true);

  const frame = buildTrainerFrameResolution({
    ...buildLegacyAuditFrameResolution({
      actualCoachCardTitle: "pipeline fallback title",
      actualCoachCardBody: "pipeline fallback body",
      stage2ApprovedPacketKind: "safe_fallback",
      stage2ApprovedPacketMatched: false,
      stage2ApprovedPacketMissReason: "approved_packet_exact_match_not_found",
      stage2ApprovedPacketFallbackReason: "safe_fallback_used",
      stage2ApprovedPacketVisualSource: "fallback_current_surface",
      stage2CoachingPacketKind: "safe_fallback",
      stage2CoachingSafetyStatus: "safe",
      stage2CoachingRuntimeMatched: false,
      coachQuality: { qualityScore: 60, qualityScoreSource: "verified_safe_fallback", lowQualityTriggered: true, lowQualityThreshold: 65, lowQualityBasedOn: "fallback" },
    } as any),
    actualCoachCardTitle: "pipeline fallback title",
    actualCoachCardBody: "pipeline fallback body",
    actualCoachCardSource: "surfaceCoachCardDecision",
    stage2ApprovedPacketKind: "safe_fallback",
    stage2ApprovedPacketMatched: false,
    stage2ApprovedPacketMissReason: "approved_packet_exact_match_not_found",
    stage2ApprovedPacketFallbackReason: "safe_fallback_used",
    stage2CoachingPacketKind: "safe_fallback",
  } as any);

  assert.equal(frame.acceptedTargetUci, "e2e4");
  assert.equal(frame.coachCard.finalRendered.source, "surfaceCoachCardDecision");
  assert.equal(frame.coachCard.finalRendered.title, "pipeline fallback title");
  assert.equal(frame.coachCard.finalRendered.body, "pipeline fallback body");
  assert.equal(frame.coachCard.renderedCopyAuthority === "pipeline_coach_decision" || frame.coachCard.renderedCopyAuthority === "visible_surface_v28", true);
}

testStage2LegacyNoCoachCardBypass();
console.log("stage2LegacyNoCoachCardBypass ok");
