import assert from "node:assert/strict";
import { Chess } from "chess.js";

import { computeMoveDelta } from "../moveDelta";

export function testMoveDelta(): void {
  assert.throws(() => computeMoveDelta("bad fen", "e2e4"), /Invalid FEN/);
  assert.throws(() => computeMoveDelta(new Chess().fen(), "e2e5"), /Illegal move/);

  const e4 = computeMoveDelta(new Chess().fen(), "e2e4");
  assert.equal(e4.moveArrow.from, "e2");
  assert.equal(e4.moveArrow.to, "e4");
  assert.equal(e4.changedSquares.some((square) => square.square === "e4"), true);

  const italian = new Chess();
  italian.move("e4");
  italian.move("e5");
  italian.move("Nf3");
  italian.move("Nc6");
  const bishop = computeMoveDelta(italian.fen(), "f1c4", { topSquares: 16 });

  assert.equal(bishop.moveArrow.from, "f1");
  assert.equal(bishop.moveArrow.to, "c4");
  assert.equal(bishop.changedSquares.some((square) => square.square === "c4"), true);
  assert.equal(
    bishop.changedSquares.some((square) => square.square === "f7") ||
      bishop.changedLines.some((line) => line.lineSquares.some((square) => square === "f7")),
    true,
  );

  const nf3 = computeMoveDelta(new Chess().fen(), "g1f3");
  assert.equal(nf3.changedSquares.some((square) => square.square === "f3"), true);
}
