import assert from "node:assert/strict";
import { Chess } from "chess.js";

import { buildOpeningTree } from "../openingTree";
import { resolveExpectedMoveForFrame } from "../expectedMoveResolver";

export function testBranchResolver(): void {
  const openingTree = buildOpeningTree([
    { openingId: "qg", lineId: "qg:0", openingName: "Queen's Gambit", sideToTrain: "white", movesSan: ["d4", "d5", "c4", "e6", "Nc3"] },
    { openingId: "qg", lineId: "qg:1", openingName: "Queen's Gambit", sideToTrain: "white", movesSan: ["d4", "d5", "c4", "e6", "Nf3"] },
  ]);
  const game = new Chess();
  for (const san of ["d4", "d5", "c4", "e6"]) game.move(san);
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
  assert.equal(resolved.source, "opening_branch");
  assert.equal(resolved.coverageTier, "known_branch_deep_coached");
  assert.equal(resolved.candidateMoves.length, 2);
}
