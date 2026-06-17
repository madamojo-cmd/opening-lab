import assert from "node:assert/strict";

import { buildTrainerFrameResolution } from "../../lib/blundr/debug/buildTrainerFrameResolution";

export function testStage2VisualNoAuthorityOverride(): void {
  const frameResolution = buildTrainerFrameResolution({
    trainerFrameId: 834,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: true,
    instructionTargetUci: "e2e4",
    instructionTargetSan: "e4",
    instructionTargetPieceType: "p",
    coachMoveUci: "e2e4",
    coachPieceType: "p",
    acceptedTargetUci: "e2e4",
    visibleTeachingSurface: {
      owner: "v28_visible_surface",
      mode: "assisted",
      coach: { shouldRender: true, title: "final coach title", body: "final coach body", buttons: [] },
      safety: { blocked: false },
      visual: { lines: [{ id: "p1" }, { id: "p2" }] },
      actions: [],
    },
    displayedCoachDecision: {
      title: "pipeline coach title",
      body: "pipeline coach body",
      buttons: [],
      debug: { coachDecisionSource: "displayedCoachDecision", coachMoveUci: "e2e4", coachPieceType: "p" },
    },
    actualCoachCardTitle: "final coach title",
    actualCoachCardBody: "final coach body",
    actualCoachCardButtons: [],
    actualCoachCardSource: "surfaceCoachCardDecision",
    actualVisualSource: "generated_recipe",
    renderedVisualPrimitiveCount: 2,
    surfaceVisualPrimitiveCount: 2,
    stage2CoachingPacketKind: "none",
    stage2ApprovedPacketMatched: false,
    stage2ApprovedPacketKind: "none",
    stage2ApprovedPacketId: null,
    stage2ApprovedPacketSourceBundle: null,
    stage2ApprovedPacketSourceFile: null,
    stage2ApprovedPacketSourceRuntimeMoveUci: null,
    stage2ApprovedPacketStatus: null,
    stage2ApprovedPacketApprovalReadiness: null,
    stage2ApprovedPacketMissReason: "approved_packet_exact_match_not_found",
    stage2ApprovedPacketFallbackReason: null,
    stage2ApprovedPacketVisualSource: "generated_recipe",
    stage2CoachingSafetyStatus: null,
    stage2CoachingSurface: "assisted",
    stage2CoachingSourceFile: null,
    stage2CoachingRuntimeMatched: false,
    coachQuality: { qualityScore: 88, qualityScoreSource: "final_rendered", lowQualityTriggered: false, lowQualityThreshold: 80, lowQualityBasedOn: "final_rendered" },
    visualRecipe: {
      visualRecipeId: "generated-test",
      targetMoveUci: "e2e4",
      moveUci: "e2e4",
      moveSan: "e4",
    },
    visualRecipeMoveUci: "e2e4",
    visualRecipeMoveSan: "e4",
    visualRecipeTargetMatchesInstructionTarget: true,
    presentationFrame: {
      visual: { shouldRender: true, source: "generated_recipe" },
      coach: { owner: "intent_first_coach" },
      legacy: {},
    },
  } as any);

  assert.equal(frameResolution.visualResult.visualSource, "generated_recipe");
  assert.equal(frameResolution.visualResult.finalVisualTargetUci, "e2e4");
  assert.equal(frameResolution.visualResult.targetMatchesInstruction, true);
  assert.equal(frameResolution.acceptedTargetUci, "e2e4");
  assert.equal(frameResolution.coachCard.finalRendered.source, "surfaceCoachCardDecision");
  assert.equal(frameResolution.coachCard.finalRendered.title, "final coach title");
}

testStage2VisualNoAuthorityOverride();
console.log("stage2VisualNoAuthorityOverride ok");
