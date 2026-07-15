import type { DeepMiniGameId } from "./deepMiniGameTypes";
export const DEEP_MINI_GAME_REGISTRY: readonly DeepMiniGameId[] = [
  "tactic_shots_deep",
  "knight_gymnasium_deep",
  "king_pawn_lab",
];
export function isDeepMiniGameId(value: string): value is DeepMiniGameId {
  return (DEEP_MINI_GAME_REGISTRY as readonly string[]).includes(value);
}
