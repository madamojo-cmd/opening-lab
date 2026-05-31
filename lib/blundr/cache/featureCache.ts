import { extractAdvancedFeatures } from "../features/advancedFeatureExtractor";
import type { AdvancedFeaturePacket } from "../features/advancedFeatureTypes";
import { createCoachCache } from "./coachCacheTypes";
import { normalizedFenCacheKey } from "./normalizedFenCache";

export const FEATURE_CACHE_VERSION = "features:2.7.39";
const featureCache = createCoachCache<AdvancedFeaturePacket>(FEATURE_CACHE_VERSION);

export function featureCacheKey(fen: string): string {
  return normalizedFenCacheKey(fen);
}

export function getCachedAdvancedFeatures(fen: string): AdvancedFeaturePacket {
  const key = featureCacheKey(fen);
  const cached = featureCache.get(key);
  if (cached) return cached;
  const packet = extractAdvancedFeatures(fen);
  featureCache.set(key, packet);
  return packet;
}

export function resetFeatureCache(): void {
  featureCache.invalidate();
}

export function featureCacheStats(): ReturnType<typeof featureCache.stats> {
  return featureCache.stats();
}
