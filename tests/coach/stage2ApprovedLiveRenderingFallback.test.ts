import assert from "node:assert/strict";

import { buildStage2CoachContext, resolveStage2CoachingPacket } from "../../lib/blundr/stage2Coaching";

export function testStage2ApprovedLiveRenderingFallback(): void {
  const resolution = resolveStage2CoachingPacket(
    buildStage2CoachContext({
      openingId: "unknown-opening",
      playKeyBefore: "e2e4,e7e5",
      learnerSide: "white",
      sideToMove: "white",
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

  assert.equal(resolution.kind, "safe_fallback");
  if (resolution.kind !== "safe_fallback") return;
  assert.equal(resolution.packet.sourceFile, "stage2://safe-fallback");
  assert.equal(resolution.packet.title, "Book move");
  assert.equal(Boolean(resolution.packet.body), true);
  assert.equal(resolution.packet.surface, "assisted");
}

testStage2ApprovedLiveRenderingFallback();
console.log("stage2ApprovedLiveRenderingFallback ok");
