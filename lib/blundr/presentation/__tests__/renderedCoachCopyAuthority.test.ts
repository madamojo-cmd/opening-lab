import assert from "node:assert/strict";

import { selectRenderedCoachCardCopyAuthority } from "../renderedCoachCopyAuthority";

export function testRenderedCoachCopyAuthority(): void {
  const surfaceCopy = {
    title: "Active Piece Development",
    body: "Play e4 with the pawn; it improves central control through Active Piece Development.",
    bullets: [],
  };
  const pipelineE4 = {
    title: "e4 — Challenge the center",
    body: "Move the pawn to e4. This contests central space and opens lines for your pieces.",
    bullets: [],
  };
  const pipelineCastle = {
    title: "O-O — Castle to safety",
    body: "Move the king to g1. This moves your king to safety and brings the rook into the game.",
    bullets: [],
  };
  const pipelineMate = {
    title: "Qh8# — Checkmate",
    body: "Move the queen to h8. This is checkmate, so Black has no legal reply.",
    bullets: [],
  };

  const e4Decision = selectRenderedCoachCardCopyAuthority({
    trainerPhase: "ready_for_user",
    isUserTurn: true,
    visibleSurfaceMode: "assisted",
    instructionTargetUci: "e2e4",
    surfaceSafetyBlocked: false,
    surfaceCopy,
    pipelineCopy: pipelineE4,
    pipelineTargetAligned: true,
    pipelinePieceAligned: true,
    pipelineContainsDebugLeak: false,
    pipelinePassedSafety: true,
  });
  assert.equal(e4Decision.copy.title, pipelineE4.title);
  assert.equal(e4Decision.copy.body, pipelineE4.body);
  assert.equal(e4Decision.renderedCopyAuthority, "pipeline_coach_decision");
  assert.equal(e4Decision.pipelineCopyRejected, false);

  const castleDecision = selectRenderedCoachCardCopyAuthority({
    trainerPhase: "ready_for_user",
    isUserTurn: true,
    visibleSurfaceMode: "assisted",
    instructionTargetUci: "e1g1",
    surfaceSafetyBlocked: false,
    surfaceCopy: {
      title: "Avoid Blocking Center Pawn",
      body: "Keep your center plans flexible.",
      bullets: [],
    },
    pipelineCopy: pipelineCastle,
    pipelineTargetAligned: true,
    pipelinePieceAligned: true,
    pipelineContainsDebugLeak: false,
    pipelinePassedSafety: true,
  });
  assert.equal(castleDecision.copy.title, "O-O — Castle to safety");

  const mateDecision = selectRenderedCoachCardCopyAuthority({
    trainerPhase: "ready_for_user",
    isUserTurn: true,
    visibleSurfaceMode: "assisted",
    instructionTargetUci: "h5h8",
    surfaceSafetyBlocked: false,
    surfaceCopy: {
      title: "Qh8# — Continue the position",
      body: "Continue from here.",
      bullets: [],
    },
    pipelineCopy: pipelineMate,
    pipelineTargetAligned: true,
    pipelinePieceAligned: true,
    pipelineContainsDebugLeak: false,
    pipelinePassedSafety: true,
  });
  assert.equal(mateDecision.copy.title, "Qh8# — Checkmate");

  const plainPreDecision = selectRenderedCoachCardCopyAuthority({
    trainerPhase: "ready_for_user",
    isUserTurn: true,
    visibleSurfaceMode: "plain_before_show_more",
    instructionTargetUci: "e2e4",
    surfaceSafetyBlocked: false,
    surfaceCopy,
    pipelineCopy: pipelineE4,
    pipelineTargetAligned: true,
    pipelinePieceAligned: true,
    pipelineContainsDebugLeak: false,
    pipelinePassedSafety: true,
  });
  assert.equal(plainPreDecision.renderedCopyAuthority, "visible_surface_v28");
  assert.equal(plainPreDecision.pipelineCopyRejected, true);
  assert.equal(plainPreDecision.pipelineCopyRejectedReason, "plain_pre_show_more");

  const unsafeDecision = selectRenderedCoachCardCopyAuthority({
    trainerPhase: "ready_for_user",
    isUserTurn: true,
    visibleSurfaceMode: "assisted",
    instructionTargetUci: "e2e4",
    surfaceSafetyBlocked: false,
    surfaceCopy,
    pipelineCopy: pipelineE4,
    pipelineTargetAligned: true,
    pipelinePieceAligned: true,
    pipelineContainsDebugLeak: true,
    pipelinePassedSafety: true,
  });
  assert.equal(unsafeDecision.renderedCopyAuthority, "visible_surface_v28");
  assert.equal(unsafeDecision.pipelineCopyRejectedReason, "pipeline_contains_debug_leak");
}

testRenderedCoachCopyAuthority();
console.log("renderedCoachCopyAuthority ok");
