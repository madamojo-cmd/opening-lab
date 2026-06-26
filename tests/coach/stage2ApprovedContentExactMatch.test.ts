import assert from "node:assert/strict";

import { resolveStage2ApprovedContentPacketCollection } from "../../lib/blundr/stage2ApprovedContent";
import { STAGE2_APPROVED_CONTENT_ENABLED, getStage2ApprovedContentInventorySummary } from "../../lib/blundr/stage2Coaching";

export function testStage2ApprovedContentExactMatch(): void {
  const summary = getStage2ApprovedContentInventorySummary();
  assert.equal(STAGE2_APPROVED_CONTENT_ENABLED, true);
  assert.equal(summary.approvedContentInventoryCount, 21);
  assert.equal(summary.approvedContentMatchedCount, 21);

  const resolution = resolveStage2ApprovedContentPacketCollection({
    openingId: "italian-white",
    playKeyBefore: "e2e4,e7e5,g1f3,b8c6",
    learnerSide: "white",
    sideToMove: "white",
    targetUci: "f1c4",
    targetSan: "Bc4",
    surface: "assisted",
  });

  assert.equal(resolution.kind, "approved_packet");
  if (resolution.kind === "approved_packet") {
    assert.equal(resolution.packet.status, "approved");
    assert.equal(resolution.packet.safetyStatus, "safe");
    assert.equal(resolution.packet.runtimeReconciliation.status, "matched");
    assert.equal((resolution.packet.sourceCandidatePackages ?? [resolution.packet.sourceCandidatePackage]).filter(Boolean).length > 0, true);
    assert.equal(resolution.packet.visualRecipeRefs.length > 0, true);
  }
}

testStage2ApprovedContentExactMatch();
console.log("stage2ApprovedContentExactMatch ok");
