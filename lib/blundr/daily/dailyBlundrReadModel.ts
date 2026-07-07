import { getLocalLearningEvents } from "@/lib/blundr/learning/learningEvents";
import { buildDailyBlundrDeck, type DailyBlundrDeckBuildResult } from "./dailyBlundrDeckBuilder";
import { loadLegacyProgressSnapshot } from "./adapters/progressMistakeAdapter";
import { getDailyBlundrDateKey, loadDailyBlundrStore, reconcileDailyBlundrSession, type DailyBlundrStore } from "./dailyBlundrStorage";
import { loadDailyBlundrReviewStore } from "./dailyBlundrReviewStorage";
import { buildDailyBlundrReviewStats, type DailyBlundrReviewStats } from "./dailyBlundrReviewStats";
import type { DailyBlundrReviewAttempt, DailyBlundrReviewCard } from "./dailyBlundrReviewTypes";
import { getLocalAccountCurrentUserId } from "../accounts/localAccountStorage";

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function resolveMiniGameScenarioKey(card: DailyBlundrStore["sessions"]["sessionsByDate"][string]["cards"][number]): string {
  return normalizeText(card.miniGame?.scenario?.novelty.scenarioKey) || normalizeText(card.miniGame?.noveltyKey) || normalizeText(card.miniGame?.formationHash);
}

function collectRecentMiniGameScenarioKeys(store: DailyBlundrStore, currentDateKey: string, limit = 12): string[] {
  const sessions = Object.values(store.sessions.sessionsByDate)
    .filter((session) => session.dateKey !== currentDateKey)
    .sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  const keys: string[] = [];
  const seen = new Set<string>();
  for (const session of sessions) {
    for (const card of session.cards) {
      if (card.kind !== "mini_game") continue;
      const key = resolveMiniGameScenarioKey(card);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      keys.push(key);
      if (keys.length >= limit) return keys;
    }
  }
  return keys;
}

export type DailyBlundrOverview = {
  dateKey: string;
  deck: DailyBlundrDeckBuildResult;
  store: DailyBlundrStore;
  reviewCards: DailyBlundrReviewCard[];
  reviewAttempts: DailyBlundrReviewAttempt[];
  reviewStats: DailyBlundrReviewStats;
  currentSession: ReturnType<typeof reconcileDailyBlundrSession>;
  legacyProgress: ReturnType<typeof loadLegacyProgressSnapshot>;
  learningEventCount: number;
};

export function loadDailyBlundrOverview(limit = 5): DailyBlundrOverview {
  const dateKey = getDailyBlundrDateKey();
  const now = new Date().toISOString();
  const legacyProgress = loadLegacyProgressSnapshot();
  const learningEvents = getLocalLearningEvents();
  const store = loadDailyBlundrStore();
  const reviewStore = loadDailyBlundrReviewStore();
  const userIdOrLocalId = getLocalAccountCurrentUserId();
  const existingSession = store.sessions.sessionsByDate[dateKey] ?? null;
  const recentScenarioKeys = collectRecentMiniGameScenarioKeys(store, dateKey);
  const freshDeck = buildDailyBlundrDeck({
    progress: legacyProgress,
    learningEvents,
    mastery: store.mastery,
    reviewCards: reviewStore.reviewCards,
    reviewAttempts: reviewStore.reviewAttempts,
    dateKey,
    now,
    limit,
    userIdOrLocalId,
    recentScenarioKeys,
  });
  const sessionCards = existingSession?.cards?.length ? existingSession.cards : freshDeck.cards;
  const currentSession = reconcileDailyBlundrSession({
    dateKey,
    deck: sessionCards,
    existing: existingSession,
  });
  const deck = existingSession?.cards?.length
    ? {
        ...freshDeck,
        cards: sessionCards,
        fingerprint: currentSession.deckFingerprint || freshDeck.fingerprint,
        isEmpty: sessionCards.length === 0,
        summary: {
          ...freshDeck.summary,
          totalCards: sessionCards.length,
        },
      }
    : freshDeck;
  const reviewStats = buildDailyBlundrReviewStats({
    reviewCards: deck.reviewCards,
    reviewAttempts: deck.reviewAttempts,
    currentSession,
    deck: {
      dueReviewCount: deck.dueReviewCount,
      selectedReviewCards: deck.selectedReviewCards,
      selectionMode: deck.selectionMode,
    },
    now,
  });

  return {
    dateKey,
    deck,
    store: {
      ...store,
      sessions: {
        ...store.sessions,
        sessionsByDate: {
          ...store.sessions.sessionsByDate,
          [dateKey]: currentSession,
        },
      },
    },
    reviewCards: deck.reviewCards,
    reviewAttempts: deck.reviewAttempts,
    reviewStats,
    currentSession,
    legacyProgress,
    learningEventCount: learningEvents.length,
  };
}
