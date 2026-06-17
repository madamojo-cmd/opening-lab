import assert from "node:assert/strict";

import { resolveStage2CoachRenderState } from "../../lib/blundr/stage2Coaching";
import { findApprovedPacket, packetPlayKeyAtTarget, packetPlayKeyBefore } from "./stage2ApprovedContentTestHelpers";

export function testStage2AppPagePlainViewParity(): void {
  const packet = findApprovedPacket((entry) => entry.openingId === "italian-white" && entry.moveUci === "f1c4" && entry.status === "approved");

  const plainHintState = resolveStage2CoachRenderState({
    openingId: packet.openingId,
    playKeyBefore: packetPlayKeyBefore(packet),
    playKey: packetPlayKeyAtTarget(packet),
    learnerSide: packet.learnerSide,
    sideToMove: packet.sideToMove,
    targetUci: packet.moveUci,
    targetSan: packet.moveSan,
    targetPieceType: "b",
    visibleSurfaceMode: "plain_before_show_more",
    runtimeBookStatus: "ready",
    runtimeBookCandidateCount: 1,
    runtimeBookTopCandidateUci: packet.moveUci,
    runtimeBookTopCandidateSan: packet.moveSan,
    runtimeBookTopCandidateRank: 1,
    runtimeBookTopCandidateTotalGames: 1000,
    runtimeBookBookExhausted: false,
    plainRevealState: "hidden",
    trainerPhase: "ready_for_user",
    isUserTurn: true,
    surfaceSafetyBlocked: false,
    surfaceCopy: { title: "surface title", body: "surface body", bullets: [] },
    pipelineCopy: { title: packet.surfaces.plain_hint.title, body: packet.surfaces.plain_hint.body, bullets: [] },
    pipelineTargetAligned: true,
    pipelinePieceAligned: true,
    pipelineContainsDebugLeak: false,
    pipelinePassedSafety: true,
  });

  assert.equal(plainHintState.stage2CoachCopyEnrichment.applied, true);
  assert.equal(plainHintState.stage2CoachCopyEnrichment.copy.body.includes(packet.moveUci), false);
  assert.equal(plainHintState.stage2CoachCopyEnrichment.copy.body.toLowerCase().includes(packet.moveSan.toLowerCase()), false);

  const showMoreState = resolveStage2CoachRenderState({
    openingId: packet.openingId,
    playKeyBefore: packetPlayKeyBefore(packet),
    playKey: packetPlayKeyAtTarget(packet),
    learnerSide: packet.learnerSide,
    sideToMove: packet.sideToMove,
    targetUci: packet.moveUci,
    targetSan: packet.moveSan,
    targetPieceType: "b",
    visibleSurfaceMode: "plain_after_show_more",
    runtimeBookStatus: "ready",
    runtimeBookCandidateCount: 1,
    runtimeBookTopCandidateUci: packet.moveUci,
    runtimeBookTopCandidateSan: packet.moveSan,
    runtimeBookTopCandidateRank: 1,
    runtimeBookTopCandidateTotalGames: 1000,
    runtimeBookBookExhausted: false,
    plainRevealState: "show_more",
    trainerPhase: "ready_for_user",
    isUserTurn: true,
    surfaceSafetyBlocked: false,
    surfaceCopy: { title: "surface title", body: "surface body", bullets: [] },
    pipelineCopy: { title: packet.surfaces.plain_show_more.title, body: packet.surfaces.plain_show_more.body, bullets: [] },
    pipelineTargetAligned: true,
    pipelinePieceAligned: true,
    pipelineContainsDebugLeak: false,
    pipelinePassedSafety: true,
  });

  assert.equal(showMoreState.stage2CoachCopyEnrichment.applied, true);
  assert.equal(showMoreState.stage2CoachCopyEnrichment.copy.body.includes(packet.moveSan), true);
}

testStage2AppPagePlainViewParity();
console.log("stage2AppPagePlainViewParity ok");
