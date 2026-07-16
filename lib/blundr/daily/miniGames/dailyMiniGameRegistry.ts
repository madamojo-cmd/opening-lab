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

function aliasDefinition(
  base: DailyMiniGameDefinition,
  id: "tactic_shots_deep" | "knight_gymnasium_deep" | "king_pawn_lab",
  displayName: string,
  shortDescription: string,
): DailyMiniGameDefinition {
  return {
    ...base,
    id,
    title: displayName,
    displayName,
    summary: shortDescription,
    shortDescription,
    generate: (ctx) => {
      const card = base.generate({ ...ctx, miniGameId: base.id });
      return card
        ? {
            ...card,
            title: displayName,
            summary: shortDescription,
            miniGame: { ...card.miniGame, miniGameId: id },
          }
        : null;
    },
    advance: base.advance
      ? (state, attempt) => {
          const result = base.advance?.(
            { ...state, miniGameId: base.id },
            attempt,
          );
          return result
            ? { ...result, state: { ...result.state, miniGameId: id } }
            : (null as never);
        }
      : undefined,
  };
}

export const DAILY_MINI_GAME_REGISTRY: DailyMiniGameDefinition[] = [
  aliasDefinition(
    tacticShotsDefinition,
    "tactic_shots_deep",
    "Deep Tactic Shots",
    "Play a verified multi-step tactical sequence.",
  ),
  aliasDefinition(
    knightGymnasiumDefinition,
    "knight_gymnasium_deep",
    "Knight Gymnasium",
    "Route a knight through a verified target sequence.",
  ),
  aliasDefinition(
    techniqueLabDefinition,
    "king_pawn_lab",
    "King & Pawn Lab",
    "Convert a verified king-and-pawn endgame.",
  ),
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
