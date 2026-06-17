import assert from "node:assert/strict";

import { resolveStage2CoachRenderState } from "../../lib/blundr/stage2Coaching";
import { findApprovedPacket, packetPlayKeyAtTarget, packetPlayKeyBefore } from "./stage2ApprovedContentTestHelpers";

function assertApprovedPacketRender(packetSelector: (packet: Record<string, any>) => boolean): void {
  const packet = findApprovedPacket(packetSelector);
  const renderState = resolveStage2CoachRenderState({
    openingId: packet.openingId,
    playKeyBefore: packetPlayKeyBefore(packet),
    playKey: packetPlayKeyAtTarget(packet),
    learnerSide: packet.learnerSide,
    sideToMove: packet.sideToMove,
    targetUci: packet.moveUci,
    targetSan: packet.moveSan,
    targetPieceType: packet.moveUci.endsWith("g1") || packet.moveUci.endsWith("g8") ? "k" : "b",
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

  assert.equal(renderState.stage2CoachingPacketResolution.kind, "approved_packet");
  if (renderState.stage2CoachingPacketResolution.kind !== "approved_packet") return;
  assert.equal(renderState.stage2CoachingPacketResolution.packet.status, "approved");
  assert.equal(renderState.stage2CoachingPacketResolution.packet.approvalReadiness, "app_validated");
  assert.equal(renderState.stage2CoachingPacketResolution.packet.runtimeReconciliation.status, "matched");
  assert.equal(renderState.stage2CoachingPacketResolution.packet.openingId, packet.openingId);
  assert.equal(renderState.stage2CoachingPacketResolution.packet.moveUci, packet.moveUci);
  assert.equal(renderState.stage2CoachingPacketResolution.packet.visualRecipe.targetMoveUci, packet.moveUci);
  assert.equal(renderState.stage2CoachCopyEnrichment.applied, true);
}

export function testStage2AppPageApprovedContentParity(): void {
  assertApprovedPacketRender((packet) => packet.openingId === "italian-white" && packet.moveUci === "f1c4" && packet.status === "approved");
  assertApprovedPacketRender((packet) => packet.openingId === "scotch-white" && packet.moveUci === "e1g1" && packet.status === "approved");
  assertApprovedPacketRender((packet) => packet.openingId === "italian-black" && packet.packetId === "italian-black.line-004.ply-10.e8g8");

  const wrongContext = resolveStage2CoachRenderState({
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
    runtimeBookCandidateCount: 1,
    runtimeBookTopCandidateUci: "d2d4",
    runtimeBookTopCandidateSan: "d4",
    runtimeBookTopCandidateRank: 1,
    runtimeBookTopCandidateTotalGames: 1000,
    runtimeBookBookExhausted: false,
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
  assert.equal(wrongContext.stage2CoachingPacketResolution.kind === "approved_packet", false);
  assert.equal(wrongContext.stage2CoachCopyEnrichment.applied, false);
}

testStage2AppPageApprovedContentParity();
console.log("stage2AppPageApprovedContentParity ok");
