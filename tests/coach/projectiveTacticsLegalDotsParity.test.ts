import assert from "node:assert/strict";

import { Chess } from "chess.js";

import { buildTrainingBoardVisibilitySquares } from "../../lib/blundr/presentation/legalMoveDotVisibility";
import { detectProjectiveTactics, filterProjectiveTacticsForViewMode } from "../../lib/blundr/projectiveTactics";

function legalDestinations(game: Chess, square: string): string[] {
  return (game.moves({ square: square as any, verbose: true }) as Array<{ to: string }>)
    .map((move) => move.to)
    .sort();
}

function pieceColor(game: Chess, square: string): string | null {
  return (game.get(square as any) as { color: string } | null)?.color ?? null;
}

const projectiveVisuals = detectProjectiveTactics({
  fen: "3rk2q/5N2/8/8/8/8/8/K7 b - - 0 1",
  lastMoveUci: "h6f7",
  learnerColor: "w",
  movedColor: "w",
}).visuals;

const whiteGame = new Chess();
const assistedDots = buildTrainingBoardVisibilitySquares({
  instructionTargetFrom: null,
  instructionTargetTo: null,
  selectedSquare: "g1",
  selectedLegalMoveSquares: legalDestinations(whiteGame, "g1"),
});
assert.equal(filterProjectiveTacticsForViewMode({ enabled: true, viewMode: "assisted", visuals: projectiveVisuals }).length, 1);
assert.equal(assistedDots.has("f3"), true);
assert.equal(assistedDots.has("h3"), true);

const plainDots = buildTrainingBoardVisibilitySquares({
  instructionTargetFrom: null,
  instructionTargetTo: null,
  selectedSquare: "b1",
  selectedLegalMoveSquares: legalDestinations(whiteGame, "b1"),
});
assert.deepEqual(filterProjectiveTacticsForViewMode({ enabled: true, viewMode: "plain", visuals: projectiveVisuals }), []);
assert.equal(plainDots.has("a3"), true);
assert.equal(plainDots.has("c3"), true);

assert.equal(pieceColor(whiteGame, "g8"), "b");
assert.equal(pieceColor(whiteGame, "g8") === "w", false);

console.log("projectiveTacticsLegalDotsParity ok");
