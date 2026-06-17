import assert from "node:assert/strict";

import { buildApprovedFeatureTrace, loadApprovedTracePacket } from "./stage2FeatureTraceTestHelpers";

export function testStage2VisualResultApprovedRecipeTruth(): void {
  const packet = loadApprovedTracePacket((entry) => entry.openingId === "london-white" && entry.moveUci === "d2d4" && entry.status === "approved");
  const trace = buildApprovedFeatureTrace(packet, {
    trainerFrameId: 820,
    trainerView: "assisted",
    visibleSurfaceMode: "assisted",
    actualVisualSource: "approved_recipe",
    stage2CoachingPacketKind: "approved_packet",
    stage2ApprovedPacketMatched: true,
    stage2ApprovedPacketKind: "approved_packet",
    stage2ApprovedPacketVisualSource: "approved_recipe",
    stage2ApprovedPacketStatus: "approved",
    stage2ApprovedPacketApprovalReadiness: "app_validated",
    renderedVisualPrimitiveCount: 2,
    surfaceVisualPrimitiveCount: 2,
    visualRecipe: {
      ...(packet.visualRecipe ?? {}),
      visualRecipeId: packet.visualRecipe?.visualRecipeId ?? packet.visualRecipe?.recipeId ?? packet.packetId ?? "approved_recipe",
      targetMoveUci: packet.moveUci,
    },
    presentationFrame: { visual: { shouldRender: true, source: "approved_recipe" }, coach: { owner: "intent_first_coach" }, legacy: {} },
  }).featureTrace as any;

  assert.equal(trace.visualResult.visualSource, "approved_recipe");
  assert.equal(trace.visualResult.rendered, true);
  assert.equal(trace.visualResult.approvedRecipeMatched, true);
  assert.equal(trace.visualResult.generatedRecipeRendered, false);
  assert.equal(trace.visualResult.fallbackSurfaceVisualsRendered, false);
  assert.equal(trace.visualResult.plainViewSuppressed, false);
  assert.equal(trace.visualSource, "approved_recipe");
  assert.equal(trace.visualRecipeResult.authority, "approved_recipe");
  assert.equal(trace.visualRecipeResult.rendered, true);
}

testStage2VisualResultApprovedRecipeTruth();
console.log("stage2VisualResultApprovedRecipeTruth ok");
