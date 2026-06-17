import assert from "node:assert/strict";

import { buildApprovedFeatureTrace, loadApprovedTracePacket } from "./stage2FeatureTraceTestHelpers";

export function testStage2FeatureTraceReviewEventReadiness(): void {
  const packet = loadApprovedTracePacket((entry) => entry.openingId === "queens-gambit-white" && entry.moveUci === "e2e4" && entry.status === "approved");
  const stable = buildApprovedFeatureTrace(packet, {
    trainerFrameId: 670,
    selectedOpeningId: packet.openingId,
    selectedLineId: packet.lineId,
    visibleSurfaceMode: "assisted",
    visualRecipe: packet.visualRecipe,
    visualRecipeMoveUci: packet.moveUci,
    visualRecipeMoveSan: packet.moveSan,
  }).featureTrace as any;
  assert.equal(stable.reviewCandidateEventEligible, true);
  assert.equal(stable.reviewCandidateEventPreview?.openingId, packet.openingId);
  assert.equal(stable.reviewCandidateEventPreview?.targetUci, packet.moveUci);
  assert.equal(stable.reviewCandidateEventPreview?.result, "not_attempted");

  const terminal = buildApprovedFeatureTrace(packet, {
    trainerFrameId: 671,
    trainerPhase: "terminal",
    isUserTurn: false,
    currentInstructionFrame: { kind: "terminal", targetSource: "opening_tree" },
    currentInstructionFrameKind: "terminal",
    selectedOpeningId: packet.openingId,
    selectedLineId: packet.lineId,
    visibleSurfaceMode: "terminal",
    visualRecipe: null,
    renderedVisualPrimitiveCount: 0,
    surfaceVisualPrimitiveCount: 0,
  }).featureTrace as any;
  assert.equal(terminal.reviewCandidateEventEligible, false);
  assert.equal(terminal.reviewCandidateEventPreview, null);
  assert.equal(terminal.missingReasons.includes("not_instructional_frame"), true);
}

testStage2FeatureTraceReviewEventReadiness();
console.log("stage2FeatureTraceReviewEventReadiness ok");
