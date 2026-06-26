import assert from "node:assert/strict";

import { Chess } from "chess.js";

import { buildTrainingBoardVisibilitySquares } from "../../lib/blundr/presentation/legalMoveDotVisibility";
import { detectProjectiveTactics, filterProjectiveTacticsForViewMode } from "../../lib/blundr/projectiveTactics";

const detected = detectProjectiveTactics({
  fen: "3rk2q/5N2/8/8/8/8/8/K7 b - - 0 1",
  lastMoveUci: "h6f7",
  learnerColor: "w",
  movedColor: "w",
});

assert.equal(detected.visuals.length, 1);
assert.deepEqual(filterProjectiveTacticsForViewMode({ enabled: true, viewMode: "plain", visuals: detected.visuals }), []);

const game = new Chess();
const legalMoveSquares = (game.moves({ square: "g1", verbose: true }) as Array<{ to: string }>).map((move) => move.to);
const visibleSquares = buildTrainingBoardVisibilitySquares({
  instructionTargetFrom: null,
  instructionTargetTo: null,
  selectedSquare: "g1",
  selectedLegalMoveSquares: legalMoveSquares,
});

assert.equal(visibleSquares.has("g1"), true);
assert.equal(visibleSquares.has("f3"), true);
assert.equal(visibleSquares.has("h3"), true);

console.log("projectiveTacticsNoPlainViewLeak ok");
