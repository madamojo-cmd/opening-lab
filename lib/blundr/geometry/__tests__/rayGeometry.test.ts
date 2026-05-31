import assert from "node:assert/strict";

import { parseFenBoard } from "../fenBoardParser";
import { directSliderAttack, isSameDiagonal, squaresBetween, xrayAlignment } from "../rayGeometry";

export function testRayGeometry(): void {
  const board = parseFenBoard("8/5p2/8/8/2B5/8/8/4K3 w - - 0 1");
  assert.equal(isSameDiagonal("c4", "f7"), true);
  assert.deepEqual(squaresBetween("c4", "f7"), ["d5", "e6"]);
  assert.equal(directSliderAttack(board, "c4", "f7"), true);

  const blocked = parseFenBoard("8/5p2/4P3/8/2B5/8/8/4K3 w - - 0 1");
  assert.equal(directSliderAttack(blocked, "c4", "f7"), false);
  assert.equal(xrayAlignment(blocked, "c4", "f7").aligned, true);
}
