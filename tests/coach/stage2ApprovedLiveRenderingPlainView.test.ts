import assert from "node:assert/strict";

import { buildStage2CoachContext, resolveStage2CoachingPacket } from "../../lib/blundr/stage2Coaching";
import { findApprovedPacket, packetPlayKeyAtTarget, packetPlayKeyBefore } from "./stage2ApprovedContentTestHelpers";

export function testStage2ApprovedLiveRenderingPlainView(): void {
  const packet = findApprovedPacket((entry) => entry.openingId === "italian-white" && entry.moveUci === "f1c4" && entry.status === "approved");
  const resolution = resolveStage2CoachingPacket(
    buildStage2CoachContext({
      openingId: packet.openingId,
      playKeyBefore: packetPlayKeyBefore(packet),
      playKey: packetPlayKeyAtTarget(packet),
      learnerSide: packet.learnerSide,
      sideToMove: packet.sideToMove,
      targetUci: packet.moveUci,
      targetSan: packet.moveSan,
      targetPieceType: "b",
      surface: "plain_hint",
      runtimeBook: {
        status: "ready",
        candidateCount: 1,
        topCandidateUci: packet.moveUci,
        topCandidateSan: packet.moveSan,
        topCandidateRank: 1,
        topCandidateTotalGames: 1000,
        bookExhausted: false,
      },
      plainRevealState: "hidden",
    }),
  );

  assert.equal(resolution.kind, "approved_packet");
  if (resolution.kind !== "approved_packet") return;
  assert.equal(resolution.packet.surface, "plain_hint");
  const hintText = `${resolution.packet.title} ${resolution.packet.body} ${resolution.packet.hint ?? ""}`.toLowerCase();
  assert.equal(hintText.includes(packet.moveUci.toLowerCase()), false);
  assert.equal(hintText.includes(String(packet.moveSan).toLowerCase()), false);
}

testStage2ApprovedLiveRenderingPlainView();
console.log("stage2ApprovedLiveRenderingPlainView ok");
