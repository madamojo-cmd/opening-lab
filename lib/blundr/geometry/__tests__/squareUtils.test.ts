import assert from "node:assert/strict";

import { centerSquares, fileOf, isValidSquare, kingDistance, mirrorSquare, relativeRank, squareFrom } from "../squareUtils";

export function testSquareUtils(): void {
  assert.equal(isValidSquare("e4"), true);
  assert.equal(isValidSquare("i9"), false);
  assert.equal(fileOf("e4"), "e");
  assert.equal(squareFrom(4, 4), "e4");
  assert.equal(squareFrom(8, 4), null);
  assert.equal(relativeRank("white", "e4"), 4);
  assert.equal(relativeRank("black", "e4"), 5);
  assert.equal(mirrorSquare("e4"), "e5");
  assert.equal(kingDistance("e4", "g5"), 2);
  assert.deepEqual(centerSquares(), ["d4", "e4", "d5", "e5"]);
}
