import assert from "node:assert/strict";

import { buildApprovedFeatureTrace, loadApprovedTracePacket } from "./stage2FeatureTraceTestHelpers";

export function testStage2VisualResultFallbackCurrentSurfaceTruth(): void {
  const packet = loadApprovedTracePacket((entry) => entry.openingId === "london-white" && entry.moveUci === "d2d4" && entry.status === "approved");
  const trace = buildApprovedFeatureTrace(packet, {
    trainerFrameId: 822,
    trainerView: "assisted",
    visibleSurfaceMode: "assisted",
    actualVisualSource: "visible_surface_v28",
    stage2CoachingPacketKind: "none",
    stage2ApprovedPacketMatched: false,
    stage2ApprovedPacketKind: "safe_fallback",
    stage2ApprovedPacketVisualSource: "visible_surface_v28",
    stage2ApprovedPacketStatus: "approved_candidate",
    stage2ApprovedPacketApprovalReadiness: "ready_for_app_validation",
    renderedVisualPrimitiveCount: 2,
    surfaceVisualPrimitiveCount: 2,
    visualRecipe: packet.visualRecipe,
    presentationFrame: { visual: { shouldRender: true, source: "visible_surface_v28" }, coach: { owner: "visible_surface_v28" }, legacy: {} },
  }).featureTrace as any;

  assert.equal(trace.visualResult.visualSource, "fallback_current_surface");
  assert.equal(trace.visualResult.rendered, true);
  assert.equal(trace.visualResult.approvedRecipeMatched, false);
  assert.equal(trace.visualResult.generatedRecipeRendered, false);
  assert.equal(trace.visualResult.fallbackSurfaceVisualsRendered, true);
  assert.equal(trace.visualSource, "fallback_current_surface");
  assert.equal(trace.visualRecipeResult.authority, "fallback_current_surface");
  assert.equal(trace.visualRecipeResult.rendered, true);
}

testStage2VisualResultFallbackCurrentSurfaceTruth();
console.log("stage2VisualResultFallbackCurrentSurfaceTruth ok");
