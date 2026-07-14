import assert from "node:assert/strict";

import { buildStage2FeatureTrace } from "../../lib/blundr/debug/buildStage2FeatureTrace";
import { buildTrainerFrameResolution } from "../../lib/blundr/debug/buildTrainerFrameResolution";
import { resolveStage2CoachRenderState } from "../../lib/blundr/stage2Coaching";
import { findApprovedPacket, packetPlayKeyAtTarget, packetPlayKeyBefore } from "./stage2ApprovedContentTestHelpers";

export function testStage2AppPageResolverParity(): void {
  const packet = findApprovedPacket((entry) => entry.openingId === "italian-white" && entry.moveUci === "f1c4" && entry.status === "approved");
  const renderState = resolveStage2CoachRenderState({
    openingId: packet.openingId,
    playKeyBefore: packetPlayKeyBefore(packet),
    playKey: packetPlayKeyAtTarget(packet),
    learnerSide: packet.learnerSide,
    sideToMove: packet.sideToMove,
    targetUci: packet.moveUci,
    targetSan: packet.moveSan,
    targetPieceType: "b",
    visibleSurfaceMode: "assisted",
    runtimeBookStatus: "ready",
    runtimeBookCandidateCount: 1,
    runtimeBookTopCandidateUci: packet.moveUci,
    runtimeBookTopCandidateSan: packet.moveSan,
    runtimeBookTopCandidateRank: 1,
    runtimeBookTopCandidateTotalGames: 1000,
    runtimeBookBookExhausted: false,
    plainRevealState: "revealed",
    trainerPhase: "ready_for_user",
    isUserTurn: true,
    surfaceSafetyBlocked: false,
    surfaceCopy: { title: "surface title", body: "surface body", bullets: [] },
    pipelineCopy: { title: packet.surfaces.assisted.title, body: packet.surfaces.assisted.body, bullets: [] },
    pipelineTargetAligned: true,
    pipelinePieceAligned: true,
    pipelineContainsDebugLeak: false,
    pipelinePassedSafety: true,
  });

  assert.equal(renderState.pipelineCopyAuthorityDecision.renderedCopyAuthority, "pipeline_coach_decision");
  // This fixture is an exact approved position; the resolver must use it before fallback.
  assert.equal(renderState.stage2CoachingPacketResolution.kind, "approved_packet");
  assert.equal(renderState.stage2CoachCopyEnrichment.applied, true);

  const frameResolution = buildTrainerFrameResolution({
    trainerFrameId: 601,
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
    visibleTeachingSurface: {
      owner: "v28_visible_surface",
      mode: "assisted",
      coach: { title: packet.surfaces.assisted.title, body: packet.surfaces.assisted.body, buttons: [] },
      visual: { lines: [{ id: "line-1" }] },
      actions: [],
    } as any,
    displayedCoachDecision: {
      title: packet.surfaces.assisted.title,
      body: packet.surfaces.assisted.body,
      buttons: [],
      debug: { coachDecisionSource: "displayedCoachDecision", coachMoveUci: packet.moveUci, coachPieceType: "b" },
    },
    actualCoachCardTitle: packet.surfaces.assisted.title,
    actualCoachCardBody: packet.surfaces.assisted.body,
    actualCoachCardButtons: [],
    actualCoachCardSource: "surfaceCoachCardDecision",
    actualVisualSource: "approved_recipe",
    renderedVisualPrimitiveCount: 1,
    surfaceVisualPrimitiveCount: 1,
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
    stage2ApprovedPacketVisualSource: "approved_recipe",
    stage2CoachingSafetyStatus: "safe",
    stage2CoachingSurface: "assisted",
    stage2CoachingSourceFile: packet.sourceFile,
    stage2CoachingRuntimeMatched: true,
    coachQuality: { qualityScore: 90, qualityScoreSource: "final_rendered", source: "final_rendered", targetAligned: true, pieceAligned: true, usedFallback: false },
    visualRecipe: packet.visualRecipe,
    visualRecipeMoveUci: packet.moveUci,
    visualRecipeMoveSan: packet.moveSan,
    visualRecipeTargetMatchesInstructionTarget: true,
    presentationFrame: { visual: { shouldRender: true, source: "approved_recipe" }, coach: { owner: "intent_first_coach" }, legacy: {} },
  } as any);

  const trace = buildStage2FeatureTrace({
    trainerFrameResolution: frameResolution,
    trainerFrameId: 601,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: true,
    fen: "r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1",
    selectedOpeningId: packet.openingId,
    selectedLineId: packet.lineId,
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
      coach: { shouldRender: true, title: packet.surfaces.assisted.title, body: packet.surfaces.assisted.body, buttons: [] },
      safety: { blocked: false },
    } as any,
    coachDecision: {
      shouldShowCoachCard: true,
      title: packet.surfaces.assisted.title,
      body: packet.surfaces.assisted.body,
      buttons: [],
      debug: { coachDecisionSource: "live_coach", coachMoveUci: packet.moveUci, coachPieceType: "b", coachSafetyWarnings: [] },
    },
  } as any).featureTrace as any;

  assert.equal(frameResolution.coachCard.finalRendered.title, packet.surfaces.assisted.title);
  assert.equal(frameResolution.coachCard.finalRendered.body, packet.surfaces.assisted.body);
  assert.equal(trace.finalRenderedTitle, frameResolution.coachCard.finalRendered.title);
  assert.equal(trace.coachCardResult.finalRendered.title, frameResolution.coachCard.finalRendered.title);

  const fallbackRenderState = resolveStage2CoachRenderState({
    openingId: "italian-white",
    playKeyBefore: "e2e4,e7e5,g1f3,b8c6",
    playKey: "e2e4,e7e5,g1f3,b8c6,d2d4",
    learnerSide: "white",
    sideToMove: "white",
    targetUci: "d2d4",
    targetSan: "d4",
    targetPieceType: "p",
    visibleSurfaceMode: "assisted",
    runtimeBookStatus: "ready",
    runtimeBookCandidateCount: 0,
    runtimeBookBookExhausted: true,
    plainRevealState: "revealed",
    trainerPhase: "ready_for_user",
    isUserTurn: true,
    surfaceSafetyBlocked: false,
    surfaceCopy: { title: "surface title", body: "surface body", bullets: [] },
    pipelineCopy: { title: "fallback title", body: "fallback body", bullets: [] },
    pipelineTargetAligned: true,
    pipelinePieceAligned: true,
    pipelineContainsDebugLeak: false,
    pipelinePassedSafety: true,
  });
  assert.equal(fallbackRenderState.stage2CoachingPacketResolution.kind === "approved_packet", false);
  assert.equal(fallbackRenderState.stage2CoachCopyEnrichment.applied, false);
}

testStage2AppPageResolverParity();
console.log("stage2AppPageResolverParity ok");
