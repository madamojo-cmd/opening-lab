import assert from "node:assert/strict";

import { bishopDirections, doublePawnPushRank, knightOffsets, pawnAttackOffsets, pawnPushOffset, queenDirections, rookDirections } from "../directionUtils";

export function testDirectionUtils(): void {
  assert.equal(rookDirections.length, 4);
  assert.equal(bishopDirections.length, 4);
  assert.equal(queenDirections.length, 8);
  assert.equal(knightOffsets.length, 8);
  assert.deepEqual(pawnPushOffset("white"), [0, 1]);
  assert.deepEqual(pawnAttackOffsets("black"), [[-1, -1], [1, -1]]);
  assert.equal(doublePawnPushRank("black"), 7);
}
