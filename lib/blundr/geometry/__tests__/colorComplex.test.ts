import assert from "node:assert/strict";

import { parseFenBoard } from "../fenBoardParser";
import { squareColor, squaresOfColor, weakColorComplex } from "../colorComplex";

export function testColorComplex(): void {
  assert.equal(squareColor("c4"), "dark");
  assert.equal(squaresOfColor("light").length, 32);
  assert.equal(weakColorComplex(parseFenBoard("8/8/8/8/2B5/8/8/4K3 w - - 0 1"), "white"), "light");
}
