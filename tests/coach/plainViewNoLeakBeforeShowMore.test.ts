import assert from "node:assert/strict";

import { buildLiveVisibleTeachingSurface } from "../../lib/blundr/presentation/buildLiveVisibleTeachingSurface";
import { adaptVisibleSurfaceToCoachUi, adaptVisibleSurfaceToBoardVisuals } from "../../lib/blundr/presentation/uiSurfaceAdapter";
import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
import { lockInstructionTarget } from "../../lib/blundr/runtime/instructionFrameLock";

function containsLeak(text: string): boolean {
  const lower = text.toLowerCase();
  return ["bc4", "f1c4", "f1", "c4", "bishop", "show answer", "move from"].some((token) => lower.includes(token));
}

export function testPlainViewNoLeakBeforeShowMore(): void {
  const frame = buildCurrentInstructionFrame({
    kind: "guided_move",
    fenBefore: "r1bqk1nr/pppp1ppp/2n5/2b1p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 4 3",
    ply: 6,
    sideToMove: "white",
    target: lockInstructionTarget({
      uci: "f1c4",
      san: "Bc4",
      pieceType: "bishop",
      color: "white",
      source: "opening_tree",
      reason: "test",
    }),
    mode: "guided",
    source: "opening_tree",
  });

  const surface = buildLiveVisibleTeachingSurface({
    frame,
    requestedMode: "plain",
    showMoreRevealed: false,
    openingKey: "italian_game",
    openingName: "Italian Game",
  });

  const coach = adaptVisibleSurfaceToCoachUi(surface);
  const board = adaptVisibleSurfaceToBoardVisuals(surface);

  assert.equal(coach.actions.some((action) => action.kind === "hint"), true);
  assert.equal(coach.actions.some((action) => action.kind === "show_more"), true);
  assert.equal(coach.actions.some((action) => ["reveal_target", "show_move", "continue_from_here", "restart_line"].includes(action.kind)), false);
  assert.equal(containsLeak(`${coach.title} ${coach.body} ${coach.bullets.join(" ")}`), false);
  assert.equal(board.visualRecipes.length, 0);
}

testPlainViewNoLeakBeforeShowMore();
console.log("plainViewNoLeakBeforeShowMore ok");
