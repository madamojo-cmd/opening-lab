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
  const resolved = resolveExpectedMoveForFrame({
    openingTree,
    fen: game.fen(),
    trainerPhase: "ready_for_user",
    trainingMode: "restricted",
    trainerView: "assisted",
    isUserTurn: true,
    userColor: "w",
    opponentColor: "b",
  });
  assert.equal(resolved.source, "lesson_line");
  assert.equal(resolved.expectedMoveSan, "Nf3");

  const parts = game.fen().split(" ");
  const castlingRightsDriftFen = `${parts[0]} ${parts[1]} - - 0 2`;
  const castlingRightsDrift = resolveExpectedMoveForFrame({
    openingTree,
    fen: castlingRightsDriftFen,
    trainerPhase: "ready_for_user",
    trainingMode: "restricted",
    trainerView: "assisted",
    isUserTurn: true,
    userColor: "w",
    opponentColor: "b",
  });
  assert.equal(castlingRightsDrift.source, "opening_family_plan");
  assert.equal(Boolean(castlingRightsDrift.expectedMoveSan), true);
}
