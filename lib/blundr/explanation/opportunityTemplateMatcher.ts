import type { StrategicPlanPacket } from "../plans/planTypes";
import type { TeachingOpportunity } from "../opportunity/opportunityTypes";
import type { CoachTemplate } from "./explanationTypes";

export function opportunityTemplateMatches(input: {
  opportunity: TeachingOpportunity;
  template: CoachTemplate;
  plans: StrategicPlanPacket;
  availableFeatureTypes: string[];
  plainViewLeakBlocked?: boolean;
}): { allowed: boolean; reason?: string } {
  if (!input.template.opportunityLayers.includes(input.opportunity.layer)) return { allowed: false, reason: "layer_mismatch" };
  const compatibleIntent =
    input.template.intent === input.opportunity.intent ||
    (input.opportunity.intent === "explain_visual_recipe" && input.template.intent === "explain_training_move") ||
    (input.opportunity.intent === "recall_hint" && input.template.intent === "recall_prompt");
  if (!compatibleIntent) return { allowed: false, reason: "intent_mismatch" };
  if (input.plainViewLeakBlocked && input.template.safety.leaksAnswerInPlain) return { allowed: false, reason: "plain_view_leak" };
  for (const featureType of input.template.requiredFeatureClaimTypes ?? []) {
    if (!input.availableFeatureTypes.includes(featureType)) return { allowed: false, reason: `missing_feature:${featureType}` };
  }
  const requiredPlanTypes = input.template.requiredPlanTypes ?? [];
  const selectedPlan = input.opportunity.planId ? input.plans.plans.find((plan) => plan.id === input.opportunity.planId) : undefined;
  if (selectedPlan && requiredPlanTypes.length && !requiredPlanTypes.includes(selectedPlan.type)) {
    return { allowed: false, reason: `selected_plan_mismatch:${selectedPlan.type}` };
  }
  if (requiredPlanTypes.length && !requiredPlanTypes.some((planType) => input.plans.plans.some((plan) => plan.type === planType))) {
    return { allowed: false, reason: `missing_plan:${requiredPlanTypes.join("|")}` };
  }
  return { allowed: true };
}
