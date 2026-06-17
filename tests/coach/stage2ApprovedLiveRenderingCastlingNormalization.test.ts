import assert from "node:assert/strict";

import { buildStage2CoachContext, resolveStage2CoachingPacket } from "../../lib/blundr/stage2Coaching";
import { findApprovedPacket, packetPlayKeyAtTarget, packetPlayKeyBefore } from "./stage2ApprovedContentTestHelpers";

export function testStage2ApprovedLiveRenderingCastlingNormalization(): void {
  const packet = findApprovedPacket((entry) => entry.openingId === "italian-black" && entry.moveUci === "e8g8" && entry.sourceRuntimeMoveUci === "e8h8");
  const resolution = resolveStage2CoachingPacket(
    buildStage2CoachContext({
      openingId: packet.openingId,
      playKeyBefore: packetPlayKeyBefore(packet),
      playKey: packetPlayKeyAtTarget(packet),
      learnerSide: packet.learnerSide,
      sideToMove: packet.sideToMove,
      targetUci: packet.moveUci,
      targetSan: packet.moveSan,
      targetPieceType: "k",
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

  assert.equal(resolution.kind, "approved_packet");
  if (resolution.kind !== "approved_packet") return;
  assert.equal(resolution.packet.moveUci, "e8g8");
  assert.equal(resolution.packet.sourceRuntimeMoveUci, "e8h8");
  assert.equal(resolution.packet.normalizedMoveUci, "e8g8");
  assert.equal(resolution.packet.visualRecipe.targetMoveUci, "e8g8");
  assert.equal(resolution.packet.visualRecipe.arrows.includes("e8->g8"), true);
  assert.equal(resolution.packet.visualRecipe.arrows.some((arrow) => arrow.includes("h8") || arrow.includes("h1")), false);
}

testStage2ApprovedLiveRenderingCastlingNormalization();
console.log("stage2ApprovedLiveRenderingCastlingNormalization ok");
