import assert from "node:assert/strict";

import { loadApprovedTracePacket, buildApprovedFeatureTrace } from "./stage2FeatureTraceTestHelpers";

export function testStage2LegacyNoPlainViewBypass(): void {
  const packet = loadApprovedTracePacket((entry) => entry.openingId === "italian-white" && entry.moveUci === "f1c4" && entry.status === "approved");
  const traceBundle = buildApprovedFeatureTrace(packet, {
    trainerFrameId: 944,
    trainerView: "plain",
    visibleSurfaceMode: "plain_before_show_more",
    showMoreShown: false,
    stage2CoachingSurface: "plain_hint",
    selectedOpeningId: packet.openingId,
    selectedLineId: packet.lineId,
    visualRecipe: {
      ...(packet.visualRecipe ?? {}),
      visualRecipeId: packet.visualRecipe?.visualRecipeId ?? packet.packetId ?? "plain-leak-test",
      targetMoveUci: packet.moveUci,
    },
  });

  const trace = traceBundle.featureTrace as any;
  assert.equal(trace.visualResult.plainViewSuppressed, true);
  assert.equal(trace.visualResult.rendered, false);
  assert.equal(trace.plainViewLeakSafe, true);
  assert.equal(trace.reviewCandidateEventPreview?.viewMode, "plain");
  assert.equal(trace.reviewCandidateEventPreview?.usedShowMore, false);
  assert.equal(trace.reviewCandidateEventPreview?.coachCardSource, "approved");
}

testStage2LegacyNoPlainViewBypass();
console.log("stage2LegacyNoPlainViewBypass ok");
