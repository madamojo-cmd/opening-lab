import assert from "node:assert/strict";

import { buildApprovedFeatureTrace, loadApprovedTracePacket } from "./stage2FeatureTraceTestHelpers";

export function testStage2VisualPlainViewSuppression(): void {
  const packet = loadApprovedTracePacket((entry) => entry.openingId === "italian-white" && entry.moveUci === "f1c4" && entry.status === "approved");
  const trace = buildApprovedFeatureTrace(packet, {
    trainerFrameId: 830,
    trainerView: "plain",
    visibleSurfaceMode: "plain_before_show_more",
    showMoreShown: false,
    selectedOpeningId: packet.openingId,
    selectedLineId: packet.lineId,
    visualRecipe: {
      ...(packet.visualRecipe ?? {}),
      visualRecipeId: packet.visualRecipe?.visualRecipeId ?? packet.packetId ?? "plain-view-test",
      targetMoveUci: packet.moveUci,
    },
  }).featureTrace as any;

  assert.equal(trace.visualResult.plainViewSuppressed, true);
  assert.equal(trace.visualResult.rendered, false);
  assert.equal(trace.visualRecipeResult.rendered, false);
  assert.equal(trace.plainViewLeakSafe, true);
  assert.equal(trace.reviewCandidateEventPreview?.viewMode, "plain");
  assert.equal(trace.reviewCandidateEventPreview?.usedShowMore, false);
  assert.equal(trace.reviewCandidateEventPreview?.coachCardSource, "approved");
}

testStage2VisualPlainViewSuppression();
console.log("stage2VisualPlainViewSuppression ok");
