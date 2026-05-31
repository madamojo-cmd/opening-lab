import assert from "node:assert/strict";

import { extractAdvancedFeatures } from "../../features/advancedFeatureExtractor";

export function testImbalanceGolden(): void {
  const packet = extractAdvancedFeatures("8/8/8/8/2B5/8/8/4K3 w - - 0 1");
  assert.equal(packet.imbalances.materialBalance > 0, true);
}
