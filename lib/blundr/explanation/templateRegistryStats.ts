import { getCoachTemplates } from "./coachTemplateLibrary";

export function getTemplateRegistryStats(): Record<string, unknown> {
  const templates = getCoachTemplates();
  const byCategory: Record<string, number> = {};
  const byIntent: Record<string, number> = {};
  const byRatingBucket: Record<string, number> = {};
  const byRequiredFeatureType: Record<string, number> = {};
  for (const template of templates) {
    byCategory[template.category] = (byCategory[template.category] ?? 0) + 1;
    byIntent[template.intent] = (byIntent[template.intent] ?? 0) + 1;
    for (const bucket of template.ratingBuckets) byRatingBucket[bucket] = (byRatingBucket[bucket] ?? 0) + 1;
    for (const feature of template.requiredFeatureClaimTypes ?? []) byRequiredFeatureType[feature] = (byRequiredFeatureType[feature] ?? 0) + 1;
  }
  return {
    totalTemplates: templates.length,
    byCategory,
    byIntent,
    byRatingBucket,
    byRequiredFeatureType,
    unsafeBlockedCount: templates.filter((template) => template.safety.mentionsTactic || template.safety.mentionsForcedLine || template.safety.mentionsEvaluation).length,
  };
}
