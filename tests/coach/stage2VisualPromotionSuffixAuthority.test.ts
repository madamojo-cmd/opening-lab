import assert from "node:assert/strict";

import { buildTrainerFrameResolution } from "../../lib/blundr/debug/buildTrainerFrameResolution";

export function testStage2VisualPromotionSuffixAuthority(): void {
  const frameResolution = buildTrainerFrameResolution({
    trainerFrameId: 833,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: true,
    instructionTargetUci: "e7e8q",
    instructionTargetSan: "e8=Q",
    instructionTargetPieceType: "p",
    coachMoveUci: "e7e8q",
    coachPieceType: "p",
    acceptedTargetUci: "e7e8q",
    visibleTeachingSurface: {
      owner: "v28_visible_surface",
      mode: "assisted",
      coach: { shouldRender: true, title: "Promotion title", body: "Promotion body", buttons: [] },
      safety: { blocked: false },
      visual: { lines: [{ id: "p1" }, { id: "p2" }] },
      actions: [],
    },
    displayedCoachDecision: {
      title: "Promotion title",
      body: "Promotion body",
      buttons: [],
      debug: { coachDecisionSource: "displayedCoachDecision", coachMoveUci: "e7e8q", coachPieceType: "p" },
    },
    actualCoachCardTitle: "Promotion title",
    actualCoachCardBody: "Promotion body",
    actualCoachCardButtons: [],
    actualCoachCardSource: "surfaceCoachCardDecision",
    actualVisualSource: "approved_recipe",
    renderedVisualPrimitiveCount: 2,
    surfaceVisualPrimitiveCount: 2,
    stage2CoachingPacketKind: "approved_packet",
    stage2ApprovedPacketMatched: true,
    stage2ApprovedPacketKind: "approved_packet",
    stage2ApprovedPacketId: "promo-test",
    stage2ApprovedPacketSourceBundle: "promo-bundle",
    stage2ApprovedPacketSourceFile: "promo-file",
    stage2ApprovedPacketSourceRuntimeMoveUci: "e7e8q",
    stage2ApprovedPacketStatus: "approved",
    stage2ApprovedPacketApprovalReadiness: "app_validated",
    stage2ApprovedPacketMissReason: null,
    stage2ApprovedPacketFallbackReason: null,
    stage2ApprovedPacketVisualSource: "approved_recipe",
    stage2CoachingSafetyStatus: "safe",
    stage2CoachingSurface: "assisted",
    stage2CoachingSourceFile: "promo-file",
    stage2CoachingRuntimeMatched: true,
    coachQuality: { qualityScore: 90, qualityScoreSource: "final_rendered", lowQualityTriggered: false, lowQualityThreshold: 80, lowQualityBasedOn: "final_rendered" },
    visualRecipe: {
      visualRecipeId: "promo-test",
      targetMoveUci: "e7e8q",
      moveUci: "e7e8q",
      moveSan: "e8=Q",
    },
    visualRecipeMoveUci: "e7e8q",
    visualRecipeMoveSan: "e8=Q",
    visualRecipeTargetMatchesInstructionTarget: true,
    presentationFrame: {
      visual: { shouldRender: true, source: "approved_recipe" },
      coach: { owner: "intent_first_coach" },
      legacy: {},
    },
  } as any);

  assert.equal(frameResolution.visualResult.sourceRuntimeMoveUci, "e7e8q");
  assert.equal(frameResolution.visualResult.finalVisualTargetUci, "e7e8q");
  assert.equal(frameResolution.visualResult.finalVisualTargetSan, "e8=Q");
  assert.equal(frameResolution.visualResult.castlingNormalized, "not_applicable");
  assert.equal(frameResolution.visualResult.approvedRecipeMatched, true);
  assert.equal(frameResolution.acceptedTargetUci, "e7e8q");
}

testStage2VisualPromotionSuffixAuthority();
console.log("stage2VisualPromotionSuffixAuthority ok");
