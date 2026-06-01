import type { TeachingOpportunity } from "./opportunityTypes";

export function summarizeOpportunityDebug(opportunity?: TeachingOpportunity | null): Record<string, unknown> {
  if (!opportunity) return { selectedOpportunityId: "none" };
  return {
    selectedOpportunityId: opportunity.id,
    selectedOpportunityLayer: opportunity.layer,
    selectedOpportunityScore: opportunity.totalScore,
    selectedIntent: opportunity.intent,
    blockedReason: opportunity.blockedReason,
  };
}
