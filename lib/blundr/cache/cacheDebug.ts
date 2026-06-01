import { explanationCacheStats } from "./explanationCache";
import { featureCacheStats } from "./featureCache";
import { opportunityCacheStats } from "./opportunityCache";
import { planCacheStats } from "./planCache";

export function buildCoachCacheDebug(): Record<string, unknown> {
  return {
    featureCache: featureCacheStats(),
    planCache: planCacheStats(),
    opportunityCache: opportunityCacheStats(),
    explanationCache: explanationCacheStats(),
  };
}
