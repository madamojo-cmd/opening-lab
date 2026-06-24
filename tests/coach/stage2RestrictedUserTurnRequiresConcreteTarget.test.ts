import assert from "node:assert/strict";

import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";

export function testStage2RestrictedUserTurnRequiresConcreteTarget(): void {
  const frame = buildCurrentInstructionFrame({
    frameId: 1001,
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    trainingMode: "restricted",
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    isUserTurn: true,
  } as any);

  assert.equal(frame.kind, "blocked");
  assert.equal(frame.mode, "blocked");
  assert.equal(frame.target, null);
  assert.equal(frame.nullReason != null, true);
}

testStage2RestrictedUserTurnRequiresConcreteTarget();
console.log("stage2RestrictedUserTurnRequiresConcreteTarget ok");
