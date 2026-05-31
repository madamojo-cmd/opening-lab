import assert from "node:assert/strict";

import { parseFenBoard } from "../fenBoardParser";
import { hasBishopPair, materialBalance, pieceCounts } from "../materialUtils";

export function testMaterialUtils(): void {
  const board = parseFenBoard("8/8/8/8/2BB4/8/8/4K3 w - - 0 1");
  assert.equal(hasBishopPair(board, "white"), true);
  assert.equal(materialBalance(board), 6);
  assert.equal(pieceCounts(board).white_bishop, 2);
}
