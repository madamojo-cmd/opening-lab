import type { TeachingOpportunity } from "./opportunityTypes";

export function repertoireOpportunity(opportunity: TeachingOpportunity): TeachingOpportunity {
  return { ...opportunity, layer: "repertoire", repertoireRelevance: 100, layerPrior: Math.max(opportunity.layerPrior, 20) };
}
