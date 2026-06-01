import type { IntentFirstCoachDecision } from "./intentFirstCoachEngine";

export function summarizeCoachIntelligenceDebug(decision: IntentFirstCoachDecision): Record<string, unknown> {
  return {
    shouldShow: decision.shouldShow,
    intent: decision.intent,
    selectedOpportunityId: decision.selectedOpportunity?.id,
    selectedOpportunityScore: decision.selectedOpportunity?.totalScore,
    templateId: decision.templateId,
    suppressedReason: decision.suppressedReason,
    safetyWarnings: decision.safetyWarnings,
  };
}
