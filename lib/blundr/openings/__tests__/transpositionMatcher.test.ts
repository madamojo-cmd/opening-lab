import assert from "node:assert/strict";
import { Chess } from "chess.js";

import { buildOpeningTree } from "../openingTree";
import { resolveExpectedMoveForFrame } from "../expectedMoveResolver";

export function testTranspositionMatcher(): void {
  const openingTree = buildOpeningTree([
    { openingId: "ruy", lineId: "ruy:0", openingName: "Ruy Lopez", sideToTrain: "white", movesSan: ["e4", "e5", "Nf3"] },
  ]);
  const game = new Chess();
  game.move("e4");
  game.move("e5");
  const parts = game.fen().split(" ");
  const transposedFen = `${parts[0]} ${parts[1]} - - 0 2`;
  const resolved = resolveExpectedMoveForFrame({
    openingTree,
    fen: transposedFen,
    trainerPhase: "ready_for_user",
    trainingMode: "restricted",
    trainerView: "assisted",
    isUserTurn: true,
    userColor: "w",
    opponentColor: "b",
  });
  assert.equal(resolved.source, "transposition");
  assert.equal(resolved.expectedMoveSan, "Nf3");
}
