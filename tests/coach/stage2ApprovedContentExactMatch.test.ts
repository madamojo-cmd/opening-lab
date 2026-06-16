import assert from "node:assert/strict";

import { buildStage2CoachContext, resolveStage2CoachingPacket, STAGE2_APPROVED_CONTENT_ENABLED, getStage2ApprovedContentInventorySummary } from "../../lib/blundr/stage2Coaching";

export function testStage2ApprovedContentExactMatch(): void {
  const summary = getStage2ApprovedContentInventorySummary();
  assert.equal(STAGE2_APPROVED_CONTENT_ENABLED, false);
  assert.equal(summary.approvedContentInventoryCount, 21);
  assert.equal(summary.approvedContentMatchedCount, 0);

  const resolution = resolveStage2CoachingPacket(
    buildStage2CoachContext({
      openingId: "italian-white",
      playKeyBefore: "e2e4,e7e5,g1f3,b8c6",
      targetUci: "f1c4",
      targetSan: "Bc4",
      targetPieceType: "b",
      surface: "assisted",
      runtimeBook: {
        status: "ready",
        candidateCount: 2,
        topCandidateUci: "f1c4",
        topCandidateSan: "Bc4",
        topCandidateRank: 1,
        topCandidateTotalGames: 8123,
        bookExhausted: false,
      },
      plainRevealState: "hidden",
    }),
  );

  assert.equal(resolution.kind, "safe_fallback");
  if (resolution.kind === "safe_fallback") {
    assert.equal(resolution.packet.status, "approved");
    assert.equal(resolution.packet.safetyStatus, "safe");
    assert.equal(resolution.packet.runtimeReconciliation.status, "matched");
    assert.equal(resolution.packet.sourceFile, "stage2://safe-fallback");
    assert.equal(resolution.packet.visualRecipeRefs.length, 0);
  }
}

testStage2ApprovedContentExactMatch();
console.log("stage2ApprovedContentExactMatch ok");
