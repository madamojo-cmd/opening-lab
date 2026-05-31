import assert from "node:assert/strict";

import { extractAdvancedFeatures } from "../../features/advancedFeatureExtractor";

export function testPawnStructureGolden(): void {
  const packet = extractAdvancedFeatures("8/8/8/8/8/2P5/2P5/4K3 w - - 0 1");
  assert.equal(packet.pawnStructure.doubledPawnFiles.includes("c"), true);
  assert.equal(packet.featureClaims.some((claim) => claim.type === "doubled_pawns"), true);
}
