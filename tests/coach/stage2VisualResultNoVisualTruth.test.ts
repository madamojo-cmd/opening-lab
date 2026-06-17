import assert from "node:assert/strict";

import { buildApprovedFeatureTrace, loadApprovedTracePacket } from "./stage2FeatureTraceTestHelpers";

export function testStage2VisualResultNoVisualTruth(): void {
  const packet = loadApprovedTracePacket((entry) => entry.openingId === "london-white" && entry.moveUci === "d2d4" && entry.status === "approved");
  const trace = buildApprovedFeatureTrace(packet, {
    trainerFrameId: 823,
    trainerView: "assisted",
    visibleSurfaceMode: "assisted",
    actualVisualSource: "none",
    stage2CoachingPacketKind: "none",
    stage2ApprovedPacketMatched: false,
    stage2ApprovedPacketKind: "none",
    stage2ApprovedPacketVisualSource: "none",
    stage2ApprovedPacketStatus: null,
    stage2ApprovedPacketApprovalReadiness: null,
    renderedVisualPrimitiveCount: 0,
    surfaceVisualPrimitiveCount: 0,
    visualRecipe: null,
    presentationFrame: { visual: { shouldRender: false, source: "none" }, coach: { owner: "none" }, legacy: {} },
  }).featureTrace as any;

  assert.equal(trace.visualResult.visualSource, "none");
  assert.equal(trace.visualResult.rendered, false);
  assert.equal(trace.visualResult.approvedRecipeMatched, false);
  assert.equal(trace.visualResult.generatedRecipeRendered, false);
  assert.equal(trace.visualResult.fallbackSurfaceVisualsRendered, false);
  assert.ok(trace.visualResult.missingReasons.includes("no_visuals_rendered"));
  assert.equal(trace.visualSource, "none");
  assert.equal(trace.visualRecipeResult.authority, "none");
  assert.equal(trace.visualRecipeResult.rendered, false);
  assert.equal(trace.visualRecipeResult.noVisualsRendered, true);
}

testStage2VisualResultNoVisualTruth();
console.log("stage2VisualResultNoVisualTruth ok");
