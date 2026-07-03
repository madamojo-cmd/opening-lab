import type { LearningEvent } from "@/lib/blundr/learning/learningEvents";
import { selectDailyMiniGame } from "./miniGames/dailyMiniGameSelector";
import type { DailyBlundrMiniGameCard } from "./miniGames/dailyMiniGameTypes";
import type {
  DailyBlundrCard,
  DailyBlundrDeckSummary,
  DailyBlundrMasteryRecord,
  DailyBlundrMasteryState,
  DailyBlundrSeed,
} from "./dailyBlundrTypes";
import { adaptLearningEventsToDailySeeds } from "./adapters/learningEventAdapter";
import { adaptProgressMistakesToDailySeeds, type LegacyProgressSnapshot } from "./adapters/progressMistakeAdapter";
import { buildDailyBlundrDeckFromReviews, type DailyBlundrReviewDeckBuildResult } from "./dailyBlundrReviewSelector";
import { buildDailyBlundrReviewStats, type DailyBlundrReviewStats } from "./dailyBlundrReviewStats";
import type { DailyBlundrReviewAttempt, DailyBlundrReviewCard } from "./dailyBlundrReviewTypes";

export type DailyBlundrDeckBuildInput = {
  progress: LegacyProgressSnapshot | null;
  learningEvents: readonly LearningEvent[] | null;
  mastery?: DailyBlundrMasteryState | null;
  reviewCards?: readonly DailyBlundrReviewCard[] | null;
  reviewAttempts?: readonly DailyBlundrReviewAttempt[] | null;
  dateKey?: string;
  now?: string;
  limit?: number;
};

export type DailyBlundrDeckBuildResult = DailyBlundrReviewDeckBuildResult & {
  dateKey: string;
  fingerprint: string;
  seeds: DailyBlundrSeed[];
  summary: DailyBlundrDeckSummary;
  isEmpty: boolean;
  reviewAttempts: DailyBlundrReviewAttempt[];
  reviewStats: DailyBlundrReviewStats;
};

const DEFAULT_LIMIT = 5;

function nowDateKey(): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function parseIsoTimestamp(value: string | null): number {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseDateKeyToLocalMs(dateKey: string): number {
  const parts = dateKey.split("-").map((part) => Number(part));
  if (parts.length !== 3 || parts.some((part) => !Number.isFinite(part))) return Date.now();
  const [year, month, day] = parts;
  return new Date(year, month - 1, day).getTime();
}

function recencyBoost(dateKey: string, lastSeenAt: string | null): number {
  const seenAt = parseIsoTimestamp(lastSeenAt);
  if (!seenAt) return 0;
  const reference = parseDateKeyToLocalMs(dateKey);
  const ageDays = Math.max(0, (reference - seenAt) / 86_400_000);
  return Math.max(0, 0.45 - ageDays * 0.04);
}

function confidenceWeight(confidence: DailyBlundrSeed["confidence"]): number {
  if (confidence === "high") return 1.08;
  if (confidence === "medium") return 1.02;
  return 0.95;
}

function getRelatedMasteryRecords(seed: DailyBlundrSeed, mastery: DailyBlundrMasteryState | null | undefined): DailyBlundrMasteryRecord[] {
  if (!mastery?.records) return [];
  const keys = [seed.cardKey, ...seed.masteryTargets.map((target) => target.conceptKey)];
  return keys.map((key) => mastery.records[key]).filter((record): record is DailyBlundrMasteryRecord => Boolean(record));
}

function hasRecentMistake(record: DailyBlundrMasteryRecord): boolean {
  const incorrect = parseIsoTimestamp(record.lastIncorrectAt);
  const correct = parseIsoTimestamp(record.lastCorrectAt);
  return incorrect > 0 && incorrect >= correct;
}

function scoreSeed(seed: DailyBlundrSeed, mastery: DailyBlundrMasteryState | null | undefined, dateKey: string): number {
  const relatedRecords = getRelatedMasteryRecords(seed, mastery);
  const masteryRecord = relatedRecords[0] ?? null;
  const strongestMastery = relatedRecords.reduce((max, record) => Math.max(max, record.currentMastery ?? record.confidence ?? 0), masteryRecord?.currentMastery ?? masteryRecord?.confidence ?? 0);
  const strongestConfidence = relatedRecords.reduce((max, record) => Math.max(max, record.confidence ?? 0), masteryRecord?.confidence ?? 0);
  const recentMistakeSignal = relatedRecords.some(hasRecentMistake) || seed.signals.some((signal) => signal.includes("recent_miss") || signal.includes("progress_mistake") || signal.includes("move_incorrect"));
  const masteryPenalty = strongestMastery > 0.85 && strongestConfidence > 0.6 && !recentMistakeSignal ? 0.6 : strongestMastery > 0.75 && strongestConfidence > 0.5 ? 0.78 : 1;
  const sourceBias = seed.source === "learning_event" ? 1.08 : seed.source === "merged" ? 1.03 : 1;
  const signalBias = seed.signals.some((signal) => signal.includes("cue_revealed") || signal.includes("move_incorrect") || signal.includes("recent_miss")) ? 1.08 : 1;
  return (seed.weight + recencyBoost(dateKey, seed.lastSeenAt)) * sourceBias * confidenceWeight(seed.confidence) * signalBias * masteryPenalty;
}

function mergeSeeds(seeds: DailyBlundrSeed[]): DailyBlundrSeed[] {
  type AggregatedSeed = DailyBlundrSeed & {
    sourceSet: Set<DailyBlundrSeed["source"]>;
    signalSet: Set<string>;
    masteryTargetMap: Map<string, DailyBlundrSeed["masteryTargets"][number]>;
  };
  const merged = new Map<string, AggregatedSeed>();

  for (const seed of seeds) {
    const existing = merged.get(seed.cardKey);
    if (!existing) {
      merged.set(seed.cardKey, {
        ...seed,
        sourceSet: new Set([seed.source]),
        signalSet: new Set(seed.signals),
        masteryTargetMap: new Map(seed.masteryTargets.map((target) => [target.conceptKey, target])),
      });
      continue;
    }

    existing.count += seed.count;
    existing.weight += seed.weight;
    existing.sourceSet.add(seed.source);
    for (const signal of seed.signals) existing.signalSet.add(signal);
    for (const target of seed.masteryTargets) existing.masteryTargetMap.set(target.conceptKey, target);
    const existingSeenAt = parseIsoTimestamp(existing.lastSeenAt);
    const nextSeenAt = parseIsoTimestamp(seed.lastSeenAt);
    if (nextSeenAt > existingSeenAt) {
      existing.lastSeenAt = seed.lastSeenAt;
    }
    existing.openingName = existing.openingName || seed.openingName;
    existing.openingId = existing.openingId || seed.openingId;
    existing.patternId = existing.patternId || seed.patternId;
    existing.concept = existing.concept || seed.concept;
    existing.note = existing.note || seed.note;
    existing.playedMoveUci = existing.playedMoveUci || seed.playedMoveUci;
    existing.playedMoveSan = existing.playedMoveSan || seed.playedMoveSan;
    if (seed.confidence === "high" || (seed.confidence === "medium" && existing.confidence === "low")) {
      existing.confidence = seed.confidence;
    }
    if (seed.difficulty === "advanced" || seed.difficulty === "expert") {
      existing.difficulty = seed.difficulty;
    } else if (existing.difficulty === "beginner" && seed.difficulty !== "beginner") {
      existing.difficulty = seed.difficulty;
    }
  }

  return Array.from(merged.values()).map((seed) => ({
    ...(() => {
      const { sourceSet, signalSet, masteryTargetMap, ...rest } = seed;
      return {
        ...rest,
        signals: Array.from(signalSet),
        masteryTargets: Array.from(masteryTargetMap.values()),
      };
    })(),
    source: seed.sourceSet.size > 1 ? "merged" : seed.source,
  }));
}

function buildSummary(rawSeeds: DailyBlundrSeed[], cards: DailyBlundrCard[]): DailyBlundrDeckSummary {
  const fromLearningEvents = rawSeeds.filter((seed) => seed.source === "learning_event").length;
  const fromProgressMistakes = rawSeeds.filter((seed) => seed.source === "progress_mistake").length;
  return {
    totalSeeds: rawSeeds.length,
    totalCards: cards.length,
    fromLearningEvents,
    fromProgressMistakes,
    mergedCards: Math.max(0, rawSeeds.length - cards.length),
  };
}

function buildCardSummary(seed: DailyBlundrSeed, sourceCount: number): string {
  const opening = normalizeText(seed.openingName) || "Local recall";
  const signalLabel = sourceCount === 1 ? "signal" : "signals";
  return `${opening} • ${sourceCount} ${signalLabel}`;
}

export function buildDailyBlundrDeck(input: DailyBlundrDeckBuildInput): DailyBlundrDeckBuildResult {
  const dateKey = input.dateKey ?? nowDateKey();
  const limit = Math.max(1, Math.min(5, Number(input.limit ?? DEFAULT_LIMIT) || DEFAULT_LIMIT));
  const now = input.now ?? new Date().toISOString();
  const progressSeeds = adaptProgressMistakesToDailySeeds(input.progress);
  const eventSeeds = adaptLearningEventsToDailySeeds(input.learningEvents);
  const rawSeeds = [...eventSeeds, ...progressSeeds];
  const mergedSeeds = mergeSeeds(rawSeeds);

  const rankedSeeds = mergedSeeds
    .map((seed) => ({ seed, priority: scoreSeed(seed, input.mastery, dateKey) }))
    .sort((a, b) =>
      b.priority - a.priority ||
      b.seed.count - a.seed.count ||
      parseIsoTimestamp(b.seed.lastSeenAt) - parseIsoTimestamp(a.seed.lastSeenAt) ||
      normalizeText(a.seed.openingName).localeCompare(normalizeText(b.seed.openingName)) ||
      a.seed.cardKey.localeCompare(b.seed.cardKey),
    )
    .slice(0, limit);

  const candidateCards: DailyBlundrCard[] = rankedSeeds.map(({ seed, priority }, index) => ({
    ...seed,
    id: seed.cardKey,
    kind: "recall",
    title: seed.openingName || "Daily BLUNDR recall",
    prompt: seed.expectedMoveSan
      ? `Recall the move for ${seed.openingName || "this position"}`
      : `Recall the continuation for ${seed.openingName || "this position"}`,
    repertoireId: seed.openingId,
    deckRank: index + 1,
    priority,
    masteryKey: seed.cardKey,
    sourceCount: seed.count,
    summary: buildCardSummary(seed, seed.count),
  }));

  const reviewDeck = buildDailyBlundrDeckFromReviews({
    dateKey,
    existingReviewCards: input.reviewCards ?? [],
    candidateDailyCards: candidateCards,
    mastery: input.mastery ?? null,
    limit,
    now,
    allowBootstrap: false,
  });
  const reviewStats = buildDailyBlundrReviewStats({
    reviewCards: reviewDeck.reviewCards,
    reviewAttempts: input.reviewAttempts ?? [],
    now,
    deck: {
      dueReviewCount: reviewDeck.dueReviewCount,
      selectedReviewCards: reviewDeck.selectedReviewCards,
      selectionMode: reviewDeck.selectionMode,
    },
  });
  const miniGameSelection = selectDailyMiniGame({
    mastery: input.mastery ?? null,
    dateKey,
    now,
    dueReviewCount: reviewDeck.dueReviewCount,
    selectedReviewCount: reviewDeck.selectedReviewCards.length,
    recentMiniGameIds: [],
    recentFenKeys: [],
    sessionMiniGameIds: [],
    excludedMiniGameIds: [],
  });

  const cards: DailyBlundrCard[] = [...reviewDeck.cards];
  if (miniGameSelection && (reviewDeck.dueReviewCount === 0 || cards.length < limit)) {
    const miniGameCard = miniGameSelection.card;
    cards.push({
      ...miniGameCard,
      deckRank: cards.length + 1,
      priority: miniGameCard.priority,
      summary: miniGameCard.summary,
    } as DailyBlundrMiniGameCard);
  }

  const fingerprint = cards.map((card) => card.cardKey).join("|");

  return {
    dateKey,
    fingerprint,
    cards,
    seeds: mergedSeeds,
    summary: buildSummary(rawSeeds, cards),
    isEmpty: cards.length === 0,
    reviewCards: reviewDeck.reviewCards,
    reviewAttempts: input.reviewAttempts ? [...input.reviewAttempts] : [],
    selectedReviewCards: reviewDeck.selectedReviewCards,
    dueReviewCount: reviewDeck.dueReviewCount,
    bootstrapUsed: reviewDeck.bootstrapUsed,
    selectionMode: reviewDeck.selectionMode,
    reviewStats,
  };
}
