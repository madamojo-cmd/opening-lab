import assert from "node:assert/strict";
import { Chess } from "chess.js";

import { resolveDailyBoardClick } from "../dailyBoardInteraction";

function pieceAt(fen: string, square: string) {
  return new Chess(fen).get(square as never);
}

const startFen = new Chess().fen();

const e2 = pieceAt(startFen, "e2");
const g1 = pieceAt(startFen, "g1");

const selected = resolveDailyBoardClick({
  fen: startFen,
  selectedSquare: null,
  square: "e2",
  piece: e2,
  turn: "w",
});
assert.equal(selected.nextSelectedSquare, "e2");
assert.equal(selected.attempt, null);

const sameSquare = resolveDailyBoardClick({
  fen: startFen,
  selectedSquare: "e2",
  square: "e2",
  piece: e2,
  turn: "w",
});
assert.equal(sameSquare.nextSelectedSquare, null);
assert.equal(sameSquare.attempt, null);

const switchedPiece = resolveDailyBoardClick({
  fen: startFen,
  selectedSquare: "e2",
  square: "g1",
  piece: g1,
  turn: "w",
});
assert.equal(switchedPiece.nextSelectedSquare, "g1");
assert.equal(switchedPiece.attempt, null);

const attemptedMove = resolveDailyBoardClick({
  fen: startFen,
  selectedSquare: "e2",
  square: "e4",
  piece: null,
  turn: "w",
});
assert.equal(attemptedMove.nextSelectedSquare, null);
assert.equal(attemptedMove.attempt?.from, "e2");
assert.equal(attemptedMove.attempt?.to, "e4");
assert.equal(attemptedMove.attempt?.legal, true);
assert.equal(attemptedMove.attempt?.uci, "e2e4");

const invalidMove = resolveDailyBoardClick({
  fen: startFen,
  selectedSquare: "e2",
  square: "e5",
  piece: null,
  turn: "w",
});
assert.equal(invalidMove.nextSelectedSquare, null);
assert.equal(invalidMove.attempt?.legal, false);
assert.equal(invalidMove.attempt?.uci, "e2e5");

const squareClickMode = resolveDailyBoardClick({
  fen: startFen,
  selectedSquare: "e2",
  square: "e4",
  piece: null,
  turn: "w",
  squareClickMode: true,
});
assert.equal(squareClickMode.nextSelectedSquare, "e2");
assert.equal(squareClickMode.attempt, null);

console.log("dailyBoardMoveSelection.test.ts passed");
