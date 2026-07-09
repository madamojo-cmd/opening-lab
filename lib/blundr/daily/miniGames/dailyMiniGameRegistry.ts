import type { DailyMiniGameDefinition } from "./dailyMiniGameTypes";
import { GENERATED_MINI_GAME_DEFINITIONS, GENERATED_MINI_GAME_REGISTRY_BY_ID } from "./generation/generatedMiniGameRegistry";

export const DAILY_MINI_GAME_REGISTRY: DailyMiniGameDefinition[] = [...GENERATED_MINI_GAME_DEFINITIONS];

const DAILY_MINI_GAME_REGISTRY_MAP = new Map(
  DAILY_MINI_GAME_REGISTRY.map((definition) => [definition.id, definition] as const),
);

export function getDailyMiniGameDefinition(id: DailyMiniGameDefinition["id"]): DailyMiniGameDefinition | null {
  return DAILY_MINI_GAME_REGISTRY_MAP.get(id) ?? GENERATED_MINI_GAME_REGISTRY_BY_ID.get(id) ?? null;
}

