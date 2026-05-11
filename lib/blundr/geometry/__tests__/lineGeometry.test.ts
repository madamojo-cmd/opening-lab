import assert from "node:assert/strict";

import {
  ALL_SQUARES,
  classifyLine,
  isBoardSquare,
  isDiagonal,
  squaresBetween,
} from "../lineGeometry";

export function testLineGeometry(): void {
  assert.equal(ALL_SQUARES.length, 64);
  assert.equal(isBoardSquare("a1"), true);
  assert.equal(isBoardSquare("h8"), true);
  assert.equal(isBoardSquare("i9"), false);
  assert.deepEqual(squaresBetween("a1", "a4"), ["a2", "a3"]);
  assert.equal(isDiagonal("c1", "h6"), true);
  assert.equal(classifyLine("g1", "f3"), "knight");
}
