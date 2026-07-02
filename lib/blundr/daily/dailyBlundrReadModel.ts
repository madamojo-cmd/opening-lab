import { getLocalLearningEvents } from "@/lib/blundr/learning/learningEvents";
import { buildDailyBlundrDeck, type DailyBlundrDeckBuildResult } from "./dailyBlundrDeckBuilder";
import { loadLegacyProgressSnapshot } from "./adapters/progressMistakeAdapter";
import { getDailyBlundrDateKey, loadDailyBlundrStore, reconcileDailyBlundrSession, type DailyBlundrStore } from "./dailyBlundrStorage";

export type DailyBlundrOverview = {
  dateKey: string;
  deck: DailyBlundrDeckBuildResult;
  store: DailyBlundrStore;
  currentSession: ReturnType<typeof reconcileDailyBlundrSession>;
  legacyProgress: ReturnType<typeof loadLegacyProgressSnapshot>;
  learningEventCount: number;
};

export function loadDailyBlundrOverview(limit = 5): DailyBlundrOverview {
  const dateKey = getDailyBlundrDateKey();
  const legacyProgress = loadLegacyProgressSnapshot();
  const learningEvents = getLocalLearningEvents();
  const store = loadDailyBlundrStore();
  const deck = buildDailyBlundrDeck({
    progress: legacyProgress,
    learningEvents,
    mastery: store.mastery,
    dateKey,
    limit,
  });
  const currentSession = reconcileDailyBlundrSession({
    dateKey,
    deck: deck.cards,
    existing: store.sessions.sessionsByDate[dateKey] ?? null,
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
    currentSession,
    legacyProgress,
    learningEventCount: learningEvents.length,
  };
}
