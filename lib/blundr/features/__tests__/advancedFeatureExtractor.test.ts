import assert from "node:assert/strict";

import { extractAdvancedFeatures } from "../advancedFeatureExtractor";

export function testAdvancedFeatureExtractor(): void {
  const packet = extractAdvancedFeatures("r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3");
  assert.equal(packet.featureClaims.some((claim) => claim.type === "active_bishop" && claim.square === "c4"), true);
  assert.equal(packet.blockedFeatureClaims.some((claim) => claim.type === "pin"), true);
  assert.equal(packet.confidence, "high");
}
