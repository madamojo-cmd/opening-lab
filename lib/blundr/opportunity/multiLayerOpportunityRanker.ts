import type { TeachingOpportunity } from "./opportunityTypes";

export function scoreOpportunity(opportunity: TeachingOpportunity): TeachingOpportunity {
  const missingPenalty = opportunity.forbiddenIfMissing.length ? 100 : 0;
  const safetyPenalty = Math.max(opportunity.safetyPenalty, missingPenalty);
  const totalScore =
    opportunity.specificityScore * 0.25 +
    opportunity.pedagogicalValue * 0.2 +
    opportunity.confidenceScore * 0.18 +
    opportunity.planCoherenceScore * 0.15 +
    opportunity.visualAlignmentScore * 0.1 +
    opportunity.repertoireRelevance * 0.1 +
    opportunity.urgencyScore * 0.08 +
    opportunity.ratingFitScore * 0.06 +
    opportunity.layerPrior -
    opportunity.repetitionPenalty * 0.15 -
    safetyPenalty;
  return {
    ...opportunity,
    totalScore,
    safetyPenalty,
    canRender: opportunity.canRender && safetyPenalty < 100,
    blockedReason: safetyPenalty >= 100 ? "hard_safety_constraint" : opportunity.blockedReason,
  };
}

export function rankTeachingOpportunities(opportunities: TeachingOpportunity[]): TeachingOpportunity | null {
  const scored = opportunities.map(scoreOpportunity).filter((opportunity) => opportunity.canRender);
  scored.sort((a, b) => {
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    if (b.visualAlignmentScore !== a.visualAlignmentScore) return b.visualAlignmentScore - a.visualAlignmentScore;
    if (b.specificityScore !== a.specificityScore) return b.specificityScore - a.specificityScore;
    if (b.planCoherenceScore !== a.planCoherenceScore) return b.planCoherenceScore - a.planCoherenceScore;
    if (b.repertoireRelevance !== a.repertoireRelevance) return b.repertoireRelevance - a.repertoireRelevance;
    if (a.repetitionPenalty !== b.repetitionPenalty) return a.repetitionPenalty - b.repetitionPenalty;
    return a.id.localeCompare(b.id);
  });
  return scored[0] ?? null;
}
