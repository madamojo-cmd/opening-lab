import assert from "node:assert/strict";

import { buildApprovedFeatureTrace, loadApprovedTracePacket } from "./stage2FeatureTraceTestHelpers";

function buildVisualResolution(packet: Record<string, any>, authority: "approved_recipe" | "generated_recipe" | "fallback_current_surface" | "none") {
  const rendered = authority !== "none";
  return {
    frameId: 640,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: true,
    instructionTargetUci: packet.moveUci,
    instructionTargetSan: packet.moveSan,
    instructionTargetPieceType: "p",
    coachMoveUci: packet.moveUci,
    coachPieceType: "p",
    acceptedTargetUci: packet.moveUci,
    coachCard: {
      preAuthority: { title: packet.coachCard.title, body: packet.coachCard.body, buttons: [], source: "visible_surface_v28", authority: "visible_surface_v28" },
      pipeline: { title: packet.coachCard.title, body: packet.coachCard.body, buttons: [], source: "displayedCoachDecision", authority: "pipeline_coach_decision" },
      finalRendered: { title: packet.coachCard.title, body: packet.coachCard.body, buttons: [], source: authority === "approved_recipe" ? "surfaceCoachCardDecision" : "visible_surface_v28", authority: "visible_surface_v28" },
      renderedCopyAuthority: "visible_surface_v28",
      finalRenderedMatchesPipeline: true,
      finalRenderedMatchesPreAuthority: true,
    },
    visual: {
      authority,
      approvedRecipeRendered: authority === "approved_recipe",
      generatedRecipeRendered: authority === "generated_recipe",
      fallbackCurrentSurfaceRendered: authority === "fallback_current_surface",
      noVisualsRendered: authority === "none",
      renderedMoveUci: rendered ? packet.moveUci : null,
      targetMoveUci: packet.moveUci,
      targetMatchesMoveUci: rendered ? true : "unknown",
      renderedPrimitiveCount: rendered ? 2 : 0,
      surfacePrimitiveCount: rendered ? 2 : 0,
      renderedSource: authority,
      surfaceSource: "assisted",
      recipeId: authority === "none" ? null : packet.visualRecipe.recipeId,
      patternId: authority === "none" ? null : packet.visualRecipe.patternId ?? packet.visualRecipe.recipeId,
    },
    coachQuality: { qualityScore: 88, qualityScoreSource: "final_rendered", lowQualityTriggered: false, lowQualityThreshold: 80, lowQualityBasedOn: "final_rendered" },
    promotion: {
      pendingPromotion: null,
      promotionPickerRendered: false,
      promotionOptions: [],
      selectedPromotionPiece: null,
      attemptedPromotionUci: null,
      acceptedPromotionUci: null,
      acceptedTargetUci: packet.moveUci,
      promotionAuthorityMatched: null,
      promotionAuthorityMismatchReason: null,
      promotionAuthorityTargetUci: packet.moveUci,
    },
    approvedContent: {
      matched: true,
      packetKind: "approved_packet",
      packetId: packet.packetId,
      sourceBundle: packet.sourceCandidatePackages?.[0] ?? packet.sourceCandidatePackage ?? null,
      sourceFile: packet.sourceFile,
      packetStatus: "approved",
      approvalReadiness: "app_validated",
      missReason: null,
      fallbackReason: null,
      visualSource: authority,
    },
    stage2CoachingPacketKind: "approved_packet",
    stage2ApprovedPacketMatched: true,
    stage2ApprovedPacketKind: "approved_packet",
    stage2ApprovedPacketId: packet.packetId,
    stage2ApprovedPacketSourceBundle: packet.sourceCandidatePackages?.[0] ?? packet.sourceCandidatePackage ?? null,
    stage2ApprovedPacketSourceFile: packet.sourceFile,
    stage2ApprovedPacketStatus: "approved",
    stage2ApprovedPacketApprovalReadiness: "app_validated",
    stage2ApprovedPacketMissReason: null,
    stage2ApprovedPacketFallbackReason: null,
    stage2ApprovedPacketVisualSource: authority,
    stage2CoachingSafetyStatus: "safe",
    stage2CoachingSurface: "assisted",
    stage2CoachingSourceFile: packet.sourceFile,
    stage2CoachingRuntimeMatched: true,
    currentInstructionFrameKind: "guided_move",
    instructionTargetSource: "opening_tree",
    showMoreShown: false,
    runtimeBookStatus: "ready",
    runtimeBookCandidateCount: 1,
    runtimeBookBookExhausted: false,
    visualRecipe: authority === "none" ? null : packet.visualRecipe,
    visualRecipeMoveUci: packet.moveUci,
    visualRecipeMoveSan: packet.moveSan,
    visualRecipeTargetMatchesInstructionTarget: authority === "none" ? "unknown" : true,
    visualRecipeBlockedByTargetMismatch: false,
    visualRecipeOverlay: null,
    renderedVisualPrimitiveCount: rendered ? 2 : 0,
    surfaceVisualPrimitiveCount: rendered ? 2 : 0,
  } as any;
}

export function testStage2FeatureTraceVisualSourceTruth(): void {
  const packet = loadApprovedTracePacket((entry) => entry.openingId === "london-white" && entry.moveUci === "d2d4" && entry.status === "approved");

  const approved = buildApprovedFeatureTrace(packet, {
    trainerFrameId: 640,
    trainerFrameResolution: buildVisualResolution(packet, "approved_recipe"),
    selectedOpeningId: packet.openingId,
    selectedLineId: packet.lineId,
    visibleSurfaceMode: "assisted",
  }).featureTrace as any;
  assert.equal(approved.visualSource, "approved_recipe");
  assert.equal(approved.visualFallbackUsed, false);
  assert.equal(approved.targetMatchesVisual, true);
  assert.equal(approved.visualTargetUci, packet.moveUci);

  const generated = buildApprovedFeatureTrace(packet, {
    trainerFrameId: 641,
    trainerFrameResolution: buildVisualResolution(packet, "generated_recipe"),
    selectedOpeningId: packet.openingId,
    selectedLineId: packet.lineId,
    visibleSurfaceMode: "assisted",
  }).featureTrace as any;
  assert.equal(generated.visualSource, "generated_recipe");
  assert.equal(generated.visualFallbackUsed, false);
  assert.equal(generated.targetMatchesVisual, true);

  const fallback = buildApprovedFeatureTrace(packet, {
    trainerFrameId: 642,
    trainerFrameResolution: buildVisualResolution(packet, "fallback_current_surface"),
    selectedOpeningId: packet.openingId,
    selectedLineId: packet.lineId,
    visibleSurfaceMode: "assisted",
  }).featureTrace as any;
  assert.equal(fallback.visualSource, "fallback_current_surface");
  assert.equal(fallback.visualFallbackUsed, true);
  assert.equal(fallback.visualRecipeResult.noVisualsRendered, false);

  const none = buildApprovedFeatureTrace(packet, {
    trainerFrameId: 643,
    trainerFrameResolution: buildVisualResolution(packet, "none"),
    selectedOpeningId: packet.openingId,
    selectedLineId: packet.lineId,
    visibleSurfaceMode: "assisted",
  }).featureTrace as any;
  assert.equal(none.visualSource, "none");
  assert.equal(none.visualFallbackUsed, false);
  assert.equal(none.visualRecipeResult.noVisualsRendered, true);
}

testStage2FeatureTraceVisualSourceTruth();
console.log("stage2FeatureTraceVisualSourceTruth ok");
