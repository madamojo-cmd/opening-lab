import type { StrategicPlanPacket } from "../plans/planTypes";
import { recognizeStrategicPlans } from "../plans/planRecognitionEngine";
import { createCoachCache } from "./coachCacheTypes";
import { normalizedFenCacheKey } from "./normalizedFenCache";

export const PLAN_CACHE_VERSION = "plans:2.7.39";
const planCache = createCoachCache<StrategicPlanPacket>(PLAN_CACHE_VERSION);

export function planCacheKey(input: { fen: string; expectedMoveUci?: string; openingId?: string; conceptId?: string; trainerMode?: string }): string {
  return [normalizedFenCacheKey(input.fen), input.expectedMoveUci ?? "", input.openingId ?? "", input.conceptId ?? "", input.trainerMode ?? ""].join("|");
}

export function getCachedStrategicPlans(input: Parameters<typeof recognizeStrategicPlans>[0]): StrategicPlanPacket {
  const key = planCacheKey({ fen: input.fen, expectedMoveUci: input.moveUci, openingId: input.openingId, conceptId: input.conceptId });
  const cached = planCache.get(key);
  if (cached) return cached;
  const packet = recognizeStrategicPlans(input);
  planCache.set(key, packet);
  return packet;
}

export function resetPlanCache(): void {
  planCache.invalidate();
}

export function planCacheStats(): ReturnType<typeof planCache.stats> {
  return planCache.stats();
}
