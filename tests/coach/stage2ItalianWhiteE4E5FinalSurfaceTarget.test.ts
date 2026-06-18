import assert from "node:assert/strict";

import { buildTrainerFrameResolution } from "../../lib/blundr/debug/buildTrainerFrameResolution";
import { buildTrainerDebugSnapshot } from "../../lib/blundr/debug/trainerDebugSnapshot";

export function testStage2ItalianWhiteE4E5FinalSurfaceTarget(): void {
  const frameResolution = buildTrainerFrameResolution({
    trainerFrameId: 5,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: true,
    instructionTargetUci: "g1f3",
    instructionTargetSan: "Nf3",
    instructionTargetPieceType: "n",
    coachMoveUci: "g1f3",
    coachPieceType: "n",
    acceptedTargetUci: "g1f3",
    visibleTeachingSurface: {
      owner: "v28_visible_surface",
      mode: "guided_move",
      coach: { title: "Nf3 — Develop the knight", body: "Develop the knight.", buttons: [] },
      visual: { lines: [] },
      actions: [],
    } as any,
    displayedCoachDecision: {
      title: "Nf3 — Develop the knight",
      body: "Develop the knight.",
      buttons: [],
      debug: { coachDecisionSource: "displayedCoachDecision", coachMoveUci: "g1f3", coachPieceType: "n" },
    },
    actualCoachCardTitle: "Nf3 — Develop the knight",
    actualCoachCardBody: "Develop the knight.",
    actualCoachCardButtons: [],
    actualCoachCardSource: "surfaceCoachCardDecision",
    actualVisualSource: "visible_surface_v28",
    renderedVisualPrimitiveCount: 0,
    surfaceVisualPrimitiveCount: 0,
    stage2CoachingPacketKind: "none",
    stage2ApprovedPacketMatched: false,
    stage2ApprovedPacketKind: "none",
    stage2CoachingSafetyStatus: "safe",
    stage2CoachingSurface: "guided",
    stage2CoachingRuntimeMatched: false,
    coachQuality: { qualityScore: 90, qualityScoreSource: "final_rendered", source: "final_rendered", targetAligned: true, pieceAligned: true, usedFallback: false },
    presentationFrame: { visual: { shouldRender: true, source: "visible_surface_v28" }, coach: { owner: "intent_first_coach" }, legacy: {} },
  } as any);

  assert.equal(frameResolution.instructionTargetUci, "g1f3");
  assert.equal(frameResolution.acceptedTargetUci, "g1f3");
  assert.equal(frameResolution.coachCard.finalRendered.title, "Nf3 — Develop the knight");
  assert.equal(frameResolution.coachCard.finalRendered.body, "Develop the knight.");

  const snapshot = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 5,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: true,
    fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
    instructionTargetUci: "g1f3",
    instructionTargetSan: "Nf3",
    instructionTargetPieceType: "n",
    coachMoveUci: "g1f3",
    coachPieceType: "n",
    acceptedTargetUci: "g1f3",
    actualCoachCardTitle: frameResolution.coachCard.finalRendered.title,
    actualCoachCardBody: frameResolution.coachCard.finalRendered.body,
    actualCoachCardButtons: [],
    actualCoachCardSource: "surfaceCoachCardDecision",
    actualVisualSource: "visible_surface_v28",
    renderedVisualPrimitiveCount: 0,
    surfaceVisualPrimitiveCount: 0,
    trainerFrameResolution: frameResolution,
    visibleTeachingSurface: {
      owner: "v28_visible_surface",
      mode: "guided_move",
      coach: { shouldRender: true, title: frameResolution.coachCard.finalRendered.title, body: frameResolution.coachCard.finalRendered.body, buttons: [] },
      visual: { lines: [] },
      actions: [],
      safety: { blocked: false, criticalIssues: [] },
      debug: { visibleCoachOwner: "visible_surface_v28", visibleVisualOwner: "visible_surface_v28", visibleActionOwner: "visible_surface_v28" },
    },
    presentationFrame: { visual: { shouldRender: true, source: "visible_surface_v28" }, coach: { shouldRender: true, owner: "intent_first_coach", title: frameResolution.coachCard.finalRendered.title, body: frameResolution.coachCard.finalRendered.body, buttons: [] }, legacy: {} },
    coachDecision: {
      shouldShowCoachCard: true,
      title: frameResolution.coachCard.finalRendered.title,
      body: frameResolution.coachCard.finalRendered.body,
      buttons: [],
      debug: { coachDecisionSource: "live_coach", coachMoveUci: "g1f3", coachPieceType: "n", coachQuality: { qualityScore: 90, targetAligned: true, pieceAligned: true, containsDebugLeak: false } },
    },
    coachQuality: { qualityScore: 90, qualityScoreSource: "final_rendered", source: "final_rendered", targetAligned: true, pieceAligned: true, usedFallback: false, containsDebugLeak: false },
    eventLog: [],
  } as any);

  assert.equal((snapshot.frame as any)?.instructionTargetUci, "g1f3");
  assert.equal((snapshot.promotion as any)?.acceptedTargetUci, "g1f3");
  assert.equal((snapshot.coach as any)?.visibleTitle, "Nf3 — Develop the knight");
  assert.equal((snapshot.trainerFrameResolution as any)?.visual?.targetMoveUci, "g1f3");
}

testStage2ItalianWhiteE4E5FinalSurfaceTarget();
console.log("stage2ItalianWhiteE4E5FinalSurfaceTarget ok");
