import assert from "node:assert/strict";

import { buildLiveVisibleTeachingSurface } from "../../lib/blundr/presentation/buildLiveVisibleTeachingSurface";
import { adaptVisibleSurfaceToCoachUi, adaptVisibleSurfaceToBoardVisuals } from "../../lib/blundr/presentation/uiSurfaceAdapter";
import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
import { lockInstructionTarget } from "../../lib/blundr/runtime/instructionFrameLock";

export function testVisualTargetAlignmentContract(): void {
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
    requestedMode: "assisted",
    showMoreRevealed: false,
    openingKey: "italian_game",
    openingName: "Italian Game",
  });

  const coach = adaptVisibleSurfaceToCoachUi(surface);
  const board = adaptVisibleSurfaceToBoardVisuals(surface);
  const aligned = board.visualRecipes
    .filter((recipe) => recipe.targetUci !== null)
    .every((recipe) => recipe.targetUci === coach.targetUci);

  assert.equal(aligned, true);
}

testVisualTargetAlignmentContract();
console.log("visualTargetAlignmentContract ok");
