import assert from "node:assert/strict";

import { STAGE2_RUNTIME_OPENING_IDS } from "../../lib/blundr/openings/openingAvailability";
import { resolveStage2RestrictedMoveAuthority } from "../../lib/blundr/runtime/resolveStage2RestrictedMoveAuthority";
import { resolveStage2CoachingContentForMove } from "../../lib/blundr/stage2Coaching";
import { findApprovedPacket, packetPlayKeyAtTarget, packetPlayKeyBefore } from "./stage2ApprovedContentTestHelpers";

export function testStage2RestrictedMoveAuthoritySeparation(): void {
  for (const openingId of STAGE2_RUNTIME_OPENING_IDS) {
    const authority = resolveStage2RestrictedMoveAuthority({
      trainingMode: "restricted",
      isUserTurn: false,
      userExplicitlyEnteredContinuation: false,
      currentPly: 9,
      minimumGuidedDepthPly: 8,
      runtimeBookMatchesFrame: true,
      runtimeBookStatus: "ready",
      runtimeBookBookExhausted: true,
      runtimeBookCandidateCount: 0,
      explicitCuratedTerminalNode: false,
      selectedLineCompleteConfirmed: false,
      expectedMoveSource: "lesson_line",
      expectedMoveReason: "exact_fen_repertoire_node",
      expectedMoveUci: "e7e5",
      expectedMoveSan: "e5",
      sideToMove: "black",
    });

    assert.equal(authority.targetAuthority.kind !== "terminal", true, `runtime_exhaustion_must_not_end_book:${openingId}`);
    assert.equal(authority.branchCompleteAllowed, false, `runtime_exhaustion_must_not_allow_branch_complete:${openingId}`);
    assert.equal(authority.continueFromHereAllowed, false, `runtime_exhaustion_must_not_allow_continue_from_here:${openingId}`);
    assert.equal(authority.targetAuthority.moveUci, "e7e5", `runtime_move_must_remain_authoritative:${openingId}`);
    assert.equal(authority.targetAuthority.sideToMove, "black", `side_to_move_must_remain_authoritative:${openingId}`);
  }

  const terminalAuthority = resolveStage2RestrictedMoveAuthority({
    trainingMode: "restricted",
    isUserTurn: false,
    userExplicitlyEnteredContinuation: false,
    currentPly: 15,
    minimumGuidedDepthPly: 8,
    runtimeBookMatchesFrame: true,
    runtimeBookStatus: "ready",
    runtimeBookBookExhausted: true,
    runtimeBookCandidateCount: 0,
    explicitCuratedTerminalNode: false,
    selectedLineCompleteConfirmed: true,
    expectedMoveSource: "lesson_line",
    expectedMoveReason: "selected_line_complete",
    expectedMoveUci: "f2f3",
    expectedMoveSan: "f3",
    sideToMove: "black",
  });
  assert.equal(terminalAuthority.targetAuthority.kind, "terminal");
  assert.equal(terminalAuthority.branchCompleteAllowed, true);
  assert.equal(terminalAuthority.continueFromHereAllowed, true);
  assert.equal(terminalAuthority.targetAuthority.terminalReason, "selected_line_complete");

  const approvedPacket = findApprovedPacket((entry) => entry.openingId === "italian-white" && entry.moveUci === "f1c4" && entry.status === "approved");
  const approvedAuthority = resolveStage2CoachingContentForMove({
    openingId: approvedPacket.openingId,
    playKeyBefore: packetPlayKeyBefore(approvedPacket),
    playKey: packetPlayKeyAtTarget(approvedPacket),
    learnerSide: approvedPacket.learnerSide,
    sideToMove: approvedPacket.sideToMove,
    targetUci: approvedPacket.moveUci,
    targetSan: approvedPacket.moveSan,
    targetPieceType: "b",
    surface: "assisted",
    runtimeBook: {
      status: "ready",
      candidateCount: 1,
      topCandidateUci: approvedPacket.moveUci,
      topCandidateSan: approvedPacket.moveSan,
      topCandidateRank: 1,
      topCandidateTotalGames: 100,
      bookExhausted: false,
    },
    plainRevealState: "revealed",
    trainerPhase: "ready_for_user",
    isUserTurn: true,
    visibleSurfaceMode: "assisted",
    surfaceSafetyBlocked: false,
    surfaceCopy: {
      title: approvedPacket.coachCard.title,
      body: approvedPacket.coachCard.body,
      bullets: [],
    },
    pipelineCopy: {
      title: approvedPacket.coachCard.title,
      body: approvedPacket.coachCard.body,
      bullets: [],
    },
    pipelineTargetAligned: true,
    pipelinePieceAligned: true,
    pipelineContainsDebugLeak: false,
    pipelinePassedSafety: true,
  });
  assert.equal(approvedAuthority.coachingAuthority.kind, "approved_packet");
  assert.equal(approvedAuthority.coachingAuthority.packet?.moveUci, approvedPacket.moveUci);
  assert.equal(approvedAuthority.coachingAuthority.packet?.moveSan, approvedPacket.moveSan);
  assert.equal(Boolean(approvedAuthority.coachingAuthority.packet), true);

  const fallbackAuthority = resolveStage2CoachingContentForMove(
    {
      openingId: "unknown-opening",
      playKeyBefore: "e2e4,e7e5",
      learnerSide: "white",
      sideToMove: "white",
      targetUci: "a1a2",
      targetSan: "Ra2",
      targetPieceType: "r",
      surface: "assisted",
      runtimeBook: {
        status: "ready",
        candidateCount: 0,
        topCandidateUci: null,
        topCandidateSan: null,
        topCandidateRank: null,
        topCandidateTotalGames: null,
        bookExhausted: true,
      },
      plainRevealState: "revealed",
      trainerPhase: "ready_for_user",
      isUserTurn: true,
      visibleSurfaceMode: "assisted",
      surfaceSafetyBlocked: false,
      surfaceCopy: {
        title: "Fallback title",
        body: "Fallback body",
        bullets: [],
      },
      pipelineCopy: {
        title: "Fallback title",
        body: "Fallback body",
        bullets: [],
      },
      pipelineTargetAligned: true,
      pipelinePieceAligned: true,
      pipelineContainsDebugLeak: false,
      pipelinePassedSafety: true,
    },
  );
  assert.equal(fallbackAuthority.coachingAuthority.kind, "safe_fallback");
  assert.equal(Boolean(fallbackAuthority.coachingAuthority.fallbackReason), true);
}

testStage2RestrictedMoveAuthoritySeparation();
console.log("stage2RestrictedMoveAuthoritySeparation ok");
