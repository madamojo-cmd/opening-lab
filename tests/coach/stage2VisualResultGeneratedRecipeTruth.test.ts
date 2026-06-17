import assert from "node:assert/strict";

import { buildApprovedFeatureTrace, loadApprovedTracePacket } from "./stage2FeatureTraceTestHelpers";

export function testStage2VisualResultGeneratedRecipeTruth(): void {
  const packet = loadApprovedTracePacket((entry) => entry.openingId === "london-white" && entry.moveUci === "d2d4" && entry.status === "approved");
  const trace = buildApprovedFeatureTrace(packet, {
    trainerFrameId: 821,
    trainerView: "assisted",
    visibleSurfaceMode: "assisted",
    actualVisualSource: "generated_recipe",
    stage2CoachingPacketKind: "none",
    stage2ApprovedPacketMatched: false,
    stage2ApprovedPacketKind: "none",
    stage2ApprovedPacketVisualSource: "generated_recipe",
    stage2ApprovedPacketStatus: null,
    stage2ApprovedPacketApprovalReadiness: null,
    renderedVisualPrimitiveCount: 2,
    surfaceVisualPrimitiveCount: 0,
    visualRecipe: packet.visualRecipe,
    presentationFrame: { visual: { shouldRender: true, source: "generated_recipe" }, coach: { owner: "intent_first_coach" }, legacy: {} },
  }).featureTrace as any;

  assert.equal(trace.visualResult.visualSource, "generated_recipe");
  assert.equal(trace.visualResult.rendered, true);
  assert.equal(trace.visualResult.approvedRecipeMatched, false);
  assert.equal(trace.visualResult.generatedRecipeRendered, true);
  assert.equal(trace.visualResult.fallbackSurfaceVisualsRendered, false);
  assert.equal(trace.visualSource, "generated_recipe");
  assert.equal(trace.visualRecipeResult.authority, "generated_recipe");
  assert.equal(trace.visualRecipeResult.rendered, true);
}

testStage2VisualResultGeneratedRecipeTruth();
console.log("stage2VisualResultGeneratedRecipeTruth ok");
