import assert from "node:assert/strict";

import { buildApprovedFeatureTrace, loadApprovedTracePacket } from "./stage2FeatureTraceTestHelpers";

export function testStage2VisualCastlingNormalization(): void {
  const packet = loadApprovedTracePacket((entry) => entry.openingId === "kings-indian-black" && entry.moveUci === "e8g8" && entry.status === "approved");
  assert.equal(packet.sourceRuntimeMoveUci, "e8h8");

  const trace = buildApprovedFeatureTrace(packet, {
    trainerFrameId: 832,
    trainerView: "assisted",
    visibleSurfaceMode: "assisted",
    selectedOpeningId: packet.openingId,
    selectedLineId: packet.lineId,
    visualRecipe: {
      ...(packet.visualRecipe ?? {}),
      visualRecipeId: packet.visualRecipe?.visualRecipeId ?? packet.packetId ?? "castle-test",
      targetMoveUci: packet.moveUci,
    },
    visualRecipeMoveUci: packet.moveUci,
    visualRecipeMoveSan: packet.moveSan,
  }).featureTrace as any;

  assert.equal(trace.visualResult.sourceRuntimeMoveUci, "e8h8");
  assert.equal(trace.visualResult.finalVisualTargetUci, "e8g8");
  assert.equal(trace.visualResult.castlingNormalized, true);
  assert.equal(trace.visualResult.targetMatchesInstruction, true);
  assert.equal(trace.visualResult.targetMatchesCoachCard, true);
  assert.equal(trace.visualRecipeResult.moveUci, "e8g8");
}

testStage2VisualCastlingNormalization();
console.log("stage2VisualCastlingNormalization ok");
