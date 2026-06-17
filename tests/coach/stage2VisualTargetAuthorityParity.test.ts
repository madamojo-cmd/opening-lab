import assert from "node:assert/strict";

import { buildApprovedFeatureTrace, loadApprovedTracePacket } from "./stage2FeatureTraceTestHelpers";

export function testStage2VisualTargetAuthorityParity(): void {
  const packet = loadApprovedTracePacket((entry) => entry.openingId === "italian-black" && entry.moveUci === "e8g8" && entry.status === "approved");
  const trace = buildApprovedFeatureTrace(packet, {
    trainerFrameId: 824,
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

  assert.equal(trace.targetUci, trace.coachCardResult.moveUci);
  assert.equal(trace.targetUci, trace.visualResult.finalVisualTargetUci);
  assert.equal(trace.visualResult.finalVisualTargetUci, packet.moveUci);
  assert.equal(trace.visualResult.finalVisualTargetSan, packet.moveSan);
  assert.equal(trace.visualResult.sourceRuntimeMoveUci, packet.sourceRuntimeMoveUci);
  assert.equal(trace.visualResult.castlingNormalized, true);
  assert.equal(trace.visualResult.targetMatchesInstruction, true);
  assert.equal(trace.visualResult.targetMatchesCoachCard, true);
}

testStage2VisualTargetAuthorityParity();
console.log("stage2VisualTargetAuthorityParity ok");
