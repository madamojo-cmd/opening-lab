import type { AdvancedFeaturePacket } from "../features/advancedFeatureTypes";
import type { StrategicPlanPacket } from "../plans/planTypes";
import type { TeachingOpportunity } from "../opportunity/opportunityTypes";
import type { VerifiedMoveFacts } from "../runtime/currentInstructionFrame";
import { opportunityTemplateMatches } from "./opportunityTemplateMatcher";
import { getCoachTemplates } from "./coachTemplateLibrary";
import { validateRenderedCoachClaims } from "./coachClaimValidator";
import type { RenderedCoachExplanation } from "./explanationTypes";
import { lintCoachExplanation } from "./explanationSafetyLinter";
import { normalizeCoachVoice } from "./coachVoicePolicy";
import { renderTemplate, resolveTemplateVariables } from "./templateVariableResolver";

export function renderProceduralExplanation(input: {
  opportunity: TeachingOpportunity;
  features: AdvancedFeaturePacket;
  plans: StrategicPlanPacket;
  moveFacts?: VerifiedMoveFacts | null;
  plainLeakPolicy?: boolean;
}): RenderedCoachExplanation {
  const availableFeatureTypes = input.features.featureClaims.filter((claim) => claim.canMention).map((claim) => claim.type);
  const blockedReasons: string[] = [];
  const templates = getCoachTemplates();
  for (const template of templates) {
    const match = opportunityTemplateMatches({
      opportunity: input.opportunity,
      template,
      plans: input.plans,
      availableFeatureTypes,
      plainViewLeakBlocked: input.plainLeakPolicy,
    });
    if (!match.allowed) {
      blockedReasons.push(`${template.id}:${match.reason}`);
      continue;
    }
    const plan = input.plans.plans.find((candidate) => candidate.id === input.opportunity.planId) ?? input.plans.plans[0];
    const variables = resolveTemplateVariables({ opportunity: input.opportunity, features: input.features, plan });
    const rendered = renderTemplate(template.bodyTemplate, variables);
    if (rendered.missing.length) {
      blockedReasons.push(`${template.id}:missing_variables:${rendered.missing.join(",")}`);
      continue;
    }
    const body = normalizeCoachVoice(rendered.text);
    const lint = lintCoachExplanation({ text: body, template, plainLeakPolicy: input.plainLeakPolicy });
    if (!lint.allowed) {
      blockedReasons.push(`${template.id}:${lint.warnings.join("|")}`);
      continue;
    }
    const claims = validateRenderedCoachClaims({
      body,
      moveFacts: input.moveFacts ?? null,
      features: input.features,
      plans: input.plans,
      selectedPlan: plan,
      selectedOpportunity: input.opportunity,
      selectedTemplateId: template.id,
    });
    if (!claims.allowed) {
      blockedReasons.push(`${template.id}:claim_validation_failed:${claims.unverifiedClaims.join("|")}`);
      continue;
    }
    return {
      title: template.titleTemplate ?? "Opening pattern",
      body,
      templateId: template.id,
      utteranceFamily: template.category,
      blockedReasons,
      safetyStatus: "passed",
    };
  }
  return {
    title: "Coach",
    body: "",
    utteranceFamily: "silent",
    blockedReasons,
    safetyStatus: "blocked",
  };
}
