import type { TeachingOpportunity } from "../opportunity/opportunityTypes";

export function specificityBand(opportunity: TeachingOpportunity): "move_specific" | "plan_specific" | "generic" {
  if (opportunity.specificityScore >= 90) return "move_specific";
  if (opportunity.specificityScore >= 70) return "plan_specific";
  return "generic";
}
