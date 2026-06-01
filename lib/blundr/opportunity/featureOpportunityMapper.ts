import type { AdvancedFeaturePacket } from "../features/advancedFeatureTypes";
import type { StrategicPlanPacket } from "../plans/planTypes";
import type { TeachingOpportunity } from "./opportunityTypes";

export function mapFeaturesToOpportunities(input: {
  features: AdvancedFeaturePacket;
  plans: StrategicPlanPacket;
  expectedMoveUci?: string;
  expectedMoveSan?: string;
  visualRecipeId?: string;
  conceptId?: string;
  trainerView: "assisted" | "plain" | "freeplay";
  interaction?: string;
}): TeachingOpportunity[] {
  const opportunities: TeachingOpportunity[] = [];
  const expectedPlan = input.plans.plans.find((plan) => plan.canMention && (plan.moveUci === input.expectedMoveUci || plan.conceptId === input.conceptId)) ?? input.plans.plans.find((plan) => plan.canMention);
  if (input.expectedMoveUci && expectedPlan) {
    opportunities.push(baseOpportunity({
      id: `expected:${input.expectedMoveUci}:${expectedPlan.type}`,
      layer: "expected_move",
      intent: input.trainerView === "plain" ? "recall_prompt" : "explain_training_move",
      moveUci: input.expectedMoveUci,
      moveSan: input.expectedMoveSan,
      conceptId: input.conceptId,
      planId: expectedPlan.id,
      requiredPlanIds: [expectedPlan.id],
      requiredFeatureClaimIds: expectedPlan.relatedFeatures,
      specificityScore: 100,
      pedagogicalValue: 100,
      urgencyScore: 80,
      confidenceScore: expectedPlan.confidence === "high" ? 100 : 75,
      planCoherenceScore: 100,
      repertoireRelevance: 100,
      visualAlignmentScore: input.visualRecipeId && input.trainerView === "assisted" ? 100 : 50,
      layerPrior: 25,
    }));
  }
  if (input.visualRecipeId && expectedPlan && input.trainerView === "assisted") {
    opportunities.push(baseOpportunity({
      id: `visual:${input.visualRecipeId}:${expectedPlan.type}`,
      layer: "visual_recipe",
      intent: "explain_visual_recipe",
      moveUci: input.expectedMoveUci,
      moveSan: input.expectedMoveSan,
      conceptId: input.conceptId,
      recipeId: input.visualRecipeId,
      planId: expectedPlan.id,
      requiredPlanIds: [expectedPlan.id],
      requiredFeatureClaimIds: expectedPlan.relatedFeatures,
      specificityScore: 95,
      pedagogicalValue: 100,
      urgencyScore: 80,
      confidenceScore: 100,
      planCoherenceScore: 100,
      repertoireRelevance: 100,
      visualAlignmentScore: 100,
      layerPrior: 25,
    }));
  }
  for (const plan of input.plans.plans.filter((plan) => plan.canMention)) {
    opportunities.push(baseOpportunity({
      id: `strategic:${plan.id}`,
      layer: "strategic",
      intent: "show_continued_plan",
      moveUci: plan.moveUci,
      moveSan: plan.moveSan,
      conceptId: plan.conceptId,
      planId: plan.id,
      requiredPlanIds: [plan.id],
      requiredFeatureClaimIds: plan.relatedFeatures,
      specificityScore: plan.canDominate ? 80 : 60,
      pedagogicalValue: plan.canDominate ? 85 : 70,
      urgencyScore: plan.type === "castle_and_connect_rooks" ? 90 : 60,
      confidenceScore: plan.confidence === "high" ? 100 : 60,
      planCoherenceScore: 100,
      repertoireRelevance: plan.conceptId ? 80 : 50,
      visualAlignmentScore: input.visualRecipeId ? 80 : 50,
      layerPrior: 10,
    }));
  }
  if (!opportunities.length) {
    opportunities.push(baseOpportunity({
      id: "fallback:position_context",
      layer: "fallback",
      intent: "position_context",
      specificityScore: 5,
      pedagogicalValue: 20,
      urgencyScore: 10,
      confidenceScore: 60,
      planCoherenceScore: 0,
      repertoireRelevance: 0,
      visualAlignmentScore: 50,
      layerPrior: -50,
    }));
  }
  return opportunities;
}

function baseOpportunity(input: Partial<TeachingOpportunity> & Pick<TeachingOpportunity, "id" | "layer" | "intent">): TeachingOpportunity {
  return {
    titleKey: input.titleKey,
    moveUci: input.moveUci,
    moveSan: input.moveSan,
    conceptId: input.conceptId,
    patternId: input.patternId,
    planId: input.planId,
    recipeId: input.recipeId,
    requiredClaimIds: input.requiredClaimIds ?? [],
    requiredFeatureClaimIds: input.requiredFeatureClaimIds ?? [],
    requiredPlanIds: input.requiredPlanIds ?? [],
    forbiddenIfMissing: input.forbiddenIfMissing ?? [],
    specificityScore: input.specificityScore ?? 20,
    pedagogicalValue: input.pedagogicalValue ?? 20,
    urgencyScore: input.urgencyScore ?? 10,
    confidenceScore: input.confidenceScore ?? 60,
    repertoireRelevance: input.repertoireRelevance ?? 0,
    visualAlignmentScore: input.visualAlignmentScore ?? 50,
    planCoherenceScore: input.planCoherenceScore ?? 0,
    ratingFitScore: input.ratingFitScore ?? 100,
    repetitionPenalty: input.repetitionPenalty ?? 0,
    safetyPenalty: input.safetyPenalty ?? 0,
    layerPrior: input.layerPrior ?? 0,
    totalScore: 0,
    canRender: true,
    blockedReason: input.blockedReason,
    debug: input.debug ?? {},
    id: input.id,
    layer: input.layer,
    intent: input.intent,
  };
}
