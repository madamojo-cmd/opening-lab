import type { DailyMiniGameDefinition } from "./dailyMiniGameTypes";
import { kingRaceDefinition } from "./kingRace";
import { keySquareConquestDefinition } from "./keySquareConquest";
import { imbalanceArenaDefinition } from "./imbalanceArena";
import { knightGymnasiumDefinition } from "./knightGymnasium";
import { structureBuilderDefinition } from "./structureBuilder";
import { pawnWarsDefinition } from "./pawnWars";
import { tacticShotsDefinition } from "./tacticShots";
import { techniqueLabDefinition } from "./techniqueLab";

export const DAILY_MINI_GAME_REGISTRY: DailyMiniGameDefinition[] = [
  kingRaceDefinition,
  knightGymnasiumDefinition,
  pawnWarsDefinition,
  tacticShotsDefinition,
  keySquareConquestDefinition,
  structureBuilderDefinition,
  imbalanceArenaDefinition,
  techniqueLabDefinition,
];

const DAILY_MINI_GAME_REGISTRY_MAP = new Map(
  DAILY_MINI_GAME_REGISTRY.map((definition) => [definition.id, definition] as const),
);

export function getDailyMiniGameDefinition(id: DailyMiniGameDefinition["id"]): DailyMiniGameDefinition | null {
  return DAILY_MINI_GAME_REGISTRY_MAP.get(id) ?? null;
}
