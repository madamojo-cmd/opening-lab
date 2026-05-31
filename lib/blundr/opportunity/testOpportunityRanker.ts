import { testFeatureOpportunityMapper } from "./__tests__/featureOpportunityMapper.test";
import { testMultiLayerOpportunityRanker } from "./__tests__/multiLayerOpportunityRanker.test";

export function testOpportunityRanker(): void {
  testFeatureOpportunityMapper();
  testMultiLayerOpportunityRanker();
}
