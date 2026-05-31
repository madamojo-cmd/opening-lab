import { testCacheInvalidation } from "./__tests__/cacheInvalidation.test";
import { testExplanationCache } from "./__tests__/explanationCache.test";
import { testFeatureCache } from "./__tests__/featureCache.test";
import { testOpportunityCache } from "./__tests__/opportunityCache.test";
import { testPlanCache } from "./__tests__/planCache.test";

export function testCoachCaching(): void {
  testFeatureCache();
  testPlanCache();
  testOpportunityCache();
  testExplanationCache();
  testCacheInvalidation();
}
