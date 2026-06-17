import assert from "node:assert/strict";

import { Chess } from "chess.js";

import { buildTrainerDebugSnapshot } from "../../lib/blundr/debug/trainerDebugSnapshot";
import { buildLegacyAuditFrameResolution } from "./stage2LegacyNoBypassTestHelpers";

export function testStage2LegacyNoMoveAuthorityBypass(): void {
  const approved = buildLegacyAuditFrameResolution({
    stage2ApprovedPacketKind: "approved_packet",
    stage2ApprovedPacketMatched: true,
    stage2ApprovedPacketMissReason: null,
    stage2ApprovedPacketFallbackReason: null,
    stage2ApprovedPacketVisualSource: "approved_recipe",
    stage2CoachingPacketKind: "approved_packet",
    stage2CoachingSafetyStatus: "safe",
    stage2CoachingRuntimeMatched: true,
    visualRecipeMoveUci: "e2e4",
    visualRecipeMoveSan: "e4",
  } as any);

  assert.equal(approved.instructionTargetUci, "e2e4");
  assert.equal(approved.coachMoveUci, "e2e4");
  assert.equal(approved.acceptedTargetUci, "e2e4");
  assert.equal(approved.visual.targetMoveUci, "e2e4");
  assert.equal(approved.visualResult.finalVisualTargetUci, "e2e4");

  const fallback = buildLegacyAuditFrameResolution({
    stage2ApprovedPacketKind: "none",
    stage2ApprovedPacketMatched: false,
    stage2ApprovedPacketMissReason: "approved_packet_exact_match_not_found",
    stage2ApprovedPacketFallbackReason: "safe_fallback_used",
    stage2CoachingPacketKind: "safe_fallback",
    stage2ApprovedPacketVisualSource: "fallback_current_surface",
    actualVisualSource: "fallback_current_surface",
    visualRecipeMoveUci: "g1f3",
    visualRecipeMoveSan: "Nf3",
  } as any);

  assert.equal(fallback.instructionTargetUci, "e2e4");
  assert.equal(fallback.coachMoveUci, "e2e4");
  assert.equal(fallback.acceptedTargetUci, "e2e4");
  assert.equal(fallback.visual.targetMoveUci, "e2e4");

  const debugSnapshot = buildTrainerDebugSnapshot({
    ...fallback,
    fen: new Chess().fen(),
    debugEnabled: true,
    eventLog: [],
  } as any);

  assert.equal((debugSnapshot as any).trainerFrameResolution.acceptedTargetUci, "e2e4");
  assert.equal((debugSnapshot as any).trainerFrameResolution.visual.targetMoveUci, "e2e4");
}

testStage2LegacyNoMoveAuthorityBypass();
console.log("stage2LegacyNoMoveAuthorityBypass ok");
