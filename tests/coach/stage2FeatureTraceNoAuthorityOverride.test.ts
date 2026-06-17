import assert from "node:assert/strict";

import { buildTrainerFrameResolution } from "../../lib/blundr/debug/buildTrainerFrameResolution";
import { buildApprovedFeatureTrace, loadApprovedTracePacket } from "./stage2FeatureTraceTestHelpers";

export function testStage2FeatureTraceNoAuthorityOverride(): void {
  const packet = loadApprovedTracePacket((entry) => entry.openingId === "queens-gambit-white" && entry.moveUci === "e2e4" && entry.status === "approved");

  const trainerFrameResolution = buildTrainerFrameResolution({
    trainerFrameId: 712,
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
      coach: {
        shouldRender: true,
        title: "pre-authority title",
        body: "pre-authority body",
        buttons: ["hint", "show_more"],
      },
      safety: { blocked: false },
    },
    displayedCoachDecision: {
      title: "pipeline title",
      body: "pipeline body",
      buttons: ["hint", "show_more"],
      debug: {
        coachDecisionSource: "displayedCoachDecision",
        coachMoveUci: "e2e4",
        coachPieceType: "p",
      },
    },
    actualCoachCardTitle: "final rendered title",
    actualCoachCardBody: "final rendered body",
    actualCoachCardButtons: ["hint", "show_more"],
    actualCoachCardSource: "surfaceCoachCardDecision",
    actualVisualSource: "approved_recipe",
    renderedVisualPrimitiveCount: 2,
    surfaceVisualPrimitiveCount: 2,
    stage2ApprovedPacketMatched: true,
    stage2ApprovedPacketKind: "approved_packet",
    stage2ApprovedPacketId: packet.packetId ?? null,
    stage2ApprovedPacketSourceBundle: packet.sourceCandidatePackages?.[0] ?? packet.sourceCandidatePackage ?? null,
    stage2ApprovedPacketSourceFile: packet.sourceFile ?? null,
    stage2ApprovedPacketStatus: "approved",
    stage2ApprovedPacketApprovalReadiness: "app_validated",
    stage2ApprovedPacketMissReason: null,
    stage2ApprovedPacketFallbackReason: null,
    stage2ApprovedPacketVisualSource: "approved_recipe",
    stage2CoachingSafetyStatus: packet.safetyStatus ?? "safe",
    stage2CoachingSurface: "assisted",
    stage2CoachingSourceFile: packet.sourceFile ?? null,
    stage2CoachingRuntimeMatched: true,
    coachQuality: {
      qualityScore: 92,
      qualityScoreSource: "final_rendered",
      lowQualityTriggered: false,
      lowQualityThreshold: 80,
      lowQualityBasedOn: "final_rendered",
    },
    visualRecipe: packet.visualRecipe,
    visualRecipeMoveUci: "e2e4",
    visualRecipeMoveSan: "e4",
    visualRecipeTargetMatchesInstructionTarget: true,
    presentationFrame: {
      visual: { shouldRender: true, source: "approved_recipe" },
      coach: { owner: "intent_first_coach" },
      legacy: {},
    },
    moveUci: "e2e4",
    moveSan: "e4",
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    playKeyBefore: "",
    playKey: "e2e4",
    currentInstructionFrame: {
      kind: "guided_move",
      targetSource: "opening_tree",
    },
    currentInstructionFrameKind: "guided_move",
    instructionTargetSource: "opening_tree",
    showMoreShown: true,
    runtimeBookStatus: "ready",
    runtimeBookCandidateCount: 1,
    runtimeBookTopCandidateUci: "e2e4",
    runtimeBookTopCandidateSan: "e4",
    runtimeBookTopCandidateRank: 1,
    runtimeBookTopCandidateGames: 999,
    runtimeBookBookExhausted: false,
    stage2CoachingResolverEnabled: true,
    stage2ApprovedContentEnabled: true,
    stage2SafeFallbackEnabled: true,
    approvedContent: {
      matched: true,
      packetKind: "approved_packet",
      packetId: packet.packetId ?? null,
      sourceBundle: packet.sourceCandidatePackages?.[0] ?? packet.sourceCandidatePackage ?? null,
      sourceFile: packet.sourceFile ?? null,
      packetStatus: "approved",
      approvalReadiness: "app_validated",
      missReason: null,
      fallbackReason: null,
      visualSource: "approved_recipe",
    },
  } as any);

  const trace = buildApprovedFeatureTrace(packet, {
    trainerFrameId: 712,
    selectedOpeningId: packet.openingId,
    selectedLineId: packet.lineId,
    visibleSurfaceMode: "assisted",
    showMoreShown: true,
    trainerFrameResolution,
  }).featureTrace as any;

  assert.equal(trace.coachCardResult.preAuthority.title, "pre-authority title");
  assert.equal(trace.coachCardResult.pipeline.title, "pipeline title");
  assert.equal(trace.coachCardResult.finalRendered.title, "final rendered title");
  assert.equal(trace.coachCardResult.finalRendered.body, "final rendered body");
  assert.equal(trace.finalRenderedTitle, "final rendered title");
  assert.equal(trace.finalRenderedBody, "final rendered body");
  assert.equal(trace.coachCardResult.preAuthority.source, "visible_surface_v28");
  assert.equal(trace.coachCardResult.pipeline.source, "displayedCoachDecision");
  assert.equal(trace.coachCardResult.finalRendered.source, "surfaceCoachCardDecision");
  assert.equal(trace.coachCardSource, "approved");
  assert.equal(trace.targetUci, "e2e4");
  assert.equal(trace.visualTargetUci, "e2e4");
  assert.equal(trace.visualSource, "generated_recipe");
  assert.equal(trace.visualFallbackUsed, false);
  assert.equal(trace.reviewCandidateEventPreview?.targetUci, "e2e4");
  assert.equal(trace.reviewCandidateEventPreview?.coachCardSource, "approved");
  assert.equal(trace.plainViewLeakSafe, true);
}

testStage2FeatureTraceNoAuthorityOverride();
console.log("stage2FeatureTraceNoAuthorityOverride ok");
