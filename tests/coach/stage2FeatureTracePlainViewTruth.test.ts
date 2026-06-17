import assert from "node:assert/strict";

import { buildApprovedFeatureTrace, loadApprovedTracePacket } from "./stage2FeatureTraceTestHelpers";

function buildPlainResolution(packet: Record<string, any>, title: string, body: string, mode: "plain_before_show_more" | "plain_after_show_more", authority: "approved_recipe" | "fallback_current_surface") {
  return {
    frameId: 650,
    trainerPhase: "ready_for_user",
    trainerView: "plain",
    trainingMode: "restricted",
    isUserTurn: true,
    instructionTargetUci: packet.moveUci,
    instructionTargetSan: packet.moveSan,
    instructionTargetPieceType: "b",
    coachMoveUci: packet.moveUci,
    coachPieceType: "b",
    acceptedTargetUci: packet.moveUci,
    coachCard: {
      preAuthority: { title, body, buttons: ["hint", "show_more"], source: "visible_surface_v28", authority: "visible_surface_v28" },
      pipeline: { title, body, buttons: ["hint", "show_more"], source: "displayedCoachDecision", authority: "pipeline_coach_decision" },
      finalRendered: { title, body, buttons: ["hint", "show_more"], source: "visible_surface_v28", authority: "visible_surface_v28" },
      renderedCopyAuthority: "visible_surface_v28",
      finalRenderedMatchesPipeline: true,
      finalRenderedMatchesPreAuthority: true,
    },
    visual: {
      authority,
      approvedRecipeRendered: authority === "approved_recipe",
      generatedRecipeRendered: false,
      fallbackCurrentSurfaceRendered: authority === "fallback_current_surface",
      noVisualsRendered: false,
      renderedMoveUci: packet.moveUci,
      targetMoveUci: packet.moveUci,
      targetMatchesMoveUci: true,
      renderedPrimitiveCount: 2,
      surfacePrimitiveCount: 2,
      renderedSource: authority,
      surfaceSource: mode,
      recipeId: authority === "approved_recipe" ? packet.visualRecipe.recipeId : null,
      patternId: authority === "approved_recipe" ? packet.visualRecipe.patternId ?? packet.visualRecipe.recipeId : null,
    },
    coachQuality: { qualityScore: 78, qualityScoreSource: "final_rendered", lowQualityTriggered: false, lowQualityThreshold: 80, lowQualityBasedOn: "final_rendered" },
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
    stage2CoachingSurface: "plain_hint",
    stage2CoachingSourceFile: packet.sourceFile,
    stage2CoachingRuntimeMatched: true,
    currentInstructionFrameKind: "guided_move",
    instructionTargetSource: "opening_tree",
    showMoreShown: mode === "plain_after_show_more",
    runtimeBookStatus: "ready",
    runtimeBookCandidateCount: 1,
    runtimeBookBookExhausted: false,
    visualRecipe: packet.visualRecipe,
    visualRecipeMoveUci: packet.moveUci,
    visualRecipeMoveSan: packet.moveSan,
    visualRecipeTargetMatchesInstructionTarget: true,
    visualRecipeBlockedByTargetMismatch: false,
    visualRecipeOverlay: null,
    renderedVisualPrimitiveCount: 2,
    surfaceVisualPrimitiveCount: 2,
  } as any;
}

export function testStage2FeatureTracePlainViewTruth(): void {
  const packet = loadApprovedTracePacket((entry) => entry.openingId === "italian-white" && entry.moveUci === "f1c4" && entry.status === "approved");
  const hintTitle = packet.surfaces?.plain_hint?.title ?? "Think about the bishop";
  const hintBody = packet.surfaces?.plain_hint?.body ?? "Look for a quiet developing move.";
  const moreTitle = packet.surfaces?.plain_show_more?.title ?? "Expand the idea";
  const moreBody = packet.surfaces?.plain_show_more?.body ?? "Open the detail panel.";

  const before = buildApprovedFeatureTrace(packet, {
    trainerFrameId: 650,
    trainerFrameResolution: buildPlainResolution(packet, hintTitle, hintBody, "plain_before_show_more", "fallback_current_surface"),
    selectedOpeningId: packet.openingId,
    selectedLineId: packet.lineId,
    visibleSurfaceMode: "plain_before_show_more",
    showMoreShown: false,
  }).featureTrace as any;
  const beforeText = `${before.coachCardResult.visibleTitle ?? ""} ${before.coachCardResult.visibleBody ?? ""}`.toLowerCase();
  assert.equal(before.plainViewLeakSafe, true);
  assert.equal(beforeText.includes(String(packet.moveSan).toLowerCase()), false);
  assert.equal(beforeText.includes(String(packet.moveUci).toLowerCase()), false);
  assert.equal(before.reviewCandidateEventPreview?.viewMode, "plain");
  assert.equal(before.reviewCandidateEventPreview?.usedHint, false);
  assert.equal(before.reviewCandidateEventPreview?.usedShowMore, false);
  assert.equal(before.reviewCandidateEventPreview?.coachCardSource, "approved");

  const after = buildApprovedFeatureTrace(packet, {
    trainerFrameId: 651,
    trainerFrameResolution: buildPlainResolution(packet, moreTitle, moreBody, "plain_after_show_more", "fallback_current_surface"),
    selectedOpeningId: packet.openingId,
    selectedLineId: packet.lineId,
    visibleSurfaceMode: "plain_after_show_more",
    showMoreShown: true,
  }).featureTrace as any;
  const afterText = `${after.coachCardResult.visibleTitle ?? ""} ${after.coachCardResult.visibleBody ?? ""}`.toLowerCase();
  assert.equal(after.plainViewLeakSafe, true);
  assert.equal(after.reviewCandidateEventPreview?.viewMode, "assisted");
  assert.equal(after.reviewCandidateEventPreview?.usedShowMore, true);
  assert.equal(after.reviewCandidateEventPreview?.result, "revealed");
}

testStage2FeatureTracePlainViewTruth();
console.log("stage2FeatureTracePlainViewTruth ok");
