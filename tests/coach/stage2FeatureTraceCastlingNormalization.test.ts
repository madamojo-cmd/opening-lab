import assert from "node:assert/strict";

import { buildApprovedFeatureTrace, loadApprovedTracePacket } from "./stage2FeatureTraceTestHelpers";

export function testStage2FeatureTraceCastlingNormalization(): void {
  const whitePacket = loadApprovedTracePacket((entry) => entry.openingId === "ruy-lopez-white" && entry.moveUci === "e1g1" && entry.status === "approved");
  assert.equal(whitePacket.sourceRuntimeMoveUci, "e1h1");
  const whiteTrace = buildApprovedFeatureTrace(whitePacket, {
    trainerFrameId: 660,
    selectedOpeningId: whitePacket.openingId,
    selectedLineId: whitePacket.lineId,
    visibleSurfaceMode: "assisted",
    visualRecipe: whitePacket.visualRecipe,
    visualRecipeMoveUci: whitePacket.moveUci,
    visualRecipeMoveSan: whitePacket.moveSan,
  }).featureTrace as any;
  assert.equal(whiteTrace.targetUci, "e1g1");
  assert.equal(whiteTrace.visualTargetUci, "e1g1");
  assert.equal(whiteTrace.coachCardResult.moveUci, "e1g1");
  assert.equal(whiteTrace.visualRecipeResult.moveUci, "e1g1");
  assert.equal(typeof whiteTrace.selectedConceptId === "string" || whiteTrace.selectedConceptId === null, true);

  const blackPacket = loadApprovedTracePacket((entry) => entry.openingId === "kings-indian-black" && entry.moveUci === "e8g8" && entry.status === "approved");
  assert.equal(blackPacket.sourceRuntimeMoveUci, "e8h8");
  const blackTrace = buildApprovedFeatureTrace(blackPacket, {
    trainerFrameId: 661,
    selectedOpeningId: blackPacket.openingId,
    selectedLineId: blackPacket.lineId,
    visibleSurfaceMode: "assisted",
    visualRecipe: blackPacket.visualRecipe,
    visualRecipeMoveUci: blackPacket.moveUci,
    visualRecipeMoveSan: blackPacket.moveSan,
  }).featureTrace as any;
  assert.equal(blackTrace.targetUci, "e8g8");
  assert.equal(blackTrace.visualTargetUci, "e8g8");
  assert.equal(blackTrace.visualSource, "approved_recipe");
  assert.equal(blackTrace.coachCardResult.targetMatchesMoveUci, true);
}

testStage2FeatureTraceCastlingNormalization();
console.log("stage2FeatureTraceCastlingNormalization ok");
