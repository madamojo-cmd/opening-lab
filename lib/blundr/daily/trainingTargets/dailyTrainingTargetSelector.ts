import type { DailyBlundrCard, DailyBlundrMasteryState } from "../dailyBlundrTypes";
import type { DailyBlundrReviewAttempt } from "../dailyBlundrReviewTypes";
import type { DailyTrainingTargetDefinition, DailyTrainingTargetGenerationContext, DailyTrainingTargetSelection } from "./dailyTrainingTargetTypes";
import { DAILY_TRAINING_TARGET_REGISTRY } from "./dailyTrainingTargetRegistry";
import { chooseTrainingTargetDifficulty, clamp01, normalizeText, pickDailyBlundrCard, isPawnMove } from "./trainingTargetUtils";
import { getConceptMasteryRecord } from "../concepts/dailyConceptMastery";
import { inferConceptTagsForTrainingTarget } from "../concepts/dailyConceptTagging";

function parseIso(value: string | null | undefined): number {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeDifficultyRank(difficulty: DailyTrainingTargetDefinition["recommendedFor"][number]): number {
  if (difficulty === "intro") return 0;
  if (difficulty === "beginner") return 1;
  if (difficulty === "early_intermediate") return 2;
  if (difficulty === "intermediate") return 3;
  if (difficulty === "advanced") return 4;
  return 5;
}

function resolveMasterySnapshot(definition: DailyTrainingTargetDefinition, mastery: DailyBlundrMasteryState | null | undefined): {
  currentMastery: number;
  confidence: number;
  lastSeenAt: string | null;
} {
  const conceptIds = inferConceptTagsForTrainingTarget(definition.id, definition.skillIds);
  const records = [
    ...definition.skillIds.map((skillId) => mastery?.records[`target:${definition.id}:${skillId}`] ?? null),
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

function hasRecentFailure(reviewAttempts: readonly DailyBlundrReviewAttempt[] | null | undefined): boolean {
  return Boolean(reviewAttempts?.some((attempt) => attempt.grade === "AGAIN" || attempt.grade === "HARD" || attempt.usedReveal));
}

function countCandidateCards(cards: readonly DailyBlundrCard[], predicate: (card: DailyBlundrCard) => boolean): number {
  return cards.reduce((count, card) => count + (predicate(card) ? 1 : 0), 0);
}

function scoreDefinition(input: {
  definition: DailyTrainingTargetDefinition;
  currentMastery: number;
  confidence: number;
  lastSeenAt: string | null;
  dueReviewCount: number;
  selectedReviewCount: number;
  candidateDailyCards: readonly DailyBlundrCard[];
  reviewAttempts: readonly DailyBlundrReviewAttempt[];
  now: string;
}): number {
  const masteryNeed = (1 - input.currentMastery) * 100;
  const confidenceNeed = (1 - input.confidence) * 18;
  const duePressure = input.dueReviewCount === 0 ? 14 : input.dueReviewCount <= 2 ? 8 : 0;
  const selectedPressure = input.selectedReviewCount <= 3 ? 8 : 3;
  const recentFailureBoost = hasRecentFailure(input.reviewAttempts) ? 6 : 0;
  const recencyDays = input.lastSeenAt ? Math.max(0, (Date.parse(input.now) - parseIso(input.lastSeenAt)) / 86_400_000) : 14;
  const recencyBoost = input.lastSeenAt ? Math.max(0, 14 - recencyDays * 1.3) : 10;

  const candidateDailyCards = input.candidateDailyCards;
  const replyCardCount = countCandidateCards(candidateDailyCards, (card) => Boolean(card.expectedMoveUci));
  const openingCardCount = countCandidateCards(candidateDailyCards, (card) => Boolean(card.openingName || card.openingId));
  const pawnMoveCount = countCandidateCards(candidateDailyCards, (card) => Boolean(card.expectedMoveUci && isPawnMove(card.fen, card.expectedMoveUci!)));
  const progressMistakeCount = countCandidateCards(candidateDailyCards, (card) => card.source === "progress_mistake");

  let fitScore = 0;
  switch (input.definition.id) {
    case "reply_radar":
      fitScore = replyCardCount * 8 + progressMistakeCount * 3;
      break;
    case "opening_branch_builder":
      fitScore = openingCardCount * 8 + replyCardCount * 2;
      break;
    case "opponent_reply_trainer":
      fitScore = replyCardCount * 9 + progressMistakeCount * 4;
      break;
    case "break_timing_drill":
      fitScore = pawnMoveCount * 12 + progressMistakeCount * 4;
      break;
    case "key_square_click":
      fitScore = 12 + Math.max(0, 4 - input.dueReviewCount) * 2;
      break;
  }

  const masteryPenalty = input.currentMastery > 0.85 && input.confidence > 0.6 ? 8 : 0;
  return masteryNeed + confidenceNeed + duePressure + selectedPressure + recentFailureBoost + recencyBoost + fitScore - masteryPenalty;
}

function buildGenerationContext(
  input: DailyTrainingTargetGenerationContext,
  definition: DailyTrainingTargetDefinition,
  currentMastery: number,
  confidence: number,
): DailyTrainingTargetGenerationContext {
  return {
    ...input,
    difficulty: chooseTrainingTargetDifficulty(currentMastery, confidence, definition.recommendedFor[0] ?? "beginner"),
    currentMastery,
    confidence,
  };
}

function hasRecentNoveltyConflict(card: DailyBlundrCard, recentFenKeys: readonly string[]): boolean {
  const candidateKeys = new Set([
    normalizeText(card.fen),
    normalizeText(card.positionKey),
    normalizeText(card.masteryKey),
    normalizeText(card.trainingTarget?.formationHash),
    normalizeText(card.trainingTarget?.noveltyKey),
  ]);
  return recentFenKeys.some((key) => candidateKeys.has(normalizeText(key)));
}

export function selectDailyTrainingTarget(input: DailyTrainingTargetGenerationContext): DailyTrainingTargetSelection | null {
  const now = normalizeText(input.now) || new Date().toISOString();
  const excludedIds = new Set<string>([...(input.recentTrainingTargetIds ?? []), ...(input.sessionTrainingTargetIds ?? [])]);

  const ranked = DAILY_TRAINING_TARGET_REGISTRY
    .map((definition) => {
      const mastery = resolveMasterySnapshot(definition, input.mastery);
      const difficulty = chooseTrainingTargetDifficulty(mastery.currentMastery, mastery.confidence, definition.recommendedFor[0] ?? "beginner");
      const generationContext = buildGenerationContext(input, definition, mastery.currentMastery, mastery.confidence);
      const score = scoreDefinition({
        definition,
        currentMastery: mastery.currentMastery,
        confidence: mastery.confidence,
        lastSeenAt: mastery.lastSeenAt,
        dueReviewCount: input.dueReviewCount,
        selectedReviewCount: input.selectedReviewCount,
        candidateDailyCards: input.candidateDailyCards,
        reviewAttempts: input.reviewAttempts,
        now,
      });
      return {
        definition,
        mastery,
        difficulty,
        generationContext,
        score,
      };
    })
    .filter((entry) => !excludedIds.has(entry.definition.id))
    .sort((a, b) => b.score - a.score || a.definition.id.localeCompare(b.definition.id));

  for (const candidate of ranked) {
    const card = candidate.definition.generate(candidate.generationContext);
    if (!card) continue;
    if (hasRecentNoveltyConflict(card, input.recentFenKeys ?? [])) continue;
    return {
      definition: candidate.definition,
      card,
      currentMastery: candidate.mastery.currentMastery,
      confidence: candidate.mastery.confidence,
      difficulty: candidate.difficulty,
      reason:
        candidate.mastery.currentMastery < 0.35
          ? "intro"
          : candidate.mastery.currentMastery > 0.8 && candidate.mastery.confidence > 0.6
            ? "advanced"
            : input.dueReviewCount === 0
              ? "queue_clear"
              : "varied",
    };
  }

  return null;
}
