import { buildDailyBlundrDeck } from "../dailyBlundrDeckBuilder";
import { getAllDailyConcepts, assertDailyConceptRegistryIsValid } from "../concepts/dailyConceptRegistry";
import type { DailyBlundrMasteryState } from "../dailyBlundrTypes";
import { DAILY_MINI_GAME_REGISTRY } from "../miniGames/dailyMiniGameRegistry";
import type { DailyMiniGameGenerationContext } from "../miniGames/dailyMiniGameTypes";
import { DAILY_TRAINING_TARGET_REGISTRY } from "../trainingTargets/dailyTrainingTargetRegistry";
import type { DailyTrainingTargetGenerationContext } from "../trainingTargets/dailyTrainingTargetTypes";
import { buildDailyCoverageReport } from "./dailyCoverageReport";
import type { DailyCoverageReport, DailyValidationContentItem } from "./dailyValidationTypes";
import { validateConceptRegistry } from "./dailyConceptValidation";
import { validateDailyCards } from "./dailyCardValidation";
import { validateDifficultyDistribution } from "./dailyDifficultyCoverage";
import { validateMiniGameRegistry, validateGeneratedMiniGames } from "./dailyMiniGameValidation";
import { validateNoveltyKeys } from "./dailyNoveltyValidation";
import { validateTrainingTargetRegistry, validateGeneratedTrainingTargets } from "./dailyTrainingTargetValidation";
import type { ValidationSnapshot } from "../../accounts/accountTypes";

export type DailyBlundrValidationInput = {
  dateKey?: string;
  now?: string;
  mastery?: DailyBlundrMasteryState | null;
};

function createDefaultDateKey(): string {
  return "2026-07-02";
}

function createDefaultNow(): string {
  return "2026-07-02T12:00:00.000Z";
}

function buildMiniGameContext(input: DailyBlundrValidationInput): DailyMiniGameGenerationContext {
  const dateKey = input.dateKey ?? createDefaultDateKey();
  const now = input.now ?? createDefaultNow();
  return {
    dateKey,
    now,
    mastery: input.mastery ?? null,
    difficulty: "beginner",
    currentMastery: 0.2,
    confidence: 0.2,
    dueReviewCount: 0,
    selectedReviewCount: 0,
    recentMiniGameIds: [],
    recentFenKeys: [],
    sessionMiniGameIds: [],
  };
}

function buildTrainingTargetContext(input: DailyBlundrValidationInput): DailyTrainingTargetGenerationContext {
  const dateKey = input.dateKey ?? createDefaultDateKey();
  const now = input.now ?? createDefaultNow();
  return {
    dateKey,
    now,
    mastery: input.mastery ?? null,
    difficulty: "beginner",
    currentMastery: 0.2,
    confidence: 0.2,
    dueReviewCount: 0,
    selectedReviewCount: 0,
    reviewCards: [],
    reviewAttempts: [],
    candidateDailyCards: [],
    recentTrainingTargetIds: [],
    recentFenKeys: [],
    sessionTrainingTargetIds: [],
  };
}

function buildSampleDeckItems(input: DailyBlundrValidationInput): DailyValidationContentItem[] {
  const deck = buildDailyBlundrDeck({
    progress: null,
    learningEvents: [],
    mastery: input.mastery ?? null,
    reviewCards: [],
    reviewAttempts: [],
    dateKey: input.dateKey ?? createDefaultDateKey(),
    now: input.now ?? createDefaultNow(),
    limit: 5,
  });
  return deck.cards.map((card) => ({
    id: card.id,
    kind: card.kind,
    difficulty: card.difficulty,
    conceptIds: card.conceptIds ?? null,
    primaryConceptId: card.primaryConceptId ?? null,
    conceptMasteryKeys: card.conceptMasteryKeys ?? null,
    noveltyKey: card.kind === "mini_game" ? card.miniGame?.noveltyKey ?? null : card.kind === "training_target" ? card.trainingTarget?.noveltyKey ?? null : null,
    formationHash: card.kind === "mini_game" ? card.miniGame?.formationHash ?? null : card.kind === "training_target" ? card.trainingTarget?.formationHash ?? null : null,
    fen: card.fen,
    source: card.source,
    currentMastery: null,
    masteryConfidence: null,
  }));
}

function buildRegistryIssues(input: DailyBlundrValidationInput) {
  const miniGameContext = buildMiniGameContext(input);
  const trainingTargetContext = buildTrainingTargetContext(input);
  return [
    ...validateConceptRegistry().issues,
    ...validateMiniGameRegistry().issues,
    ...validateTrainingTargetRegistry().issues,
    ...validateGeneratedMiniGames(miniGameContext).issues,
    ...validateGeneratedTrainingTargets(trainingTargetContext).issues,
  ];
}

export function runDailyBlundrRegistryValidation(input: DailyBlundrValidationInput = {}): DailyCoverageReport {
  const items: DailyValidationContentItem[] = [];
  const issues = buildRegistryIssues(input);
  return buildDailyCoverageReport({
    generatedAt: input.now ?? createDefaultNow(),
    items,
    issues,
  });
}

export function runDailyBlundrGeneratedContentValidation(input: DailyBlundrValidationInput = {}): DailyCoverageReport {
  const items = buildSampleDeckItems(input);
  const deck = buildDailyBlundrDeck({
    progress: null,
    learningEvents: [],
    mastery: input.mastery ?? null,
    reviewCards: [],
    reviewAttempts: [],
    dateKey: input.dateKey ?? createDefaultDateKey(),
    now: input.now ?? createDefaultNow(),
    limit: 5,
  });
  const issues = [
    ...buildRegistryIssues(input),
    ...validateDailyCards(deck.cards).issues,
    ...validateNoveltyKeys(items).issues,
    ...validateDifficultyDistribution(items).issues,
  ];
  return buildDailyCoverageReport({
    generatedAt: input.now ?? createDefaultNow(),
    items,
    issues,
  });
}

export function runDailyBlundrValidation(input: DailyBlundrValidationInput = {}): DailyCoverageReport {
  return runDailyBlundrGeneratedContentValidation(input);
}

export function assertDailyBlundrValidationIsValid(report: DailyCoverageReport): void {
  assertDailyConceptRegistryIsValid();
  if (!report.valid) {
    throw new Error(`Daily BLUNDR validation failed with ${report.summary.errorCount} error(s).`);
  }
}

export function getDailyBlundrValidationConceptCount(): number {
  return getAllDailyConcepts().length;
}

export function getDailyBlundrValidationMiniGameCount(): number {
  return DAILY_MINI_GAME_REGISTRY.length;
}

export function getDailyBlundrValidationTrainingTargetCount(): number {
  return DAILY_TRAINING_TARGET_REGISTRY.length;
}

export function createDailyBlundrValidationSnapshot(report: DailyCoverageReport, userId?: string): ValidationSnapshot {
  const generatedAt = report.generatedAt || new Date().toISOString();
  return {
    id: `${userId ?? "daily"}:validation:${generatedAt}`,
    userId,
    generatedAt,
    valid: Boolean(report.valid),
    issueCount: report.summary.issueCount,
    errorCount: report.summary.errorCount,
    warningCount: report.summary.warningCount,
    reportJson: report,
  };
}
