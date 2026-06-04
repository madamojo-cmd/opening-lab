import assert from "node:assert/strict";

import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
import { lockInstructionTarget } from "../../lib/blundr/runtime/instructionFrameLock";
import { buildMoveFactPacket, buildVerifiedUserFacingFallback } from "../../lib/blundr/coachBrain/coachExplanationPipeline";

export function testClaimValidationSpecificFallback(): void {
  const frame = buildCurrentInstructionFrame({
    kind: "guided_move",
    fenBefore: "rnbqkbnr/ppp2ppp/3p4/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4",
    ply: 7,
    sideToMove: "white",
    target: lockInstructionTarget({
      uci: "c4f7",
      san: "Bxf7+",
      pieceType: "bishop",
      color: "white",
      source: "analysis",
      reason: "capture",
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
    openingId: "bishop_attack",
    lineId: "line1",
    activeLineName: "Bishop Attack",
    recentCoachBodies: [],
    recentCoachThemes: [],
    brainAnalysis: null,
  });

  const fallback = buildVerifiedUserFacingFallback(moveFacts);

  assert.equal(fallback.title.startsWith("Bxf7+ —"), true);
  assert.equal(fallback.body.includes("Move the bishop to f7"), true);
  assert.equal(fallback.title.includes("Improve your position"), false);
}

testClaimValidationSpecificFallback();
console.log("claimValidationSpecificFallback ok");
