import assert from "node:assert/strict";

import { applyStage2CoachCopyEnrichment, buildStage2CoachContext, resolveStage2CoachingPacket } from "../../lib/blundr/stage2Coaching";

export function testStage2ApprovedContentPlainViewNoLeak(): void {
  const context = buildStage2CoachContext({
    openingId: "italian-white",
    playKeyBefore: "e2e4,e7e5,g1f3,b8c6",
    learnerSide: "white",
    sideToMove: "white",
    targetUci: "f1c4",
    targetSan: "Bc4",
    targetPieceType: "b",
    surface: "plain_hint",
    runtimeBook: {
      status: "ready",
      candidateCount: 1,
      topCandidateUci: "f1c4",
      topCandidateSan: "Bc4",
      topCandidateRank: 1,
      topCandidateTotalGames: 8123,
      bookExhausted: false,
    },
    plainRevealState: "hidden",
  });

  const resolution = resolveStage2CoachingPacket(context);
  assert.equal(resolution.kind, "approved_packet");
  if (resolution.kind !== "approved_packet") return;

  const packetText = [resolution.packet.title, resolution.packet.body, resolution.packet.hint ?? "", resolution.packet.showMore ?? ""].join("\n").toLowerCase();
  assert.equal(packetText.includes("f1c4"), false);
  assert.equal(packetText.includes("bc4"), false);

  const enriched = applyStage2CoachCopyEnrichment({
    currentMode: "plain_before_show_more",
    targetUci: "f1c4",
    targetSan: "Bc4",
    baseCopy: { title: "Base title", body: "Base body" },
    resolution,
  });
  assert.equal(enriched.applied, true);
  assert.equal(enriched.copy.title.length > 0, true);
  assert.equal(enriched.copy.body.includes("f1c4"), false);
  assert.equal(enriched.copy.body.includes("bc4"), false);
}

testStage2ApprovedContentPlainViewNoLeak();
console.log("stage2ApprovedContentPlainViewNoLeak ok");
