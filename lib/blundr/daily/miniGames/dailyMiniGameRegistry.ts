import type { DailyMiniGameDefinition } from "./dailyMiniGameTypes";
import { kingRaceDefinition } from "./kingRace";
import { keySquareConquestDefinition } from "./keySquareConquest";
import { imbalanceArenaDefinition } from "./imbalanceArena";
import { knightGymnasiumDefinition } from "./knightGymnasium";
import { structureBuilderDefinition } from "./structureBuilder";
import { pawnWarsDefinition } from "./pawnWars";
import { tacticShotsDefinition } from "./tacticShots";
import { techniqueLabDefinition } from "./techniqueLab";
import { FEATURE_FLAGS } from "@/lib/blundr/contracts";
import { DEEP_MINI_GAME_REGISTRY } from "./deep";

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
  DAILY_MINI_GAME_REGISTRY.map(
    (definition) => [definition.id, definition] as const,
  ),
);

export function getDailyMiniGameDefinition(
  id: DailyMiniGameDefinition["id"],
): DailyMiniGameDefinition | null {
  return DAILY_MINI_GAME_REGISTRY_MAP.get(id) ?? null;
}

export function getProductionRegisterableDeepMiniGames(
  flags = FEATURE_FLAGS,
): readonly string[] {
  return flags.daily_deep_minigames ? [...DEEP_MINI_GAME_REGISTRY] : [];
}
