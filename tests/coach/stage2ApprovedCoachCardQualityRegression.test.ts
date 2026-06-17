import assert from "node:assert/strict";

import { buildStage2CoachContext, resolveStage2CoachingPacket } from "../../lib/blundr/stage2Coaching";
import { getStage2OpeningAvailabilitySummary } from "../../lib/blundr/openings/openingAvailability";
import { findApprovedPacket, packetPlayKeyAtTarget, packetPlayKeyBefore } from "./stage2ApprovedContentTestHelpers";

export function testStage2ApprovedCoachCardQualityRegression(): void {
  const packet = findApprovedPacket((entry) => entry.packetId === "italian-white.line-001.ply-05.f1c4");
  const exact = resolveStage2CoachingPacket(
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
  assert.equal(exact.kind, "approved_packet");
  if (exact.kind !== "approved_packet") return;
  assert.equal(exact.packet.packetId, packet.packetId);
  assert.equal(exact.packet.status, "approved");
  assert.equal(exact.packet.approvalReadiness, "app_validated");

  const mismatch = resolveStage2CoachingPacket(
    buildStage2CoachContext({
      openingId: packet.openingId,
      playKeyBefore: packetPlayKeyBefore(packet),
      playKey: packetPlayKeyAtTarget(packet),
      learnerSide: packet.learnerSide,
      sideToMove: packet.sideToMove,
      targetUci: "a1a2",
      targetSan: "Ra2",
      targetPieceType: "r",
      surface: "assisted",
      runtimeBook: {
        status: "ready",
        candidateCount: 0,
        topCandidateUci: null,
        topCandidateSan: null,
        topCandidateRank: null,
        topCandidateTotalGames: null,
        bookExhausted: true,
      },
      plainRevealState: "revealed",
    }),
  );
  assert.equal(mismatch.kind === "safe_fallback" || mismatch.kind === "none", true);

  const summary = getStage2OpeningAvailabilitySummary();
  assert.equal(summary.runtimeAvailableCount, 21);
  assert.equal(summary.visibleOpeningCount, 21);
  assert.equal(summary.publicOpeningCount, 0);
  assert.equal(summary.betaOpeningCount, 1);
  assert.equal(summary.liveLichessCalled, false);
}

testStage2ApprovedCoachCardQualityRegression();
console.log("stage2ApprovedCoachCardQualityRegression ok");
