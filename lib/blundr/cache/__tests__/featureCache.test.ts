import assert from "node:assert/strict";

import { featureCacheKey, featureCacheStats, getCachedAdvancedFeatures, resetFeatureCache } from "../featureCache";

export function testFeatureCache(): void {
  resetFeatureCache();
  const fen = "8/8/8/8/8/8/8/4K3 w - - 0 1";
  assert.equal(featureCacheKey(`${fen} 2 3`), featureCacheKey(fen));
  getCachedAdvancedFeatures(fen);
  getCachedAdvancedFeatures(fen);
  assert.equal(featureCacheStats().hits >= 1, true);
}
