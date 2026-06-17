import assert from "node:assert/strict";

import { buildApprovedFeatureTrace, loadApprovedTracePacket } from "./stage2FeatureTraceTestHelpers";

export function testStage2VisualShowMoreTraceability(): void {
  const packet = loadApprovedTracePacket((entry) => entry.openingId === "italian-white" && entry.moveUci === "f1c4" && entry.status === "approved");
  const trace = buildApprovedFeatureTrace(packet, {
    trainerFrameId: 831,
    trainerView: "plain",
    visibleSurfaceMode: "plain_after_show_more",
    showMoreShown: true,
    selectedOpeningId: packet.openingId,
    selectedLineId: packet.lineId,
    visualRecipe: {
      ...(packet.visualRecipe ?? {}),
      visualRecipeId: packet.visualRecipe?.visualRecipeId ?? packet.packetId ?? "show-more-test",
      targetMoveUci: packet.moveUci,
    },
  }).featureTrace as any;

  assert.equal(trace.visualResult.plainViewSuppressed, false);
  assert.equal(trace.visualResult.rendered, true);
  assert.equal(trace.visualRecipeResult.rendered, true);
  assert.equal(trace.plainViewLeakSafe, true);
  assert.equal(trace.reviewCandidateEventPreview?.usedShowMore, true);
  assert.equal(trace.reviewCandidateEventPreview?.result, "revealed");
}

testStage2VisualShowMoreTraceability();
console.log("stage2VisualShowMoreTraceability ok");
