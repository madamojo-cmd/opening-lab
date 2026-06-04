import assert from "node:assert/strict";

import { buildLiveVisibleTeachingSurface } from "../../lib/blundr/presentation/buildLiveVisibleTeachingSurface";
import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
import { lockInstructionTarget } from "../../lib/blundr/runtime/instructionFrameLock";

export function testPlainViewAllowedButtons(): void {
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

  const preShowMore = buildLiveVisibleTeachingSurface({
    frame,
    requestedMode: "plain",
    showMoreRevealed: false,
    openingKey: "italian_game",
    openingName: "Italian Game",
  });

  const postShowMore = buildLiveVisibleTeachingSurface({
    frame,
    requestedMode: "plain",
    showMoreRevealed: true,
    openingKey: "italian_game",
    openingName: "Italian Game",
  });

  const preKinds = preShowMore.actions.map((action) => action.kind).sort();
  assert.deepEqual(preKinds, ["hint", "show_more"]);
  assert.equal(postShowMore.actions.some((action) => action.kind === "hide_more"), true);
  assert.equal(postShowMore.actions.some((action) => action.kind === "show_more"), false);
  assert.equal(postShowMore.actions.some((action) => action.kind === "reveal_target"), false);
}

testPlainViewAllowedButtons();
console.log("plainViewAllowedButtons ok");
