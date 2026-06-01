import assert from "node:assert/strict";

import { explanationCacheKey, explanationCacheStats, getCachedExplanation, resetExplanationCache, setCachedExplanation } from "../explanationCache";

export function testExplanationCache(): void {
  resetExplanationCache();
  const key = explanationCacheKey({ opportunityId: "o", intent: "explain_training_move" });
  setCachedExplanation(key, { title: "T", body: "B", utteranceFamily: "f", blockedReasons: [], safetyStatus: "passed" });
  assert.equal(getCachedExplanation(key)?.body, "B");
  assert.equal(explanationCacheStats().hits >= 1, true);
}
