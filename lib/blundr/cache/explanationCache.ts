import type { RenderedCoachExplanation } from "../explanation/explanationTypes";
import { createCoachCache } from "./coachCacheTypes";

export const EXPLANATION_CACHE_VERSION = "explanation:2.7.39";
const explanationCache = createCoachCache<RenderedCoachExplanation>(EXPLANATION_CACHE_VERSION);

export function explanationCacheKey(input: { opportunityId: string; intent: string; ratingDepth?: string; variableSignature?: string; plainLeakPolicy?: boolean }): string {
  return [input.opportunityId, input.intent, input.ratingDepth ?? "intermediate", input.variableSignature ?? "", input.plainLeakPolicy ? "plain-safe" : "normal"].join("|");
}

export function getCachedExplanation(key: string): RenderedCoachExplanation | undefined {
  return explanationCache.get(key);
}

export function setCachedExplanation(key: string, value: RenderedCoachExplanation): void {
  explanationCache.set(key, value);
}

export function resetExplanationCache(): void {
  explanationCache.invalidate();
}

export function explanationCacheStats(): ReturnType<typeof explanationCache.stats> {
  return explanationCache.stats();
}
