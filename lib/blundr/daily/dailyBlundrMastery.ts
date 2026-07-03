import type {
  DailyBlundrAttempt,
  DailyBlundrCard,
  DailyBlundrCardKind,
  DailyBlundrDifficulty,
  DailyBlundrMasteryRecord,
  DailyBlundrMasteryState,
  DailyBlundrMasteryTarget,
} from "./dailyBlundrTypes";
import { DAILY_BLUNDR_SCHEMA_VERSION } from "./dailyBlundrTypes";
import { getDailyConceptById } from "./concepts/dailyConceptRegistry";
import { getConceptIdsForMasteryTargets, normalizeConceptId } from "./concepts/dailyConceptTagging";

function nowIso(): string {
  return new Date().toISOString();
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function uniqueSources(existing: readonly string[] | undefined, next: string): DailyBlundrMasteryRecord["sources"] {
  return Array.from(new Set([...(existing ?? []), next])) as DailyBlundrMasteryRecord["sources"];
}

function uniqueTargets(card: DailyBlundrCard): DailyBlundrMasteryTarget[] {
  const conceptIds = Array.from(
    new Set(
      [
        ...(card.conceptIds ?? []),
        ...(card.primaryConceptId ? [card.primaryConceptId] : []),
        ...(card.conceptMasteryKeys ?? []).map((entry) => normalizeConceptId(entry)).filter((entry): entry is NonNullable<DailyBlundrCard["conceptIds"]>[number] => Boolean(entry)),
        ...getConceptIdsForMasteryTargets(card.masteryTargets),
      ].filter(Boolean),
    ),
  );
  const conceptTargets = conceptIds
    .map((conceptId) => {
      const concept = getDailyConceptById(conceptId);
      if (!concept) return null;
      return {
        conceptKey: concept.masteryKey,
        domain: concept.domain,
        label: concept.shortName || concept.displayName,
        difficultyHint: concept.recommendedDifficulty[0] ?? card.difficulty,
      };
    })
    .filter(Boolean) as DailyBlundrMasteryTarget[];

  const targets = card.kind === "recall" || card.kind === "mastery" || card.kind === "weak_spot" || card.kind === "training_game"
    ? [
        {
          conceptKey: card.masteryKey,
          domain: "daily_recall" as const,
          label: card.title || card.summary,
          difficultyHint: card.difficulty,
        },
        ...card.masteryTargets,
      ]
    : [...card.masteryTargets];
  targets.push(...conceptTargets);
  const seen = new Set<string>();
  return targets.filter((target) => {
    if (seen.has(target.conceptKey)) return false;
    seen.add(target.conceptKey);
    return true;
  });
}

function createDefaultRecord(card: DailyBlundrCard, key = card.masteryKey, at = nowIso(), target?: DailyBlundrMasteryTarget): DailyBlundrMasteryRecord {
  const domain = target?.domain ?? "daily_recall";
  const label = normalizeText(target?.label) || card.title || card.summary || key;
  const difficulty = target?.difficultyHint ?? card.difficulty ?? "beginner";
  return {
    key,
    label,
    domain,
    cardKind: card.kind as DailyBlundrCardKind,
    sources: [card.source],
    exposureCount: 0,
    attemptCount: 0,
    attempts: 0,
    correctCount: 0,
    correct: 0,
    incorrectCount: 0,
    incorrect: 0,
    recentAccuracy: 0,
    lifetimeAccuracy: 0,
    avgResponseTimeMs: null,
    hintRate: 0,
    revealRate: 0,
    currentMastery: 0.35,
    confidence: 0.4,
    currentDifficulty: difficulty,
    streak: 0,
    lapses: 0,
    firstSeenAt: at,
    lastSeenAt: at,
    lastAttemptAt: null,
    lastCorrectAt: null,
    lastIncorrectAt: null,
    updatedAt: at,
  };
}

function clampDifficulty(mastery: number): DailyBlundrDifficulty {
  if (mastery >= 0.9) return "expert";
  if (mastery >= 0.78) return "advanced";
  if (mastery >= 0.62) return "intermediate";
  if (mastery >= 0.48) return "early_intermediate";
  if (mastery >= 0.25) return "beginner";
  return "intro";
}

function scoreAttempt(attempt: DailyBlundrAttempt): number {
  if (attempt.outcome === "correct") {
    return attempt.usedReveal ? 0.72 : 1;
  }
  if (attempt.outcome === "reveal") return 0.28;
  if (attempt.outcome === "skip") return 0.2;
  return 0;
}

function getAttemptTimeMs(attempt: DailyBlundrAttempt): number | null {
  const value = Number(attempt.responseTimeMs);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

function updateSingleRecord(record: DailyBlundrMasteryRecord, card: DailyBlundrCard, attempt: DailyBlundrAttempt, now: string, target?: DailyBlundrMasteryTarget): DailyBlundrMasteryRecord {
  const isCorrect = attempt.outcome === "correct";
  const usedReveal = Boolean(attempt.usedReveal || attempt.outcome === "reveal");
  const attemptScore = scoreAttempt(attempt);
  const nextExposureCount = record.exposureCount + 1;
  const nextAttemptCount = record.attemptCount + 1;
  const nextCorrectCount = record.correctCount + (isCorrect ? 1 : 0);
  const nextIncorrectCount = record.incorrectCount + (attempt.outcome === "incorrect" ? 1 : 0);
  const nextRecentAccuracy = clamp01(record.recentAccuracy * 0.68 + attemptScore * 0.32);
  const nextLifetimeAccuracy = clamp01(nextCorrectCount / Math.max(1, nextAttemptCount));
  const nextHintRate = clamp01(record.hintRate * 0.8 + (usedReveal ? 0.2 : 0));
  const nextRevealRate = clamp01(record.revealRate * 0.8 + (usedReveal ? 0.2 : 0));
  const responseTimeMs = getAttemptTimeMs(attempt);
  const nextAvgResponseTimeMs =
    responseTimeMs === null
      ? record.avgResponseTimeMs
      : record.avgResponseTimeMs === null
        ? responseTimeMs
        : Math.round(record.avgResponseTimeMs * 0.72 + responseTimeMs * 0.28);

  let nextCurrentMastery = record.currentMastery;
  if (isCorrect) {
    nextCurrentMastery += usedReveal ? 0.035 : 0.09;
  } else if (attempt.outcome === "reveal") {
    nextCurrentMastery += 0.01;
  } else if (attempt.outcome === "skip") {
    nextCurrentMastery -= 0.015;
  } else {
    nextCurrentMastery -= 0.12;
  }
  nextCurrentMastery = clamp01(nextCurrentMastery * 0.72 + nextRecentAccuracy * 0.2 + nextLifetimeAccuracy * 0.08);

  let nextConfidence = record.confidence;
  nextConfidence += 0.025;
  nextConfidence += isCorrect && !usedReveal ? 0.045 : isCorrect ? 0.02 : -0.03;
  nextConfidence += nextExposureCount > 1 ? 0.01 : 0;
  nextConfidence = clamp01(nextConfidence);

  const nextStreak = isCorrect ? record.streak + 1 : 0;
  const nextLapses = isCorrect ? record.lapses : record.lapses + 1;
  const key = target?.conceptKey ?? record.key;
  const label = normalizeText(target?.label) || record.label || card.title || card.summary || key;
  const domain = target?.domain ?? record.domain;
  const difficulty = clampDifficulty(nextCurrentMastery);

  return {
    ...record,
    key,
    label,
    domain,
    cardKind: card.kind as DailyBlundrCardKind,
    sources: uniqueSources(record.sources, card.source),
    exposureCount: nextExposureCount,
    attemptCount: nextAttemptCount,
    attempts: nextAttemptCount,
    correctCount: nextCorrectCount,
    correct: nextCorrectCount,
    incorrectCount: nextIncorrectCount,
    incorrect: nextIncorrectCount,
    recentAccuracy: nextRecentAccuracy,
    lifetimeAccuracy: nextLifetimeAccuracy,
    avgResponseTimeMs: nextAvgResponseTimeMs,
    hintRate: nextHintRate,
    revealRate: nextRevealRate,
    currentMastery: nextCurrentMastery,
    confidence: nextConfidence,
    currentDifficulty: difficulty,
    streak: nextStreak,
    lapses: nextLapses,
    lastSeenAt: now,
    lastAttemptAt: attempt.createdAt,
    lastCorrectAt: isCorrect ? attempt.createdAt : record.lastCorrectAt,
    lastIncorrectAt: attempt.outcome === "incorrect" ? attempt.createdAt : record.lastIncorrectAt,
    updatedAt: now,
  };
}

export function createDailyBlundrMasteryState(): DailyBlundrMasteryState {
  return {
    schemaVersion: DAILY_BLUNDR_SCHEMA_VERSION,
    records: {},
    updatedAt: null,
  };
}

export function getDailyBlundrMasteryRecord(state: DailyBlundrMasteryState | null | undefined, key: string): DailyBlundrMasteryRecord | null {
  if (!state?.records) return null;
  return state.records[key] ?? null;
}

export function classifyDailyBlundrMastery(record: DailyBlundrMasteryRecord): "fresh" | "growing" | "steady" | "mastered" {
  if (record.currentMastery >= 0.85 && record.confidence >= 0.6 && record.correctCount >= 2 && record.incorrectCount <= 1) return "mastered";
  if (record.currentMastery >= 0.65) return "steady";
  if (record.currentMastery >= 0.35) return "growing";
  return "fresh";
}

export function summarizeDailyBlundrMastery(state: DailyBlundrMasteryState | null | undefined): {
  total: number;
  mastered: number;
  steady: number;
  growing: number;
  fresh: number;
} {
  const records = Object.values(state?.records ?? {});
  return records.reduce(
    (summary, record) => {
      const bucket = classifyDailyBlundrMastery(record);
      summary.total += 1;
      summary[bucket] += 1;
      return summary;
    },
    { total: 0, mastered: 0, steady: 0, growing: 0, fresh: 0 },
  );
}

export function updateDailyBlundrMasteryFromAttempt(input: {
  previousMastery: DailyBlundrMasteryState | null | undefined;
  card: DailyBlundrCard;
  attempt: DailyBlundrAttempt;
  now?: string;
}): DailyBlundrMasteryState {
  const state = input.previousMastery ?? createDailyBlundrMasteryState();
  const now = input.now ?? input.attempt.createdAt ?? nowIso();
  const nextRecords = { ...state.records };
  const targets = uniqueTargets(input.card);

  for (const target of targets) {
    const existing =
      nextRecords[target.conceptKey] ??
      createDefaultRecord(input.card, target.conceptKey === input.card.masteryKey ? input.card.masteryKey : target.conceptKey, now, target);
    nextRecords[target.conceptKey] = updateSingleRecord(existing, input.card, input.attempt, now, target);
  }

  return {
    schemaVersion: DAILY_BLUNDR_SCHEMA_VERSION,
    records: nextRecords,
    updatedAt: now,
  };
}

export function updateDailyBlundrMastery(input: {
  mastery: DailyBlundrMasteryState | null | undefined;
  card: DailyBlundrCard;
  attempt: DailyBlundrAttempt;
}): DailyBlundrMasteryState {
  return updateDailyBlundrMasteryFromAttempt({
    previousMastery: input.mastery,
    card: input.card,
    attempt: input.attempt,
  });
}
