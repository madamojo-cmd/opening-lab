import type { TeachingOpportunity } from "./opportunityTypes";

export function buildMappingDebug(input: {
  featureClaimIds: string[];
  planIds: string[];
  opportunity?: TeachingOpportunity | null;
  templateId?: string;
  blockedReasons?: string[];
}): Record<string, unknown> {
  return {
    mappingFeatureClaimIds: input.featureClaimIds,
    mappingPlanIds: input.planIds,
    mappingOpportunityId: input.opportunity?.id ?? "none",
    mappingTemplateId: input.templateId ?? "none",
    mappingBlockedReasons: input.blockedReasons ?? [],
  };
}
