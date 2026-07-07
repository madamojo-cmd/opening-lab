import { getLocalDateKey, addLocalDays, normalizeLocalDateKey } from "../daily-rings/dailyRingDate";
import { loadDailyRingSnapshot } from "../daily-rings/dailyRingService";
import { loadDailyBlundrOverview } from "../daily/dailyBlundrReadModel";
import { loadDailyBlundrReviewStore } from "../daily/dailyBlundrReviewStorage";
import { loadLegacyProgressSnapshot } from "../daily/adapters/progressMistakeAdapter";
import { getLocalLearningEvents } from "../learning/learningEvents";
import { loadRepertoireProgress } from "../repertoire/repertoireProgressService";
import { getStage2OpeningAvailability } from "../openings/openingAvailability";
import { getLocalAccountCurrentUserId, readLocalAccountBundle } from "../accounts/localAccountStorage";
import type { BlundrProgressActivityItem, BlundrProgressInsight, BlundrProgressNextAction, BlundrProgressRingSummary, BlundrProgressSummary, BlundrProgressWeekDay } from "./progressTypes";

function nowIso(): string {
  return new Date().toISOString();
}

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function clampPct(numerator: number, denominator: number): number {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((Math.min(numerator, denominator) / denominator) * 100)));
}

function getWeekDateKeys(todayDateKey: string): string[] {
  const keys: string[] = [];
  for (let offset = -6; offset <= 0; offset += 1) {
    const key = addLocalDays(todayDateKey, offset);
    if (key) keys.push(key);
  }
  return keys;
}

function isWithinWeek(dateKey: string, weekDateKeys: readonly string[]): boolean {
  return weekDateKeys.includes(dateKey);
}

function localDateFromIso(value: string | null | undefined): string | null {
  const text = normalizeText(value);
  if (!text) return null;
  const parsed = Date.parse(text);
  if (!Number.isFinite(parsed)) return null;
  return getLocalDateKey(new Date(parsed));
}

function uniqueStrings(values: readonly string[]): string[] {
  return Array.from(new Set(values.map((value) => normalizeText(value)).filter(Boolean)));
}

function buildRingSummaries(snapshot: ReturnType<typeof loadDailyRingSnapshot>): BlundrProgressRingSummary[] {
  return [
    {
      ringId: "daily_tempo",
      label: "Daily Tempo",
      progress: snapshot.dayRecord.dailyTempo.progress,
      goal: snapshot.dayRecord.dailyTempo.goal,
      percent: clampPct(snapshot.dayRecord.dailyTempo.progress, snapshot.dayRecord.dailyTempo.goal),
      closed: snapshot.dayRecord.dailyTempo.closed,
    },
    {
      ringId: "daily_battery",
      label: "Daily Battery",
      progress: snapshot.dayRecord.dailyBattery.progress,
      goal: snapshot.dayRecord.dailyBattery.goal,
      percent: clampPct(snapshot.dayRecord.dailyBattery.progress, snapshot.dayRecord.dailyBattery.goal),
      closed: snapshot.dayRecord.dailyBattery.closed,
    },
    {
      ringId: "daily_blundr",
      label: "Daily Blundr",
      progress: snapshot.dayRecord.dailyBlundr.progress,
      goal: snapshot.dayRecord.dailyBlundr.goal,
      percent: clampPct(snapshot.dayRecord.dailyBlundr.progress, snapshot.dayRecord.dailyBlundr.goal),
      closed: snapshot.dayRecord.dailyBlundr.closed,
    },
  ];
}

function buildWeekGrid(todayDateKey: string, progressByKey: ReturnType<typeof readLocalAccountBundle>["dailyRetentionProgressByKey"], reviewCountByDate: Map<string, number>): BlundrProgressWeekDay[] {
  const weekDateKeys = getWeekDateKeys(todayDateKey);
  return weekDateKeys.map((localDate) => {
    const dayProgress = Object.values(progressByKey).find((entry) => normalizeLocalDateKey(entry.localDate) === localDate) ?? null;
    const hasTraining = Boolean(
      dayProgress &&
        (dayProgress.rings.dailyTempo.progress > 0 ||
          dayProgress.rings.dailyBattery.progress > 0 ||
          dayProgress.rings.dailyBlundr.progress > 0 ||
          dayProgress.allRingsClosed),
    );
    return {
      localDate,
      label: localDate.slice(5),
      hasTraining,
      allRingsClosed: Boolean(dayProgress?.allRingsClosed),
      reviewCount: reviewCountByDate.get(localDate) ?? 0,
    };
  });
}

function countLearningEventsByDate(events: readonly ReturnType<typeof getLocalLearningEvents>[number][], predicate: (event: ReturnType<typeof getLocalLearningEvents>[number]) => boolean): Map<string, number> {
  const counts = new Map<string, number>();
  for (const event of events) {
    if (!predicate(event)) continue;
    const localDate = localDateFromIso(event.createdAt);
    if (!localDate) continue;
    counts.set(localDate, (counts.get(localDate) ?? 0) + 1);
  }
  return counts;
}

function countReviewAttemptsByDate(attempts: readonly ReturnType<typeof loadDailyBlundrReviewStore>["reviewAttempts"]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const attempt of attempts) {
    const localDate = localDateFromIso(attempt.completedAt);
    if (!localDate) continue;
    counts.set(localDate, (counts.get(localDate) ?? 0) + 1);
  }
  return counts;
}

function buildReviewCardLookup(reviewCards: readonly ReturnType<typeof loadDailyBlundrReviewStore>["reviewCards"]): Map<string, ReturnType<typeof loadDailyBlundrReviewStore>["reviewCards"][number]> {
  const lookup = new Map<string, ReturnType<typeof loadDailyBlundrReviewStore>["reviewCards"][number]>();
  for (const card of reviewCards) {
    lookup.set(card.id, card);
  }
  return lookup;
}

function isMiniGameReviewCard(card: ReturnType<typeof loadDailyBlundrReviewStore>["reviewCards"][number] | null | undefined): boolean {
  return Boolean(card?.sourceCard && typeof card.sourceCard === "object" && (card.sourceCard as { kind?: unknown }).kind === "mini_game");
}

function countMiniGameReviewAttemptsByDate(input: {
  reviewCards: readonly ReturnType<typeof loadDailyBlundrReviewStore>["reviewCards"];
  reviewAttempts: readonly ReturnType<typeof loadDailyBlundrReviewStore>["reviewAttempts"];
  weekDateKeys: readonly string[];
  todayDateKey: string;
}): { today: number; week: number } {
  const lookup = buildReviewCardLookup(input.reviewCards);
  let today = 0;
  let week = 0;
  for (const attempt of input.reviewAttempts) {
    const card = lookup.get(attempt.reviewCardId) ?? null;
    if (!isMiniGameReviewCard(card)) continue;
    const localDate = localDateFromIso(attempt.completedAt);
    if (!localDate) continue;
    if (localDate === input.todayDateKey) today += 1;
    if (isWithinWeek(localDate, input.weekDateKeys)) week += 1;
  }
  return { today, week };
}

function countMiniGamePracticeEventsByDate(events: readonly ReturnType<typeof getLocalLearningEvents>[number][], weekDateKeys: readonly string[], todayDateKey: string): { today: number; week: number } {
  let today = 0;
  let week = 0;
  for (const event of events) {
    if (event.metadata?.practiceMode !== "mini_game") continue;
    if (event.type !== "move_correct" && event.type !== "move_incorrect" && event.type !== "move_attempted") continue;
    const localDate = localDateFromIso(event.createdAt);
    if (!localDate) continue;
    if (localDate === todayDateKey) today += 1;
    if (isWithinWeek(localDate, weekDateKeys)) week += 1;
  }
  return { today, week };
}

function topOpeningFromEvents(events: readonly ReturnType<typeof getLocalLearningEvents>[number][]): { openingId: string | null; openingName: string | null; count: number } {
  const counts = new Map<string, { openingName: string | null; count: number }>();
  for (const event of events) {
    if (event.source !== "train" || event.type !== "move_correct") continue;
    const openingId = normalizeText(event.openingId);
    if (!openingId) continue;
    const current = counts.get(openingId) ?? { openingName: normalizeText(event.openingName) || null, count: 0 };
    current.count += 1;
    if (!current.openingName && normalizeText(event.openingName)) {
      current.openingName = normalizeText(event.openingName);
    }
    counts.set(openingId, current);
  }
  const top = Array.from(counts.entries()).sort((a, b) => b[1].count - a[1].count || a[0].localeCompare(b[0]))[0];
  return top ? { openingId: top[0], openingName: top[1].openingName, count: top[1].count } : { openingId: null, openingName: null, count: 0 };
}

function buildWeakAreaItems(legacyMistakes: ReturnType<typeof loadLegacyProgressSnapshot>["mistakes"]): Array<{ openingId: string; openingName: string; misses: number }> {
  const byOpening = new Map<string, { openingName: string; misses: number }>();
  for (const mistake of Object.values(legacyMistakes)) {
    const openingId = normalizeText(mistake.repertoireId) || "unknown";
    const openingName = normalizeText(mistake.opening) || "Unknown opening";
    const current = byOpening.get(openingId) ?? { openingName, misses: 0 };
    current.misses += Math.max(1, Number(mistake.count) || 1);
    if (current.openingName === "Unknown opening" && openingName !== "Unknown opening") {
      current.openingName = openingName;
    }
    byOpening.set(openingId, current);
  }
  return Array.from(byOpening.entries())
    .map(([openingId, value]) => ({ openingId, openingName: value.openingName, misses: value.misses }))
    .sort((a, b) => b.misses - a.misses || a.openingName.localeCompare(b.openingName))
    .slice(0, 4);
}

function buildMilestones(summary: {
  dailyBlundrCompleted: boolean;
  currentStreakDays: number;
  longestStreakDays: number;
  totalAllRingsClosedDays: number;
}): BlundrProgressInsight[] {
  const milestones: BlundrProgressInsight[] = [];
  if (summary.dailyBlundrCompleted) {
    milestones.push({
      title: "First Daily Blundr",
      message: "You completed at least one Daily Blundr session. Tempo now has a review loop to work with.",
    });
  }
  if (summary.totalAllRingsClosedDays > 0) {
    milestones.push({
      title: "First all-rings day",
      message: "You closed all three rings on at least one day. That is the core habit loop working.",
    });
  }
  if (summary.currentStreakDays >= 3) {
    milestones.push({
      title: "3-day streak",
      message: "You have training momentum. Keep the pace steady and Tempo will keep building the loop.",
    });
  }
  if (summary.currentStreakDays >= 7) {
    milestones.push({
      title: "7-day streak",
      message: "A weekly streak unlocks the first major Tempo Cache milestone.",
    });
  }
  if (summary.currentStreakDays >= 30) {
    milestones.push({
      title: "30-day streak",
      message: "That is a month of consistency. Tempo treats that as a major training milestone.",
    });
  }
  if (!milestones.length) {
    milestones.push({
      title: "Start here",
      message: "Finish an opening run and Daily Blundr session, then check back for milestone progress.",
    });
  }
  return milestones;
}

function buildRecentActivity(input: {
  todayDateKey: string;
  ringSnapshot: ReturnType<typeof loadDailyRingSnapshot>;
  rewardRollCount: number;
  reviewAttemptsToday: number;
  minigamesToday: number;
  openingRunToday: number;
  batteryToday: number;
  dailyBlundrToday: number;
  topOpening: { openingId: string | null; openingName: string | null; count: number };
}): BlundrProgressActivityItem[] {
  const items: BlundrProgressActivityItem[] = [];
  if (input.openingRunToday > 0) {
    items.push({
      key: "opening-run",
      title: "Opening training",
      message: `${input.openingRunToday} opening run${input.openingRunToday === 1 ? "" : "s"} today.`,
      localDate: input.todayDateKey,
      href: "/",
      tone: "positive",
    });
  }
  if (input.batteryToday > 0) {
    items.push({
      key: "battery",
      title: "Battery training",
      message: `${input.batteryToday} continuation session${input.batteryToday === 1 ? "" : "s"} today.`,
      localDate: input.todayDateKey,
      href: "/",
      tone: "positive",
    });
  }
  if (input.dailyBlundrToday > 0) {
    items.push({
      key: "daily-blundr",
      title: "Daily Blundr",
      message: `${input.dailyBlundrToday} review completion${input.dailyBlundrToday === 1 ? "" : "s"} today.`,
      localDate: input.todayDateKey,
      href: "/daily",
      tone: "positive",
    });
  }
  if (input.reviewAttemptsToday > 0) {
    items.push({
      key: "review-queue",
      title: "Review Queue",
      message: `${input.reviewAttemptsToday} review attempt${input.reviewAttemptsToday === 1 ? "" : "s"} recorded today.`,
      localDate: input.todayDateKey,
      href: "/review",
      tone: "neutral",
    });
  }
  if (input.minigamesToday > 0) {
    items.push({
      key: "minigames",
      title: "Minigame practice",
      message: `${input.minigamesToday} minigame practice session${input.minigamesToday === 1 ? "" : "s"} today.`,
      localDate: input.todayDateKey,
      href: "/review",
      tone: "positive",
    });
  }
  if (input.rewardRollCount > 0) {
    items.push({
      key: "rewards",
      title: "Tempo Cache",
      message: `${input.rewardRollCount} reward roll${input.rewardRollCount === 1 ? "" : "s"} are stored locally.`,
      localDate: input.todayDateKey,
      href: "/daily",
      tone: "positive",
    });
  }
  if (input.topOpening.openingId) {
    items.push({
      key: "top-opening",
      title: "Most trained opening",
      message: `${input.topOpening.openingName ?? input.topOpening.openingId} is leading today.`,
      localDate: input.todayDateKey,
      href: "/repertoire",
      tone: "neutral",
    });
  }
  return items.slice(0, 5);
}

function buildNextActions(summary: BlundrProgressSummary): BlundrProgressNextAction[] {
  return [
    {
      title: "Continue Training",
      href: "/",
      description: summary.today.allRingsClosed ? "Keep the momentum going with another training set." : "Close your remaining daily rings.",
    },
    {
      title: "Start Daily Blundr",
      href: "/daily",
      description: summary.today.allRingsClosed ? "Review the positions Tempo saved for tomorrow." : "Work through today’s review loop.",
    },
    {
      title: "Review Queue",
      href: "/review",
      description: "Practice the positions that need a second look.",
    },
    {
      title: "Practice Minigames",
      href: "/review",
      description: "Warm up key patterns outside the Daily Blundr loop.",
    },
    {
      title: "Repertoire",
      href: "/repertoire",
      description: summary.repertoire.nextUnlockCost > 0 ? `${summary.repertoire.nextUnlockProgressPct}% toward your next unlock.` : "All MVP openings are currently unlocked.",
    },
  ];
}

function resolveOpeningName(openingId: string | null): string | null {
  if (!openingId) return null;
  return getStage2OpeningAvailability(openingId)?.displayName ?? openingId;
}

export function loadBlundrProgressSummary(input: { userId?: string | null; now?: string } = {}): BlundrProgressSummary {
  const userId = normalizeText(input.userId) || getLocalAccountCurrentUserId();
  const generatedAt = normalizeText(input.now) || nowIso();
  const todayDateKey = getLocalDateKey(new Date(generatedAt));
  const ringSnapshot = loadDailyRingSnapshot({ userId, localDate: todayDateKey });
  const dailyBlundrOverview = loadDailyBlundrOverview(5);
  const repertoireProgress = loadRepertoireProgress({ userId, now: generatedAt });
  const reviewStore = loadDailyBlundrReviewStore();
  const legacyProgress = loadLegacyProgressSnapshot();
  const bundle = readLocalAccountBundle();
  const learningEvents = getLocalLearningEvents();
  const weekDateKeys = getWeekDateKeys(todayDateKey);

  const reviewAttemptsByDate = countReviewAttemptsByDate(reviewStore.reviewAttempts);
  const learningEventsWeek = learningEvents.filter((event) => {
    const localDate = localDateFromIso(event.createdAt);
    return localDate ? isWithinWeek(localDate, weekDateKeys) : false;
  });
  const learningEventsToday = learningEvents.filter((event) => localDateFromIso(event.createdAt) === todayDateKey);

  const openingRunToday = learningEventsToday.filter((event) => event.source === "train" && event.type === "move_correct" && event.trainingMode === "restricted").length;
  const openingRunWeek = learningEventsWeek.filter((event) => event.source === "train" && event.type === "move_correct" && event.trainingMode === "restricted").length;
  const batteryToday = learningEventsToday.filter((event) => event.source === "train" && event.type === "move_correct" && event.trainingMode === "continuation").length;
  const batteryWeek = learningEventsWeek.filter((event) => event.source === "train" && event.type === "move_correct" && event.trainingMode === "continuation").length;
  const dailyBlundrToday = reviewStore.reviewAttempts.filter((attempt) => localDateFromIso(attempt.completedAt) === todayDateKey).length;
  const dailyBlundrWeek = reviewStore.reviewAttempts.filter((attempt) => {
    const localDate = localDateFromIso(attempt.completedAt);
    return localDate ? isWithinWeek(localDate, weekDateKeys) : false;
  }).length;
  const reviewAttemptsToday = reviewStore.reviewAttempts.filter((attempt) => localDateFromIso(attempt.completedAt) === todayDateKey).length;
  const reviewAttemptsWeek = reviewStore.reviewAttempts.filter((attempt) => {
    const localDate = localDateFromIso(attempt.completedAt);
    return localDate ? isWithinWeek(localDate, weekDateKeys) : false;
  }).length;
  const miniGameReviewCounts = countMiniGameReviewAttemptsByDate({
    reviewCards: reviewStore.reviewCards,
    reviewAttempts: reviewStore.reviewAttempts,
    weekDateKeys,
    todayDateKey,
  });
  const miniGamePracticeCounts = countMiniGamePracticeEventsByDate(learningEvents, weekDateKeys, todayDateKey);
  const minigamesToday = miniGameReviewCounts.today + miniGamePracticeCounts.today;
  const minigamesWeek = miniGameReviewCounts.week + miniGamePracticeCounts.week;

  const dailyRetentionProgressDays = Object.values(bundle.dailyRetentionProgressByKey).filter((entry) => {
    const localDate = normalizeLocalDateKey(entry.localDate);
    return Boolean(localDate && isWithinWeek(localDate, weekDateKeys) && (entry.rings.dailyTempo.progress > 0 || entry.rings.dailyBattery.progress > 0 || entry.rings.dailyBlundr.progress > 0 || entry.allRingsClosed));
  });
  const daysTrainedThisWeek = uniqueStrings(dailyRetentionProgressDays.map((entry) => normalizeLocalDateKey(entry.localDate) ?? "")).length;
  const weekReviewCounts = countReviewAttemptsByDate(reviewStore.reviewAttempts);
  const week = buildWeekGrid(todayDateKey, bundle.dailyRetentionProgressByKey, weekReviewCounts);

  const topOpening = topOpeningFromEvents(learningEvents);
  const weakAreaItems = buildWeakAreaItems(legacyProgress.mistakes);
  const accuracyDenominator = learningEventsToday.filter((event) => event.source === "train" && (event.type === "move_correct" || event.type === "move_incorrect")).length;
  const accuracyNumerator = learningEventsToday.filter((event) => event.source === "train" && event.type === "move_correct").length;
  const accuracyPct = accuracyDenominator > 0 ? Math.round((accuracyNumerator / accuracyDenominator) * 100) : null;

  const summary: BlundrProgressSummary = {
    userId,
    generatedAt,
    todayDateKey,
    today: {
      rings: buildRingSummaries(ringSnapshot),
      allRingsClosed: ringSnapshot.dayRecord.allRingsClosed,
      nextBestAction: ringSnapshot.dayRecord.allRingsClosed ? "Come back tomorrow to keep the streak alive." : ringSnapshot.dayRecord.dailyTempo.closed ? ringSnapshot.dayRecord.dailyBattery.closed ? "Finish Daily Blundr to close the loop." : "Complete your continuation work next." : "Start with your opening reps.",
    },
    streak: {
      currentDays: ringSnapshot.streakRecord.currentStreakDays,
      bestDays: ringSnapshot.streakRecord.longestStreakDays,
      totalAllRingsClosedDays: ringSnapshot.streakRecord.totalAllRingsClosedDays,
      daysTrainedThisWeek,
      week,
    },
    trainingVolume: {
      openingRunsToday: openingRunToday,
      openingRunsWeek: openingRunWeek,
      batteryToday,
      batteryWeek,
      dailyBlundrToday,
      dailyBlundrWeek,
      reviewAttemptsToday,
      reviewAttemptsWeek,
      minigamesToday,
      minigamesWeek,
    },
    accuracy: {
      correct: accuracyNumerator,
      incorrect: Math.max(0, accuracyDenominator - accuracyNumerator),
      accuracyPct,
      enoughData: accuracyDenominator >= 3,
      message:
        accuracyDenominator >= 3
          ? `Tempo sees ${accuracyPct}% opening accuracy today.`
          : "Not enough data yet. Complete a few Daily Blundr cards and we’ll show your recall quality here.",
    },
    repertoire: {
      unlockedOpenings: repertoireProgress.unlockedOpeningIds.length,
      lockedOpenings: repertoireProgress.lockedOpeningIds.length,
      availablePoints: repertoireProgress.availablePoints,
      nextUnlockCost: repertoireProgress.nextUnlockCost,
      nextUnlockProgressPct: repertoireProgress.nextUnlockProgressPct,
      mostTrainedOpeningId: topOpening.openingId,
      mostTrainedOpeningName: topOpening.openingId ? resolveOpeningName(topOpening.openingId) : topOpening.openingName,
      recommendedOpeningId: repertoireProgress.lockedOpeningIds[0] ?? repertoireProgress.unlockedOpeningIds[0] ?? null,
      recommendedOpeningName: resolveOpeningName(repertoireProgress.lockedOpeningIds[0] ?? repertoireProgress.unlockedOpeningIds[0] ?? null),
    },
    weakAreas: {
      items: weakAreaItems.length
        ? weakAreaItems
        : [
            {
              openingId: "none",
              openingName: "No clear weak area yet",
              misses: 0,
            },
          ],
      message: weakAreaItems.length
        ? "Tempo is seeing your repeated misses and will surface the weakest lines here."
        : "Complete a few Daily Blundr cards and we’ll surface your weakest lines here.",
    },
    milestones: buildMilestones({
      dailyBlundrCompleted: dailyBlundrOverview.store.progress.completionCount > 0,
      currentStreakDays: ringSnapshot.streakRecord.currentStreakDays,
      longestStreakDays: ringSnapshot.streakRecord.longestStreakDays,
      totalAllRingsClosedDays: ringSnapshot.streakRecord.totalAllRingsClosedDays,
    }),
    recentActivity: buildRecentActivity({
      todayDateKey,
      ringSnapshot,
      rewardRollCount: bundle.rewardRollsByUserId[userId]?.length ?? 0,
      reviewAttemptsToday,
      minigamesToday,
      openingRunToday,
      batteryToday,
      dailyBlundrToday,
      topOpening,
    }),
    nextActions: [] as BlundrProgressNextAction[],
  };

  summary.nextActions = buildNextActions(summary);
  return summary;
}
