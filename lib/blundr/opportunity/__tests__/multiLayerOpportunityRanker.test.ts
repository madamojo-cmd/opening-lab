import assert from "node:assert/strict";

import { rankTeachingOpportunities } from "../multiLayerOpportunityRanker";
import type { TeachingOpportunity } from "../opportunityTypes";

function opportunity(id: string, score: number, visual = 50): TeachingOpportunity {
  return {
    id,
    layer: "strategic",
    intent: "show_continued_plan",
    requiredClaimIds: [],
    requiredFeatureClaimIds: [],
    requiredPlanIds: [],
    forbiddenIfMissing: [],
    specificityScore: score,
    pedagogicalValue: score,
    urgencyScore: 20,
    confidenceScore: score,
    repertoireRelevance: 20,
    visualAlignmentScore: visual,
    planCoherenceScore: score,
    ratingFitScore: 100,
    repetitionPenalty: 0,
    safetyPenalty: 0,
    layerPrior: 0,
    totalScore: 0,
    canRender: true,
    debug: {},
  };
}

export function testMultiLayerOpportunityRanker(): void {
  const selected = rankTeachingOpportunities([opportunity("generic", 20), opportunity("specific", 90)]);
  assert.equal(selected?.id, "specific");
  const tie = rankTeachingOpportunities([opportunity("a", 80, 50), opportunity("b", 80, 100)]);
  assert.equal(tie?.id, "b");
  const blocked = rankTeachingOpportunities([{ ...opportunity("blocked", 100), safetyPenalty: 100 }, opportunity("safe", 20)]);
  assert.equal(blocked?.id, "safe");
}
