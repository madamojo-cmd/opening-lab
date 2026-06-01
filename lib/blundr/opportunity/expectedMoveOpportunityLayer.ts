import type { TeachingOpportunity } from "./opportunityTypes";

export function expectedMoveOpportunity(opportunity: TeachingOpportunity): TeachingOpportunity {
  return { ...opportunity, layer: "expected_move", layerPrior: Math.max(opportunity.layerPrior, 25) };
}
