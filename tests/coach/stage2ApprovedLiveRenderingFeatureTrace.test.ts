import assert from "node:assert/strict";

import { buildStage2FeatureTrace } from "../../lib/blundr/debug/buildStage2FeatureTrace";
import { buildTrainerDebugSnapshot } from "../../lib/blundr/debug/trainerDebugSnapshot";
import { findApprovedPacket, packetPlayKeyAtTarget, packetPlayKeyBefore } from "./stage2ApprovedContentTestHelpers";

export function testStage2ApprovedLiveRenderingFeatureTrace(): void {
  const packet = findApprovedPacket((entry) => entry.openingId === "italian-white" && entry.moveUci === "f1c4" && entry.status === "approved");
  const traceBundle = buildStage2FeatureTrace({
    trainerFrameResolution: {
      frameId: 502,
      trainerPhase: "ready_for_user",
      trainerView: "assisted",
      trainingMode: "restricted",
      isUserTurn: true,
      instructionTargetUci: packet.moveUci,
      instructionTargetSan: packet.moveSan,
      instructionTargetPieceType: "b",
      coachMoveUci: packet.moveUci,
      coachPieceType: "b",
      acceptedTargetUci: packet.moveUci,
      coachCard: {
        preAuthority: { title: packet.coachCard.title, body: packet.coachCard.body, buttons: [], source: "visible_surface_v28", authority: "visible_surface_v28" },
        pipeline: { title: packet.coachCard.title, body: packet.coachCard.body, buttons: [], source: "displayedCoachDecision", authority: "pipeline_coach_decision" },
        finalRendered: { title: packet.coachCard.title, body: packet.coachCard.body, buttons: [], source: "surfaceCoachCardDecision", authority: "visible_surface_v28" },
        renderedCopyAuthority: "visible_surface_v28",
        finalRenderedMatchesPipeline: true,
        finalRenderedMatchesPreAuthority: true,
      },
      visual: {
        authority: "approved_recipe",
        approvedRecipeRendered: true,
        generatedRecipeRendered: false,
        fallbackCurrentSurfaceRendered: false,
        noVisualsRendered: false,
        renderedMoveUci: packet.moveUci,
        targetMoveUci: packet.moveUci,
        targetMatchesMoveUci: true,
        renderedPrimitiveCount: 2,
        surfacePrimitiveCount: 2,
        renderedSource: "approved_recipe",
        surfaceSource: "assisted",
        recipeId: packet.visualRecipe.recipeId,
        patternId: packet.visualRecipe.recipeId,
      },
      coachQuality: { qualityScore: 90, qualityScoreSource: "final_rendered", lowQualityTriggered: false, lowQualityThreshold: 80, lowQualityBasedOn: "final_rendered" },
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
        visualSource: "approved_recipe",
      },
    } as any,
    debugEnabled: true,
    trainerFrameId: 502,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: true,
    fen: "r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1",
    selectedOpeningId: packet.openingId,
    selectedLineId: packet.lineId,
    playKeyBefore: packetPlayKeyBefore(packet),
    playKey: packetPlayKeyAtTarget(packet),
    instructionTargetUci: packet.moveUci,
    instructionTargetSan: packet.moveSan,
    expectedMoveUci: packet.moveUci,
    expectedMoveSan: packet.moveSan,
    coachMoveUci: packet.moveUci,
    coachPieceType: "b",
    visualMoveUci: packet.moveUci,
    visualRecipe: packet.visualRecipe,
    visualRecipeMoveUci: packet.moveUci,
    visualRecipeMoveSan: packet.moveSan,
    visibleTeachingSurface: {
      owner: "v28_visible_surface",
      mode: "assisted",
      coach: { shouldRender: true, title: packet.coachCard.title, body: packet.coachCard.body, buttons: [] },
      safety: { blocked: false },
    },
    coachDecision: {
      shouldShowCoachCard: true,
      title: packet.coachCard.title,
      body: packet.coachCard.body,
      buttons: [],
      debug: { coachDecisionSource: "live_coach", coachMoveUci: packet.moveUci, coachPieceType: "b", coachSafetyWarnings: [] },
    },
    presentationFrame: { visual: { shouldRender: true, source: "approved_recipe" }, coach: { owner: "intent_first_coach" }, legacy: {} },
  });

  const trace = traceBundle.featureTrace as any;
  assert.equal(trace.approvedPacket.matched, true);
  assert.equal(trace.approvedPacket.packetKind, "approved_packet");
  assert.equal(trace.approvedPacket.packetId, packet.packetId);
  assert.equal(trace.approvedPacket.sourceBundle, packet.sourceCandidatePackages?.[0] ?? packet.sourceCandidatePackage ?? null);
  assert.equal(trace.approvedPacket.visualSource, "approved_recipe");
  assert.equal(trace.coachCardResult.finalRendered.title, packet.coachCard.title);
  assert.equal(trace.finalRenderedTitle, packet.coachCard.title);
  assert.equal(trace.visualRecipeResult.authority, "approved_recipe");
  assert.equal(trace.visualRecipeResult.targetMatchesMoveUci, true);
  assert.equal(trace.traceStatus === "complete" || trace.traceStatus === "partial", true);
  assert.equal(trace.missingReasons.includes("approved_content_not_matched"), false);

  const snapshot = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 502,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: true,
    fen: "r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1",
    selectedOpeningId: packet.openingId,
    playKey: packetPlayKeyAtTarget(packet),
    stage2ApprovedContentEnabled: true,
    stage2CoachingResolverEnabled: true,
    stage2SafeFallbackEnabled: true,
    runtimeBookQueried: true,
    runtimeBookOpeningId: packet.openingId,
    runtimeBookPlayKeyBefore: packetPlayKeyBefore(packet),
    runtimeBookStatus: "ready",
    runtimeBookCandidateCount: 1,
    runtimeBookTopCandidateUci: packet.moveUci,
    runtimeBookTopCandidateSan: packet.moveSan,
    runtimeBookTopCandidateRank: 1,
    runtimeBookTopCandidateGames: 1000,
    runtimeBookBookExhausted: false,
    runtimeBookFallbackUsed: false,
    runtimeBookFallbackAuthority: null,
    stage2CoachingPacketKind: "approved_packet",
    stage2CoachingSafetyStatus: "safe",
    stage2CoachingSurface: "assisted",
    stage2CoachingSourceFile: packet.sourceFile,
    stage2CoachingRuntimeMatched: true,
    stage2ApprovedPacketMatched: true,
    stage2ApprovedPacketKind: "approved_packet",
    stage2ApprovedPacketId: packet.packetId,
    stage2ApprovedPacketSourceBundle: packet.sourceCandidatePackages?.[0] ?? packet.sourceCandidatePackage ?? null,
    stage2ApprovedPacketSourceFile: packet.sourceFile,
    stage2ApprovedPacketStatus: "approved",
    stage2ApprovedPacketApprovalReadiness: "app_validated",
    stage2ApprovedPacketMissReason: null,
    stage2ApprovedPacketFallbackReason: null,
    stage2ApprovedPacketVisualSource: "approved_recipe",
    coachDecision: { shouldShowCoachCard: true, title: packet.coachCard.title, body: packet.coachCard.body, buttons: [], debug: { coachDecisionSource: "live_coach", coachMoveUci: packet.moveUci, coachPieceType: "b", coachSafetyWarnings: [] } },
    presentationFrame: { visual: { shouldRender: true, source: "approved_recipe" }, coach: { owner: "intent_first_coach" }, legacy: {} },
    eventLog: [],
  } as any);

  assert.equal((snapshot as any).featureTrace.approvedPacket.matched, true);
  assert.equal((snapshot as any).runtime.approvedPacketMatched, true);
  assert.equal((snapshot as any).runtime.approvedPacketKind, "approved_packet");
  assert.equal((snapshot as any).runtime.approvedPacketVisualSource, "approved_recipe");
}

testStage2ApprovedLiveRenderingFeatureTrace();
console.log("stage2ApprovedLiveRenderingFeatureTrace ok");
