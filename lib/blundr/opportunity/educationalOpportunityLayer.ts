import type { TeachingOpportunity } from "./opportunityTypes";

export function educationalOpportunity(opportunity: TeachingOpportunity): TeachingOpportunity {
  return { ...opportunity, layer: "educational", layerPrior: Math.max(opportunity.layerPrior, 5) };
}
