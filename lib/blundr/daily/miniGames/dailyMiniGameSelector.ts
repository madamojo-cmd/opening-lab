import type { DailyBlundrDifficulty, DailyBlundrMasteryState } from "../dailyBlundrTypes";
import { getConceptMasteryRecord } from "../concepts/dailyConceptMastery";
import { inferConceptTagsForMiniGame } from "../concepts/dailyConceptTagging";
import type { DailyBlundrMiniGameCard, DailyMiniGameDefinition, DailyMiniGameId, DailyMiniGameSelection } from "./dailyMiniGameTypes";
import { DAILY_MINI_GAME_REGISTRY } from "./dailyMiniGameRegistry";

export type DailyMiniGameSelectionInput = {
  mastery: DailyBlundrMasteryState | null;
  dateKey: string;
  now?: string;
  dueReviewCount: number;
  selectedReviewCount: number;
  recentMiniGameIds?: readonly DailyMiniGameId[];
  recentFenKeys?: readonly string[];
  sessionMiniGameIds?: readonly DailyMiniGameId[];
  excludedMiniGameIds?: readonly DailyMiniGameId[];
};

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function parseIso(value: string | null | undefined): number {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getDifficultyIndex(difficulty: DailyBlundrDifficulty): number {
  if (difficulty === "intro") return 0;
  if (difficulty === "beginner") return 1;
  if (difficulty === "early_intermediate") return 2;
  if (difficulty === "intermediate") return 3;
  if (difficulty === "advanced") return 4;
  return 5;
}

function bumpDifficulty(difficulty: DailyBlundrDifficulty, steps = 1): DailyBlundrDifficulty {
  const index = Math.min(5, getDifficultyIndex(difficulty) + Math.max(0, steps));
  if (index <= 0) return "intro";
  if (index === 1) return "beginner";
  if (index === 2) return "early_intermediate";
  if (index === 3) return "intermediate";
  if (index === 4) return "advanced";
  return "expert";
}

function resolveMiniGameRecord(mastery: DailyBlundrMasteryState | null, definition: DailyMiniGameDefinition): {
  currentMastery: number;
  confidence: number;
  lastSeenAt: string | null;
} {
  const conceptIds = inferConceptTagsForMiniGame(definition.id, definition.skillIds);
  const records = [
    ...definition.skillIds.map((skillId) => mastery?.records[`mini:${definition.id}:${skillId}`] ?? null),
    ...conceptIds.map((conceptId) => getConceptMasteryRecord(mastery, conceptId)),
  ]
    .filter((record): record is NonNullable<typeof record> => Boolean(record));

  if (!records.length) {
    return { currentMastery: 0, confidence: 0, lastSeenAt: null };
  }

  const currentMastery = clamp01(records.reduce((sum, record) => sum + (record.currentMastery ?? 0), 0) / records.length);
  const confidence = clamp01(records.reduce((sum, record) => sum + (record.confidence ?? 0), 0) / records.length);
  const lastSeenAt = records.reduce((latest, record) => (parseIso(record.lastSeenAt) > parseIso(latest) ? record.lastSeenAt : latest), records[0]?.lastSeenAt ?? null);
  return { currentMastery, confidence, lastSeenAt };
}

function resolveDifficulty(input: {
  currentMastery: number;
  confidence: number;
  definition: DailyMiniGameDefinition;
}): DailyBlundrDifficulty {
  const mastery = input.currentMastery;
  const confidence = input.confidence;
  let difficulty: DailyBlundrDifficulty;
  if (mastery < 0.35) {
    difficulty = confidence > 0.55 ? "beginner" : "intro";
  } else if (mastery < 0.7) {
    difficulty = confidence > 0.6 ? "early_intermediate" : "beginner";
  } else if (mastery < 0.82) {
    difficulty = confidence > 0.6 ? "intermediate" : "early_intermediate";
  } else if (confidence > 0.6) {
    difficulty = "advanced";
  } else {
    difficulty = "intermediate";
  }

  if (mastery > 0.8 && confidence > 0.6) {
    difficulty = bumpDifficulty(difficulty, 1);
  }

  if (!input.definition.recommendedFor.includes(difficulty)) {
    const candidates = input.definition.recommendedFor;
    difficulty = candidates[Math.max(0, candidates.length - 1)] ?? difficulty;
  }

  return difficulty;
}

function scoreDefinition(input: {
  definition: DailyMiniGameDefinition;
  currentMastery: number;
  confidence: number;
  lastSeenAt: string | null;
  dueReviewCount: number;
  selectedReviewCount: number;
  recentMiniGameIds: readonly DailyMiniGameId[];
  excludedMiniGameIds: readonly DailyMiniGameId[];
  sessionMiniGameIds: readonly DailyMiniGameId[];
  now: string;
}): number {
  const {
    definition,
    currentMastery,
    confidence,
    lastSeenAt,
    recentMiniGameIds,
    excludedMiniGameIds,
    sessionMiniGameIds,
    now,
  } = input;

  if (excludedMiniGameIds.includes(definition.id)) return Number.NEGATIVE_INFINITY;
  if (sessionMiniGameIds.includes(definition.id)) return Number.NEGATIVE_INFINITY;

  const recentSessionPenalty = recentMiniGameIds.includes(definition.id) ? -80 : 0;
  const masteryNeed = (1 - currentMastery) * 100;
  const confidenceNeed = (1 - confidence) * 24;
  const recencyDays = lastSeenAt ? Math.max(0, (Date.parse(now) - parseIso(lastSeenAt)) / 86_400_000) : 14;
  const recencyBoost = lastSeenAt ? Math.max(0, 12 - recencyDays * 1.4) : 10;
  const difficultyPenalty = currentMastery > 0.8 && confidence > 0.6 ? 12 : 0;

  return masteryNeed + confidenceNeed + recencyBoost + recentSessionPenalty + difficultyPenalty;
}

function isRecentFen(candidate: DailyBlundrMiniGameCard, recentFenKeys: readonly string[]): boolean {
  const keys = new Set([
    normalizeText(candidate.fen),
    normalizeText(candidate.positionKey),
    normalizeText(candidate.miniGame.formationHash),
    normalizeText(candidate.miniGame.noveltyKey),
  ]);
  return recentFenKeys.some((key) => keys.has(normalizeText(key)));
}

export function selectDailyMiniGame(input: DailyMiniGameSelectionInput): DailyMiniGameSelection | null {
  const now = normalizeText(input.now) || new Date().toISOString();
  const recentMiniGameIds = input.recentMiniGameIds ?? [];
  const excludedMiniGameIds = input.excludedMiniGameIds ?? [];
  const sessionMiniGameIds = input.sessionMiniGameIds ?? [];
  const candidates = DAILY_MINI_GAME_REGISTRY
    .map((definition) => {
      const mastery = resolveMiniGameRecord(input.mastery, definition);
      const difficulty = resolveDifficulty({
        currentMastery: mastery.currentMastery,
        confidence: mastery.confidence,
        definition,
      });
      const score = scoreDefinition({
        definition,
        currentMastery: mastery.currentMastery,
        confidence: mastery.confidence,
        lastSeenAt: mastery.lastSeenAt,
        dueReviewCount: input.dueReviewCount,
        selectedReviewCount: input.selectedReviewCount,
        recentMiniGameIds,
        excludedMiniGameIds,
        sessionMiniGameIds,
        now,
      });
      return {
        definition,
        mastery,
        difficulty,
        score,
      };
    })
    .sort((a, b) => b.score - a.score || a.definition.id.localeCompare(b.definition.id));

  for (const candidate of candidates) {
    if (!Number.isFinite(candidate.score) || candidate.score === Number.NEGATIVE_INFINITY) continue;
    const card = candidate.definition.generate({
      dateKey: input.dateKey,
      now,
      mastery: input.mastery,
      difficulty: candidate.difficulty,
      currentMastery: candidate.mastery.currentMastery,
      confidence: candidate.mastery.confidence,
      dueReviewCount: input.dueReviewCount,
      selectedReviewCount: input.selectedReviewCount,
      recentMiniGameIds,
      recentFenKeys: input.recentFenKeys ?? [],
      sessionMiniGameIds,
    });
    if (!card) continue;
    if (isRecentFen(card, input.recentFenKeys ?? [])) continue;
    return {
      definition: candidate.definition,
      card,
      currentMastery: candidate.mastery.currentMastery,
      confidence: candidate.mastery.confidence,
      difficulty: candidate.difficulty,
      reason: candidate.mastery.currentMastery < 0.35 ? "intro" : candidate.mastery.currentMastery > 0.8 && candidate.mastery.confidence > 0.6 ? "advanced" : "varied",
    };
  }

  return null;
}
