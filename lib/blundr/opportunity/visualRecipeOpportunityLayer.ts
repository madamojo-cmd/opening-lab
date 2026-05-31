import type { TeachingOpportunity } from "./opportunityTypes";

export function visualRecipeOpportunity(opportunity: TeachingOpportunity): TeachingOpportunity {
  return { ...opportunity, layer: "visual_recipe", visualAlignmentScore: 100, layerPrior: Math.max(opportunity.layerPrior, 25) };
}
