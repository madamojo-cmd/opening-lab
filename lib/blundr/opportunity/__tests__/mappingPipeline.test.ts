import assert from "node:assert/strict";

import { extractAdvancedFeatures } from "../../features/advancedFeatureExtractor";
import { recognizeStrategicPlans } from "../../plans/planRecognitionEngine";
import { getCoachTemplates } from "../../explanation/coachTemplateLibrary";
import { opportunityTemplateMatches } from "../../explanation/opportunityTemplateMatcher";
import { mapFeaturesToOpportunities } from "../featureOpportunityMapper";
import { buildMappingDebug } from "../mappingDebug";
import { rankTeachingOpportunities } from "../multiLayerOpportunityRanker";

export function testMappingPipeline(): void {
  const fen = "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3";
  const features = extractAdvancedFeatures(fen);
  const plans = recognizeStrategicPlans({ fen, features, openingId: "italian", conceptId: "develop_with_pressure", moveUci: "f1c4", moveSan: "Bc4" });
  const opportunity = rankTeachingOpportunities(mapFeaturesToOpportunities({ features, plans, expectedMoveUci: "f1c4", expectedMoveSan: "Bc4", trainerView: "assisted", visualRecipeId: "r", conceptId: "develop_with_pressure" }))!;
  const template = getCoachTemplates().find((candidate) => candidate.category === "bishop_activity")!;
  assert.equal(opportunityTemplateMatches({ opportunity, template, plans, availableFeatureTypes: features.featureClaims.map((claim) => claim.type) }).allowed, true);
  const debug = buildMappingDebug({ featureClaimIds: features.featureClaims.map((claim) => claim.id), planIds: plans.plans.map((plan) => plan.id), opportunity, templateId: template.id });
  assert.equal(debug.mappingOpportunityId, opportunity.id);
}
