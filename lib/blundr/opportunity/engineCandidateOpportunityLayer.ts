import type { TeachingOpportunity } from "./opportunityTypes";

export function engineCandidateOpportunity(opportunity: TeachingOpportunity, exactMoveAllowed: boolean): TeachingOpportunity {
  return {
    ...opportunity,
    layer: "engine_candidate",
    intent: exactMoveAllowed ? "show_trusted_move" : "show_continued_plan",
    specificityScore: exactMoveAllowed ? 70 : 40,
    safetyPenalty: exactMoveAllowed ? opportunity.safetyPenalty : Math.max(opportunity.safetyPenalty, 40),
  };
}
