import assert from "node:assert/strict";
import { Chess } from "chess.js";

import { ALL_SQUARES, isBoardSquare } from "../lineGeometry";
import { computeInfluenceMap } from "../influenceMap";

export function testInfluenceMap(): void {
  const start = new Chess().fen();
  const startMap = computeInfluenceMap(start);

  assert.equal(Object.keys(startMap.squares).length, 64);
  assert.ok(startMap.squares.e4);
  assert.equal(Object.keys(startMap.squares).every(isBoardSquare), true);
  assert.equal(startMap.whiteKingSquare, "e1");
  assert.equal(startMap.blackKingSquare, "e8");

  const tacticalMap = computeInfluenceMap(
    "4k3/8/8/8/3n4/8/2B5/4K2R w - - 0 1",
  );
  assert.equal(tacticalMap.squares.h7.whiteAttackers.some((a) => a.square === "c2"), true);
  assert.equal(tacticalMap.squares.h8.whiteAttackers.some((a) => a.square === "h1"), true);
  assert.equal(tacticalMap.squares.f5.blackAttackers.some((a) => a.square === "d4"), true);
  assert.equal(ALL_SQUARES.every((square) => tacticalMap.squares[square]), true);
}
