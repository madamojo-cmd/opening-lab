import assert from "node:assert/strict";

import { adjacentFilesNearKing, extendedKingZoneSquares, kingZoneSquares, shieldSquaresForKing } from "../kingZone";

export function testKingZone(): void {
  assert.equal(kingZoneSquares("g1").includes("h2"), true);
  assert.equal(extendedKingZoneSquares("g1").includes("e3"), true);
  assert.deepEqual(adjacentFilesNearKing("g1"), ["f", "g", "h"]);
  assert.equal(shieldSquaresForKing("g1", "white", "king").includes("g2"), true);
}
