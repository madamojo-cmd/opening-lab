import assert from "node:assert/strict";

import { extractAdvancedFeatures } from "../../features/advancedFeatureExtractor";

export function testKingSafetyGolden(): void {
  const packet = extractAdvancedFeatures("r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1");
  assert.equal(packet.kingSafety.uncastledKings.includes("white"), true);
}
