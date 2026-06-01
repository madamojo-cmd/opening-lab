import assert from "node:assert/strict";

import { parseFenBoard } from "../fenBoardParser";
import { bishopMobility, mobilityDeltaAfterMove, pseudoLegalMobilityCount } from "../mobilityMap";

export function testMobilityMap(): void {
  const board = parseFenBoard("8/8/8/8/2B5/8/8/4K3 w - - 0 1");
  assert.equal(bishopMobility(board, "c4").includes("f7"), true);
  assert.equal(pseudoLegalMobilityCount(board, "c4") > 6, true);
  const delta = mobilityDeltaAfterMove("4k3/8/8/8/8/8/4P3/4K3 w - - 0 1", "e2e4");
  assert.equal(Boolean(delta), true);
}
