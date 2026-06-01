import assert from "node:assert/strict";
import { Chess } from "chess.js";

import { buildOpeningTree } from "../openingTree";
import { resolveExpectedMoveForFrame } from "../expectedMoveResolver";
import type { RepertoireLineInput } from "../openingTypes";

function tree(lines: string[][], id = "fixture"): ReturnType<typeof buildOpeningTree> {
  return buildOpeningTree(lines.map((movesSan, index): RepertoireLineInput => ({
    openingId: id,
    lineId: `${id}:${index}`,
    openingName: id,
    sideToTrain: "white",
    movesSan,
  })));
}

function fenAfter(moves: string[]): string {
  const game = new Chess();
  for (const san of moves) game.move(san);
  return game.fen();
}

export function testExpectedMoveResolver(): void {
  const exactTree = tree([["e4", "e5", "Nf3"]], "ruy-fixture");
  const exact = resolveExpectedMoveForFrame({
    openingTree: exactTree,
    fen: fenAfter(["e4", "e5"]),
    trainerPhase: "ready_for_user",
    trainingMode: "restricted",
    trainerView: "assisted",
    isUserTurn: true,
    userColor: "w",
    opponentColor: "b",
  });
  assert.equal(exact.source, "lesson_line");
  assert.equal(exact.expectedMoveSan, "Nf3");
  assert.equal(exact.bookResolutionState, "user_move_available");

  const exhausted = resolveExpectedMoveForFrame({
    openingTree: tree([["d4", "d5"]], "qg-terminal"),
    fen: fenAfter(["d4", "d5"]),
    trainerPhase: "ready_for_user",
    trainingMode: "restricted",
    trainerView: "assisted",
    isUserTurn: true,
    userColor: "w",
    opponentColor: "b",
  });
  assert.equal(exhausted.source, "guided_branch_needs_continuation");
  assert.equal(exhausted.bookResolutionState, "guided_branch_needs_continuation");
  assert.equal(exhausted.shouldTransitionToContinuation, true);

  const regressionFen = "rn1qkbnr/pp2ppp1/2p3bp/8/3P3P/6N1/PPP2PP1/R1BQKBNR w KQkq - 0 7";
  const regression = resolveExpectedMoveForFrame({
    openingTree: tree([["e4", "c6", "d4", "d5", "Nc3", "dxe4", "Nxe4", "Bf5", "Ng3", "Bg6", "h4", "h6"]], "italian-family-fixture"),
    fen: regressionFen,
    trainerPhase: "ready_for_user",
    trainingMode: "restricted",
    trainerView: "assisted",
    isUserTurn: true,
    userColor: "w",
    opponentColor: "b",
  });
  assert.notEqual(regression.source, "none");
  assert.equal(regression.source, "guided_branch_needs_continuation");

  const engineGuard = resolveExpectedMoveForFrame({
    openingTree: tree([["d4", "d5", "c4"]], "qg-engine-guard"),
    fen: fenAfter(["d4", "d5"]),
    trainerPhase: "ready_for_user",
    trainingMode: "restricted",
    trainerView: "assisted",
    isUserTurn: true,
    userColor: "w",
    opponentColor: "b",
    enginePreview: { pvs: [{ san: "Nf3", uci: "g1f3" }] },
  });
  assert.equal(engineGuard.source, "lesson_line");
  assert.equal(engineGuard.expectedMoveSan, "c4");
  assert.equal(engineGuard.bookResolutionState, "user_move_available");
}
