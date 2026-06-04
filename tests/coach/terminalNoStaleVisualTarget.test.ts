import assert from "node:assert/strict";

import { buildLiveVisibleTeachingSurface } from "../../lib/blundr/presentation/buildLiveVisibleTeachingSurface";
import { adaptVisibleSurfaceToCoachUi, adaptVisibleSurfaceToBoardVisuals } from "../../lib/blundr/presentation/uiSurfaceAdapter";
import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
import { lockInstructionTarget } from "../../lib/blundr/runtime/instructionFrameLock";

export function testTerminalNoStaleVisualTarget(): void {
  const frame = buildCurrentInstructionFrame({
    kind: "terminal",
    fenBefore: "r1bqk1nr/pppp1ppp/2n5/2b1p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 4 3",
    ply: 6,
    sideToMove: "white",
    target: null,
    mode: "terminal",
    source: "terminal",
  });

  const terminal = buildLiveVisibleTeachingSurface({
    frame,
    requestedMode: "assisted",
    showMoreRevealed: false,
    openingKey: "italian_game",
    openingName: "Italian Game",
  });

  const coach = adaptVisibleSurfaceToCoachUi(terminal);
  const board = adaptVisibleSurfaceToBoardVisuals(terminal);

  assert.equal(coach.targetUci, null);
  assert.equal(board.visualRecipes.length, 0);
}

testTerminalNoStaleVisualTarget();
console.log("terminalNoStaleVisualTarget ok");
