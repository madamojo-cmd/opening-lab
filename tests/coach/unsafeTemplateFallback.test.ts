import assert from "node:assert/strict";

import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
import { lockInstructionTarget } from "../../lib/blundr/runtime/instructionFrameLock";
import { buildMoveFactPacket, buildVerifiedUserFacingFallback } from "../../lib/blundr/coachBrain/coachExplanationPipeline";

export function testUnsafeTemplateFallback(): void {
  const frame = buildCurrentInstructionFrame({
    kind: "guided_move",
    fenBefore: "rnbqkb1r/pppp1ppp/4pn2/8/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 2 4",
    ply: 7,
    sideToMove: "white",
    target: lockInstructionTarget({
      uci: "d2d4",
      san: "d4",
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
    openingId: "center_stretch",
    lineId: "line1",
    activeLineName: "Center Stretch",
    recentCoachBodies: [],
    recentCoachThemes: [],
    brainAnalysis: null,
  });

  const fallback = buildVerifiedUserFacingFallback(moveFacts);

  assert.equal(fallback.title.startsWith("d4 —"), true);
  assert.equal(fallback.body.includes("Move the pawn to d4"), true);
  assert.equal(fallback.title.includes("Improve your position"), false);
}

testUnsafeTemplateFallback();
console.log("unsafeTemplateFallback ok");
