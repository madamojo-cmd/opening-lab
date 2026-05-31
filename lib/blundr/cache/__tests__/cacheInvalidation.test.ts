import assert from "node:assert/strict";

import { featureCacheStats, getCachedAdvancedFeatures, resetFeatureCache } from "../featureCache";

export function testCacheInvalidation(): void {
  resetFeatureCache();
  getCachedAdvancedFeatures("8/8/8/8/8/8/8/4K3 w - - 0 1");
  assert.equal(featureCacheStats().size, 1);
  resetFeatureCache();
  assert.equal(featureCacheStats().size, 0);
}
