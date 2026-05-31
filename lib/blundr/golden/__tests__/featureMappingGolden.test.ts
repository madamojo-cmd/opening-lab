import assert from "node:assert/strict";

import { extractAdvancedFeatures } from "../../features/advancedFeatureExtractor";
import { recognizeStrategicPlans } from "../../plans/planRecognitionEngine";
import { mapFeaturesToOpportunities } from "../../opportunity/featureOpportunityMapper";

export function testFeatureMappingGolden(): void {
  const fen = "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3";
  const features = extractAdvancedFeatures(fen);
  const plans = recognizeStrategicPlans({ fen, features, openingId: "italian", conceptId: "develop_with_pressure", moveUci: "f1c4", moveSan: "Bc4" });
  const opportunities = mapFeaturesToOpportunities({ features, plans, expectedMoveUci: "f1c4", expectedMoveSan: "Bc4", trainerView: "assisted", visualRecipeId: "r", conceptId: "develop_with_pressure" });
  assert.equal(opportunities.some((opportunity) => opportunity.requiredPlanIds.length > 0), true);
}
