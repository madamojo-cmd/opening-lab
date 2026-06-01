import type { TeachingOpportunity } from "../opportunity/opportunityTypes";
import { createCoachCache } from "./coachCacheTypes";
import { normalizedFenCacheKey } from "./normalizedFenCache";

export const OPPORTUNITY_CACHE_VERSION = "opportunity:2.7.39";
const opportunityCache = createCoachCache<TeachingOpportunity | null>(OPPORTUNITY_CACHE_VERSION);

export function opportunityCacheKey(input: { fen: string; expectedMoveUci?: string; trainerView: string; interaction: string; trainingMode: string; visualRecipeId?: string; ratingBucket?: string; memorySignature?: string }): string {
  return [normalizedFenCacheKey(input.fen), input.expectedMoveUci ?? "", input.trainerView, input.interaction, input.trainingMode, input.visualRecipeId ?? "", input.ratingBucket ?? "intermediate", input.memorySignature ?? ""].join("|");
}

export function getCachedOpportunity(key: string): TeachingOpportunity | null | undefined {
  return opportunityCache.get(key);
}

export function setCachedOpportunity(key: string, value: TeachingOpportunity | null): void {
  opportunityCache.set(key, value);
}

export function resetOpportunityCache(): void {
  opportunityCache.invalidate();
}

export function opportunityCacheStats(): ReturnType<typeof opportunityCache.stats> {
  return opportunityCache.stats();
}
