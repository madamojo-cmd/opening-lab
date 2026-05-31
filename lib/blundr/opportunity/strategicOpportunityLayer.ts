import type { TeachingOpportunity } from "./opportunityTypes";

export function strategicOpportunity(opportunity: TeachingOpportunity): TeachingOpportunity {
  return { ...opportunity, layer: "strategic", layerPrior: Math.max(opportunity.layerPrior, 10) };
}
