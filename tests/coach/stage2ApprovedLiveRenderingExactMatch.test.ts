import assert from "node:assert/strict";

import { buildTrainerDebugSnapshot } from "../../lib/blundr/debug/trainerDebugSnapshot";
import { buildTrainerFrameResolution } from "../../lib/blundr/debug/buildTrainerFrameResolution";
import { buildStage2FeatureTrace } from "../../lib/blundr/debug/buildStage2FeatureTrace";
import { buildStage2CoachContext, resolveStage2CoachingPacket } from "../../lib/blundr/stage2Coaching";
import { findApprovedPacket, packetPlayKeyAtTarget, packetPlayKeyBefore } from "./stage2ApprovedContentTestHelpers";

export function testStage2ApprovedLiveRenderingExactMatch(): void {
  const packet = findApprovedPacket((entry) => entry.openingId === "italian-white" && entry.moveUci === "f1c4" && entry.status === "approved");
  const context = buildStage2CoachContext({
    openingId: packet.openingId,
    playKeyBefore: packetPlayKeyBefore(packet),
    playKey: packetPlayKeyAtTarget(packet),
    learnerSide: packet.learnerSide,
    sideToMove: packet.sideToMove,
    targetUci: packet.moveUci,
    targetSan: packet.moveSan,
    targetPieceType: "b",
    surface: "assisted",
    runtimeBook: {
      status: "ready",
      candidateCount: 1,
      topCandidateUci: packet.moveUci,
      topCandidateSan: packet.moveSan,
      topCandidateRank: 1,
      topCandidateTotalGames: 1000,
      bookExhausted: false,
    },
    plainRevealState: "revealed",
  });
  const resolution = resolveStage2CoachingPacket(context);
  assert.equal(resolution.kind, "approved_packet");
  if (resolution.kind !== "approved_packet") return;

  assert.equal(resolution.packet.status, "approved");
  assert.equal(resolution.packet.approvalReadiness, "app_validated");
  assert.equal(resolution.packet.runtimeReconciliation.status, "matched");
  assert.equal(resolution.packet.openingId, packet.openingId);
  assert.equal(resolution.packet.moveUci, packet.moveUci);
  assert.equal(resolution.packet.moveSan, packet.moveSan);
  assert.equal(resolution.packet.visualRecipe.targetMoveUci, packet.moveUci);
  assert.equal(Boolean(resolution.packet.sourceCandidatePackage), true);

  const frameResolution = buildTrainerFrameResolution({
    trainerFrameId: 401,
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
      coach: { title: resolution.packet.title, body: resolution.packet.body, buttons: [] },
      visual: { lines: [{ id: "p1" }, { id: "p2" }] },
      actions: [],
    },
    displayedCoachDecision: {
      title: resolution.packet.title,
      body: resolution.packet.body,
      buttons: [],
      debug: { coachDecisionSource: "displayedCoachDecision", coachMoveUci: packet.moveUci, coachPieceType: "b" },
    },
    actualCoachCardTitle: resolution.packet.title,
    actualCoachCardBody: resolution.packet.body,
    actualCoachCardButtons: [],
    actualCoachCardSource: "surfaceCoachCardDecision",
    actualVisualSource: "approved_recipe",
    renderedVisualPrimitiveCount: 2,
    surfaceVisualPrimitiveCount: 2,
    stage2CoachingPacketKind: "approved_packet",
    stage2ApprovedPacketMatched: true,
    stage2ApprovedPacketKind: "approved_packet",
    stage2ApprovedPacketId: resolution.packet.packetId,
    stage2ApprovedPacketSourceBundle: resolution.packet.sourceCandidatePackages?.[0] ?? resolution.packet.sourceCandidatePackage ?? null,
    stage2ApprovedPacketSourceFile: resolution.packet.sourceFile,
    stage2ApprovedPacketStatus: resolution.packet.status,
    stage2ApprovedPacketApprovalReadiness: resolution.packet.approvalReadiness,
    stage2ApprovedPacketMissReason: null,
    stage2ApprovedPacketFallbackReason: null,
    stage2ApprovedPacketVisualSource: "approved_recipe",
    stage2CoachingSafetyStatus: resolution.packet.safetyStatus,
    stage2CoachingSurface: "assisted",
    stage2CoachingSourceFile: resolution.packet.sourceFile,
    stage2CoachingRuntimeMatched: true,
    coachQuality: { qualityScore: 90, qualityScoreSource: "final_rendered", source: "final_rendered", targetAligned: true, pieceAligned: true, usedFallback: false },
    visualRecipe: resolution.packet.visualRecipe,
    visualRecipeMoveUci: resolution.packet.visualRecipe.targetMoveUci,
    visualRecipeMoveSan: resolution.packet.moveSan,
    visualRecipeTargetMatchesInstructionTarget: true,
    presentationFrame: {
      visual: { shouldRender: true, source: "approved_recipe" },
      coach: { owner: "intent_first_coach", title: resolution.packet.title, body: resolution.packet.body },
      legacy: {},
    },
  } as any);

  assert.equal(frameResolution.instructionTargetUci, packet.moveUci);
  assert.equal(frameResolution.acceptedTargetUci, packet.moveUci);
  assert.equal(frameResolution.approvedContent.matched, true);
  assert.equal(frameResolution.approvedContent.packetKind, "approved_packet");
  assert.equal(frameResolution.approvedContent.packetId, resolution.packet.packetId);
  assert.equal(frameResolution.approvedContent.sourceBundle, resolution.packet.sourceCandidatePackages?.[0] ?? resolution.packet.sourceCandidatePackage ?? null);
  assert.equal(frameResolution.approvedContent.visualSource, "approved_recipe");
  assert.equal(frameResolution.visual.authority, "approved_recipe");
  assert.equal(frameResolution.visual.targetMatchesMoveUci, true);
  assert.equal(frameResolution.visual.renderedSource, "approved_recipe");

  const trace = buildStage2FeatureTrace({
    trainerFrameResolution: frameResolution,
    ...({
      trainerFrameId: 401,
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
      visualRecipe: resolution.packet.visualRecipe,
      visualRecipeMoveUci: packet.moveUci,
      visualRecipeMoveSan: packet.moveSan,
      visibleTeachingSurface: {
        owner: "v28_visible_surface",
        mode: "assisted",
        coach: { shouldRender: true, title: resolution.packet.title, body: resolution.packet.body, buttons: [] },
        safety: { blocked: false },
      },
      coachDecision: {
        shouldShowCoachCard: true,
        title: resolution.packet.title,
        body: resolution.packet.body,
        buttons: [],
        debug: { coachDecisionSource: "live_coach", coachMoveUci: packet.moveUci, coachPieceType: "b", coachSafetyWarnings: [] },
      },
    } as any),
  }).featureTrace as any;

  assert.equal(trace.approvedPacket.matched, true);
  assert.equal(trace.approvedPacket.packetKind, "approved_packet");
  assert.equal(trace.approvedPacket.packetId, resolution.packet.packetId);
  assert.equal(trace.approvedPacket.sourceBundle, frameResolution.approvedContent.sourceBundle);
  assert.equal(trace.approvedPacket.visualSource, "approved_recipe");
  assert.equal(trace.finalRenderedTitle, frameResolution.coachCard.finalRendered.title);
  assert.equal(trace.coachCardResult.finalRendered.title, frameResolution.coachCard.finalRendered.title);
  assert.equal(trace.visualRecipeResult.authority, "approved_recipe");
  assert.equal(trace.traceStatus === "complete" || trace.traceStatus === "partial", true);

  const snapshot = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 401,
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
    trainerFrameResolution: frameResolution,
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
    stage2CoachingSourceFile: resolution.packet.sourceFile,
    stage2CoachingRuntimeMatched: true,
    stage2ApprovedPacketMatched: true,
    stage2ApprovedPacketKind: "approved_packet",
    stage2ApprovedPacketId: resolution.packet.packetId,
    stage2ApprovedPacketSourceBundle: frameResolution.approvedContent.sourceBundle,
    stage2ApprovedPacketSourceFile: resolution.packet.sourceFile,
    stage2ApprovedPacketStatus: "approved",
    stage2ApprovedPacketApprovalReadiness: "app_validated",
    stage2ApprovedPacketMissReason: null,
    stage2ApprovedPacketFallbackReason: null,
    stage2ApprovedPacketVisualSource: "approved_recipe",
    coachDecision: { shouldShowCoachCard: true, title: resolution.packet.title, body: resolution.packet.body, buttons: [], debug: { coachDecisionSource: "live_coach", coachMoveUci: packet.moveUci, coachPieceType: "b", coachSafetyWarnings: [] } },
    presentationFrame: { visual: { shouldRender: true, source: "approved_recipe" }, coach: { owner: "intent_first_coach" }, legacy: {} },
    eventLog: [],
  } as any);

  assert.equal((snapshot as any).runtime.selectedOpeningContentStatus, "approved");
  assert.equal((snapshot as any).runtime.selectedOpeningApprovedContentAvailable, true);
  assert.equal((snapshot as any).runtime.approvedPacketMatched, true);
  assert.equal((snapshot as any).runtime.approvedPacketKind, "approved_packet");
  assert.equal((snapshot as any).runtime.approvedPacketId, resolution.packet.packetId);
  assert.equal((snapshot as any).runtime.approvedPacketVisualSource, "approved_recipe");
}

testStage2ApprovedLiveRenderingExactMatch();
console.log("stage2ApprovedLiveRenderingExactMatch ok");
