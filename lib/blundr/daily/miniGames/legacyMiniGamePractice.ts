import { getLocalAccountCurrentUserId } from "@/lib/blundr/accounts/localAccountStorage";
import { readLocalBoardPreferences } from "@/lib/blundr/board/boardPreferenceService";
import { getDailyBlundrDateKey, reconcileDailyBlundrSession } from "../dailyBlundrStorage";
import { getDailyMiniGameDefinition } from "./dailyMiniGameRegistry";
import type { DailyBlundrMiniGameCard, DailyMiniGameId } from "./dailyMiniGameTypes";

export type LegacyMiniGamePracticeBundle = {
  card: DailyBlundrMiniGameCard;
  session: ReturnType<typeof reconcileDailyBlundrSession>;
  sessionDateKey: string;
};

function isLegacyMiniGameId(value: string): value is DailyMiniGameId {
  switch (value) {
    case "king_race":
    case "knight_gymnasium":
    case "pawn_wars":
    case "tactic_shots":
    case "key_square_conquest":
    case "structure_builder":
    case "imbalance_arena":
    case "technique_lab":
      return true;
    default:
      return false;
  }
}

export function buildLegacyPracticeBundle(miniGameId: string, nonce: number, recentScenarioKeys: readonly string[], userIdOrLocalId: string | null): LegacyMiniGamePracticeBundle | null {
  if (!isLegacyMiniGameId(miniGameId)) return null;
  const definition = getDailyMiniGameDefinition(miniGameId);
  if (!definition) return null;
  const dateKey = `${getDailyBlundrDateKey()}:${definition.id}:${nonce}`;
  const boardPreferences = typeof window !== "undefined" ? readLocalBoardPreferences(window.localStorage) : null;
  const card = definition.generate({
    dateKey,
    now: new Date().toISOString(),
    mastery: null,
    difficulty: definition.recommendedFor[0] ?? "beginner",
    currentMastery: 0.25,
    confidence: 0.25,
    dueReviewCount: 0,
    selectedReviewCount: 0,
    recentMiniGameIds: [],
    recentFenKeys: [],
    sessionMiniGameIds: [],
    source: "standalone_review",
    seed: `${definition.id}|${dateKey}|${nonce}|standalone_review|${userIdOrLocalId ?? getLocalAccountCurrentUserId() ?? "local"}`,
    userIdOrLocalId,
    recentScenarioKeys,
    boardPreferences,
    deckId: `review:${definition.id}`,
    miniGameId: definition.id,
  });
  if (!card || card.kind !== "mini_game") return null;
  return {
    card,
    session: reconcileDailyBlundrSession({ dateKey, deck: [card], existing: null }),
    sessionDateKey: dateKey,
  };
}
