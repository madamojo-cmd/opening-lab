import type { DailyBlundrMasteryRecord, DailyBlundrMasteryState } from "../dailyBlundrTypes";
import { getDailyConceptById } from "./dailyConceptRegistry";
import { getRecommendedConceptDifficulty } from "./dailyConceptDifficulty";
import { makeConceptMasteryKey, normalizeConceptId } from "./dailyConceptTagging";
import type { DailyConceptDefinition, DailyConceptDifficulty, DailyConceptId } from "./dailyConceptTypes";

export type DailyConceptMasterySummary = {
  conceptIds: DailyConceptId[];
  recordCount: number;
  missingCount: number;
  exposureCount: number;
  attemptCount: number;
  currentMastery: number;
  confidence: number;
  recentAccuracy: number;
  hintRate: number;
  revealRate: number;
  lapses: number;
};

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function resolveUnknownMastery(): DailyBlundrMasteryRecord {
  return {
    key: "",
    label: "Unknown concept",
    domain: "daily_recall",
    cardKind: "recall",
    sources: [],
    exposureCount: 0,
    attemptCount: 0,
    attempts: 0,
    correctCount: 0,
    correct: 0,
    incorrectCount: 0,
    incorrect: 0,
    recentAccuracy: 0.15,
    lifetimeAccuracy: 0.15,
    avgResponseTimeMs: null,
    hintRate: 0.25,
    revealRate: 0.25,
    currentMastery: 0.15,
    confidence: 0.15,
    currentDifficulty: "intro",
    streak: 0,
    lapses: 0,
    firstSeenAt: null,
    lastSeenAt: null,
    lastAttemptAt: null,
    lastCorrectAt: null,
    lastIncorrectAt: null,
    updatedAt: null,
  };
}

function scoreRecord(record: DailyBlundrMasteryRecord | null | undefined): number {
  const fallback = resolveUnknownMastery();
  const actual = record ?? fallback;
  return clamp01(actual.currentMastery * 0.65 + actual.confidence * 0.2 + actual.recentAccuracy * 0.1 - actual.lapses * 0.04);
}

function getConceptRecordCandidates(mastery: DailyBlundrMasteryState | null | undefined, conceptId: string): DailyBlundrMasteryRecord[] {
  const normalized = normalizeConceptId(conceptId);
  if (!normalized) return [];
  const keys = [makeConceptMasteryKey(normalized), normalized];
  return keys.map((key) => mastery?.records[key] ?? null).filter((record): record is DailyBlundrMasteryRecord => Boolean(record));
}

export function getConceptMasteryRecord(mastery: DailyBlundrMasteryState | null | undefined, conceptId: string): DailyBlundrMasteryRecord | null {
  return getConceptRecordCandidates(mastery, conceptId)[0] ?? null;
}

export function summarizeConceptMastery(mastery: DailyBlundrMasteryState | null | undefined, conceptIds: readonly DailyConceptId[]): DailyConceptMasterySummary {
  const normalizedConceptIds = Array.from(new Set(conceptIds.map((conceptId) => normalizeConceptId(conceptId)).filter((value): value is DailyConceptId => Boolean(value))));
  const records = normalizedConceptIds.map((conceptId) => getConceptMasteryRecord(mastery, conceptId));
  const resolvedRecords = records.length > 0 ? records.map((record) => record ?? resolveUnknownMastery()) : [resolveUnknownMastery()];

  const totals = resolvedRecords.reduce(
    (summary, record) => {
      summary.exposureCount += record.exposureCount;
      summary.attemptCount += record.attemptCount;
      summary.currentMastery += record.currentMastery;
      summary.confidence += record.confidence;
      summary.recentAccuracy += record.recentAccuracy;
      summary.hintRate += record.hintRate;
      summary.revealRate += record.revealRate;
      summary.lapses += record.lapses;
      return summary;
    },
    {
      exposureCount: 0,
      attemptCount: 0,
      currentMastery: 0,
      confidence: 0,
      recentAccuracy: 0,
      hintRate: 0,
      revealRate: 0,
      lapses: 0,
    },
  );

  const count = Math.max(1, resolvedRecords.length);
  return {
    conceptIds: normalizedConceptIds,
    recordCount: records.filter(Boolean).length,
    missingCount: records.length - records.filter(Boolean).length,
    exposureCount: totals.exposureCount,
    attemptCount: totals.attemptCount,
    currentMastery: clamp01(totals.currentMastery / count),
    confidence: clamp01(totals.confidence / count),
    recentAccuracy: clamp01(totals.recentAccuracy / count),
    hintRate: clamp01(totals.hintRate / count),
    revealRate: clamp01(totals.revealRate / count),
    lapses: totals.lapses,
  };
}

function resolveConceptStrength(mastery: DailyBlundrMasteryState | null | undefined, concept: DailyConceptDefinition): number {
  const summary = summarizeConceptMastery(mastery, [concept.id]);
  const difficultyBias = concept.recommendedDifficulty.includes("intro") ? 0.02 : concept.recommendedDifficulty.includes("beginner") ? 0.01 : 0;
  return scoreRecord({
    ...resolveUnknownMastery(),
    currentMastery: summary.currentMastery,
    confidence: summary.confidence,
    recentAccuracy: summary.recentAccuracy,
    exposureCount: summary.exposureCount,
    attemptCount: summary.attemptCount,
    lapses: summary.lapses,
    key: concept.masteryKey,
    label: concept.displayName,
    domain: concept.domain,
    cardKind: "recall",
    currentDifficulty: concept.recommendedDifficulty[0] ?? "beginner",
  }) + difficultyBias;
}

export function rankWeakConcepts(mastery: DailyBlundrMasteryState | null | undefined, concepts: readonly DailyConceptDefinition[], limit = 5): DailyConceptDefinition[] {
  return [...concepts]
    .sort((a, b) => {
      const scoreA = resolveConceptStrength(mastery, a);
      const scoreB = resolveConceptStrength(mastery, b);
      return scoreA - scoreB || a.displayName.localeCompare(b.displayName);
    })
    .slice(0, Math.max(0, limit));
}

export function rankStrongConcepts(mastery: DailyBlundrMasteryState | null | undefined, concepts: readonly DailyConceptDefinition[], limit = 5): DailyConceptDefinition[] {
  return [...concepts]
    .sort((a, b) => {
      const scoreA = resolveConceptStrength(mastery, a);
      const scoreB = resolveConceptStrength(mastery, b);
      return scoreB - scoreA || a.displayName.localeCompare(b.displayName);
    })
    .slice(0, Math.max(0, limit));
}

export function selectConceptDifficulty(mastery: DailyBlundrMasteryState | null | undefined, conceptId: string): DailyConceptDifficulty {
  const normalized = normalizeConceptId(conceptId);
  if (!normalized) return "beginner";
  const concept = getDailyConceptById(normalized);
  if (!concept) return "beginner";
  const record = getConceptMasteryRecord(mastery, normalized);
  return getRecommendedConceptDifficulty(concept, record);
}
