import assert from "node:assert/strict";

import { buildTrainerFrameResolution } from "../../lib/blundr/debug/buildTrainerFrameResolution";
import { buildStage2CoachContext, resolveStage2CoachingPacket } from "../../lib/blundr/stage2Coaching";
import { findApprovedPacket, packetPlayKeyAtTarget, packetPlayKeyBefore } from "./stage2ApprovedContentTestHelpers";

export function testStage2ApprovedLiveRenderingNoAuthorityOverride(): void {
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

  const frameResolution = buildTrainerFrameResolution({
    trainerFrameId: 603,
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
  assert.equal(frameResolution.coachMoveUci, packet.moveUci);
  assert.equal(frameResolution.acceptedTargetUci, packet.moveUci);
  assert.equal(frameResolution.visual.targetMoveUci, packet.moveUci);
  assert.equal(frameResolution.visual.targetMatchesMoveUci, true);
  assert.equal(frameResolution.approvedContent.matched, true);
  assert.equal(frameResolution.approvedContent.packetId, resolution.packet.packetId);
  assert.equal(frameResolution.approvedContent.packetKind, "approved_packet");
  assert.equal(frameResolution.approvedContent.visualSource, "approved_recipe");
}

testStage2ApprovedLiveRenderingNoAuthorityOverride();
console.log("stage2ApprovedLiveRenderingNoAuthorityOverride ok");
