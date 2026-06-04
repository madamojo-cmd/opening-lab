import assert from "node:assert/strict";

import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
import { lockInstructionTarget } from "../../lib/blundr/runtime/instructionFrameLock";
import { buildMoveFactPacket, buildVerifiedUserFacingFallback } from "../../lib/blundr/coachBrain/coachExplanationPipeline";

export function testUnverifiedCenterTensionClaim(): void {
  const frame = buildCurrentInstructionFrame({
    kind: "guided_move",
    fenBefore: "rnbqkbnr/pppp1ppp/8/4p3/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3",
    ply: 5,
    sideToMove: "white",
    target: lockInstructionTarget({
      uci: "d4d5",
      san: "d5",
      pieceType: "pawn",
      color: "white",
      source: "analysis",
      reason: "center",
    }),
    mode: "guided",
    source: "analysis",
  });

  const moveFacts = buildMoveFactPacket({
    target: frame.target,
    fenBefore: frame.fenBefore,
    trainerMode: "assisted",
    trainerPhase: "ready_for_user",
    isContinuation: false,
    openingId: "center_push",
    lineId: "line1",
    activeLineName: "Center Push",
    recentCoachBodies: [],
    recentCoachThemes: [],
    brainAnalysis: null,
  });

  const fallback = buildVerifiedUserFacingFallback(moveFacts);

  assert.equal(fallback.title.startsWith("d5 —"), true);
  assert.equal(fallback.body.includes("Move the pawn to d5"), true);
  assert.equal(fallback.body.includes("tension"), false);
}

testUnverifiedCenterTensionClaim();
console.log("unverifiedCenterTensionClaim ok");
