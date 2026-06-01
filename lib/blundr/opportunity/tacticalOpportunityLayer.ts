import type { TeachingOpportunity } from "./opportunityTypes";

export function tacticalOpportunityBlocked(id = "tactical:blocked"): TeachingOpportunity {
  return {
    id,
    layer: "tactical",
    intent: "silent",
    requiredClaimIds: [],
    requiredFeatureClaimIds: [],
    requiredPlanIds: [],
    forbiddenIfMissing: ["deterministic_tactical_detector"],
    specificityScore: 0,
    pedagogicalValue: 0,
    urgencyScore: 0,
    confidenceScore: 0,
    repertoireRelevance: 0,
    visualAlignmentScore: 0,
    planCoherenceScore: 0,
    ratingFitScore: 0,
    repetitionPenalty: 0,
    safetyPenalty: 100,
    layerPrior: 0,
    totalScore: 0,
    canRender: false,
    blockedReason: "tactical_detector_deferred_to_v2_8",
    debug: {},
  };
}
