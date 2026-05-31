import assert from "node:assert/strict";

import { filesAhead, opposingPawnSquaresAhead, pawnAttackSquares, pawnCanChallengeSquare, pawnDoublePushSquare, pawnPushSquare } from "../pawnGeometry";

export function testPawnGeometry(): void {
  assert.deepEqual(pawnAttackSquares("e4", "white"), ["d5", "f5"]);
  assert.equal(pawnPushSquare("e4", "white"), "e5");
  assert.equal(pawnDoublePushSquare("e2", "white"), "e4");
  assert.equal(filesAhead("e4", "black")[0], "e3");
  assert.equal(opposingPawnSquaresAhead("e4", "white").includes("d5"), true);
  assert.equal(pawnCanChallengeSquare("e2", "e4", "white"), true);
}
