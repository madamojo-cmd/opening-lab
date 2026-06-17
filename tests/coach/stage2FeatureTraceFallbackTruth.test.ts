import assert from "node:assert/strict";

import { buildApprovedFeatureTrace, loadApprovedTracePacket } from "./stage2FeatureTraceTestHelpers";

export function testStage2FeatureTraceFallbackTruth(): void {
  const packet = loadApprovedTracePacket((entry) => entry.openingId === "queens-gambit-white" && entry.moveUci === "e2e4" && entry.status === "approved");
  const fallbackTitle = "Fallback center reminder";
  const fallbackBody = "Look for the safest improving move.";
  const traceBundle = buildApprovedFeatureTrace(packet, {
    trainerFrameId: 630,
    trainerView: "assisted",
    selectedOpeningId: "unknown-opening",
    selectedLineId: "unknown-opening",
    playKeyBefore: "e2e4,e7e5",
    playKey: "e2e4,e7e5,e2e4",
    runtimeSafeFallbackUsed: true,
    runtimeSafeFallbackReason: "claim_validation_failed",
    coachDecision: {
      shouldShowCoachCard: true,
      title: fallbackTitle,
      body: fallbackBody,
      buttons: ["show_more"],
      debug: {
        coachDecisionSource: "verified_safe_fallback",
        verifiedFallbackUsed: true,
        fallbackReason: "claim_validation_failed",
        coachMoveUci: packet.moveUci,
        coachPieceType: "p",
        coachSafetyWarnings: [],
        selectedTheme: "center_control",
        selectedOpportunityId: "fallback:center_control",
      },
    },
    trainerFrameResolution: {
      frameId: 630,
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
        preAuthority: { title: fallbackTitle, body: fallbackBody, buttons: ["show_more"], source: "displayedCoachDecision", authority: "pipeline_coach_decision" },
        pipeline: { title: fallbackTitle, body: fallbackBody, buttons: ["show_more"], source: "displayedCoachDecision", authority: "pipeline_coach_decision" },
        finalRendered: { title: fallbackTitle, body: fallbackBody, buttons: ["show_more"], source: "visible_surface_v28", authority: "visible_surface_v28" },
        renderedCopyAuthority: "visible_surface_v28",
        finalRenderedMatchesPipeline: true,
        finalRenderedMatchesPreAuthority: true,
      },
      visual: {
        authority: "fallback_current_surface",
        approvedRecipeRendered: false,
        generatedRecipeRendered: false,
        fallbackCurrentSurfaceRendered: true,
        noVisualsRendered: false,
        renderedMoveUci: packet.moveUci,
        targetMoveUci: packet.moveUci,
        targetMatchesMoveUci: true,
        renderedPrimitiveCount: 2,
        surfacePrimitiveCount: 2,
        renderedSource: "visible_surface_v28",
        surfaceSource: "assisted",
        recipeId: null,
        patternId: null,
      },
      coachQuality: { qualityScore: 60, qualityScoreSource: "verified_safe_fallback", lowQualityTriggered: true, lowQualityThreshold: 65, lowQualityBasedOn: "fallback" },
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
        matched: false,
        packetKind: "safe_fallback",
        packetId: null,
        sourceBundle: null,
        sourceFile: null,
        packetStatus: null,
        approvalReadiness: null,
        missReason: "approved_packet_exact_match_not_found",
        fallbackReason: "claim_validation_failed",
        visualSource: "fallback_current_surface",
      },
      currentInstructionFrameKind: "guided_move",
      instructionTargetSource: "opening_tree",
      showMoreShown: false,
      stage2CoachingResolverEnabled: true,
      stage2ApprovedContentEnabled: true,
      stage2SafeFallbackEnabled: true,
      stage2CoachingPacketKind: "safe_fallback",
      stage2CoachingSafetyStatus: "safe",
      stage2CoachingSurface: "assisted",
      stage2CoachingSourceFile: "stage2://safe_fallback",
      stage2CoachingRuntimeMatched: false,
      stage2ApprovedPacketMatched: false,
      stage2ApprovedPacketKind: "safe_fallback",
      stage2ApprovedPacketId: null,
      stage2ApprovedPacketSourceBundle: null,
      stage2ApprovedPacketSourceFile: null,
      stage2ApprovedPacketStatus: null,
      stage2ApprovedPacketApprovalReadiness: null,
      stage2ApprovedPacketMissReason: "approved_packet_exact_match_not_found",
      stage2ApprovedPacketFallbackReason: "claim_validation_failed",
      stage2ApprovedPacketVisualSource: "fallback_current_surface",
      visualRecipe: null,
      visualRecipeMoveUci: null,
      visualRecipeMoveSan: null,
      visualRecipeTargetMatchesInstructionTarget: true,
      visualRecipeBlockedByTargetMismatch: false,
      visualRecipeOverlay: null,
      renderedVisualPrimitiveCount: 2,
      surfaceVisualPrimitiveCount: 2,
      currentPlayKey: null,
      runtimeBookStatus: "book_exhausted",
      runtimeBookCandidateCount: 0,
      runtimeBookBookExhausted: true,
    } as any,
  });
  const trace = traceBundle.featureTrace as any;

  assert.equal(trace.approvedContentMatched, false);
  assert.equal(trace.approvedPacketKind, "safe_fallback");
  assert.equal(trace.approvedPacketId, null);
  assert.equal(trace.approvedPacketSourceBundle, null);
  assert.equal(trace.coachCardResult.fallbackUsed, true);
  assert.equal(trace.coachCardResult.fallbackReason, "claim_validation_failed");
  assert.equal(trace.coachCardResult.finalRendered.title, fallbackTitle);
  assert.equal(trace.coachCardResult.finalRendered.body, fallbackBody);
  assert.equal(trace.finalRenderedTitle, fallbackTitle);
  assert.equal(trace.finalRenderedBody, fallbackBody);
  assert.equal(trace.traceStatus, "partial");
}

testStage2FeatureTraceFallbackTruth();
console.log("stage2FeatureTraceFallbackTruth ok");
