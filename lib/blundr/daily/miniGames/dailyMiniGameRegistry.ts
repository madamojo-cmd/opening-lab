import type { DailyMiniGameDefinition } from "./dailyMiniGameTypes";
import { kingRaceDefinition } from "./kingRace";
import { knightGymnasiumDefinition } from "./knightGymnasium";
import { pawnWarsDefinition } from "./pawnWars";

export const DAILY_MINI_GAME_REGISTRY: DailyMiniGameDefinition[] = [
  kingRaceDefinition,
  knightGymnasiumDefinition,
  pawnWarsDefinition,
];

const DAILY_MINI_GAME_REGISTRY_BY_ID = new Map(DAILY_MINI_GAME_REGISTRY.map((definition) => [definition.id, definition] as const));

export function getDailyMiniGameDefinition(id: DailyMiniGameDefinition["id"]): DailyMiniGameDefinition | null {
  return DAILY_MINI_GAME_REGISTRY_BY_ID.get(id) ?? null;
}

