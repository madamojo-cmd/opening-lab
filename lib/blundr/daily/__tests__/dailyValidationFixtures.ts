import { Chess } from "chess.js";

import { buildDailyBlundrDeck } from "../dailyBlundrDeckBuilder";
import { DAILY_MINI_GAME_REGISTRY } from "../miniGames/dailyMiniGameRegistry";
import { DAILY_TRAINING_TARGET_REGISTRY } from "../trainingTargets/dailyTrainingTargetRegistry";
import type { DailyBlundrCard, DailyBlundrMasteryState } from "../dailyBlundrTypes";
import type { DailyMiniGameGenerationContext, DailyBlundrMiniGameCard } from "../miniGames/dailyMiniGameTypes";
import type { DailyTrainingTargetGenerationContext, DailyBlundrTrainingTargetCard } from "../trainingTargets/dailyTrainingTargetTypes";

export const VALIDATION_DATE_KEY = "2026-07-02";
export const VALIDATION_NOW = "2026-07-02T12:00:00.000Z";

export function makeEmptyMasteryState(): DailyBlundrMasteryState {
  return {
    schemaVersion: 1,
    updatedAt: VALIDATION_NOW,
    records: {},
  };
}

export function makeMiniGameContext(overrides: Partial<DailyMiniGameGenerationContext> = {}): DailyMiniGameGenerationContext {
  return {
    dateKey: VALIDATION_DATE_KEY,
    now: VALIDATION_NOW,
    mastery: overrides.mastery ?? null,
    difficulty: overrides.difficulty ?? "beginner",
    currentMastery: overrides.currentMastery ?? 0.2,
    confidence: overrides.confidence ?? 0.2,
    dueReviewCount: overrides.dueReviewCount ?? 0,
    selectedReviewCount: overrides.selectedReviewCount ?? 0,
    recentMiniGameIds: overrides.recentMiniGameIds ?? [],
    recentFenKeys: overrides.recentFenKeys ?? [],
    sessionMiniGameIds: overrides.sessionMiniGameIds ?? [],
    source: overrides.source ?? "daily_deck",
    seed: overrides.seed ?? null,
    userIdOrLocalId: overrides.userIdOrLocalId ?? "local",
    recentScenarioKeys: overrides.recentScenarioKeys ?? [],
    boardPreferences: overrides.boardPreferences ?? null,
    deckId: overrides.deckId ?? null,
    miniGameId: overrides.miniGameId ?? null,
  };
}

export function makeTrainingTargetContext(overrides: Partial<DailyTrainingTargetGenerationContext> = {}): DailyTrainingTargetGenerationContext {
  return {
    dateKey: VALIDATION_DATE_KEY,
    now: VALIDATION_NOW,
    mastery: overrides.mastery ?? null,
    difficulty: overrides.difficulty ?? "beginner",
    currentMastery: overrides.currentMastery ?? 0.2,
    confidence: overrides.confidence ?? 0.2,
    dueReviewCount: overrides.dueReviewCount ?? 0,
    selectedReviewCount: overrides.selectedReviewCount ?? 0,
    reviewCards: overrides.reviewCards ?? [],
    reviewAttempts: overrides.reviewAttempts ?? [],
    candidateDailyCards: overrides.candidateDailyCards ?? [],
    recentTrainingTargetIds: overrides.recentTrainingTargetIds ?? [],
    recentFenKeys: overrides.recentFenKeys ?? [],
    sessionTrainingTargetIds: overrides.sessionTrainingTargetIds ?? [],
  };
}

export function makeSampleDeck(): ReturnType<typeof buildDailyBlundrDeck> {
  return buildDailyBlundrDeck({
    progress: null,
    learningEvents: [],
    mastery: null,
    reviewCards: [],
    reviewAttempts: [],
    dateKey: VALIDATION_DATE_KEY,
    now: VALIDATION_NOW,
    limit: 5,
  });
}

export function makeSampleDeckCards(): DailyBlundrCard[] {
  return makeSampleDeck().cards;
}

export function makeValidRecallCard(): DailyBlundrCard {
  const fen = new Chess().fen();
  return {
    source: "daily_attempt",
    cardKey: "recall:validation:test",
    positionKey: "recall:validation:test",
    fen,
    expectedMoveUci: "e2e4",
    expectedMoveSan: "e4",
    playedMoveUci: null,
    playedMoveSan: null,
    openingId: "validation-opening",
    openingName: "Validation Opening",
    patternId: "validation-pattern",
    concept: "development",
    count: 1,
    weight: 1,
    lastSeenAt: VALIDATION_NOW,
    note: "Validation recall card",
    signals: ["recall", "validation"],
    masteryTargets: [
      { conceptKey: "target:validation:development", domain: "daily_recall", label: "Development", difficultyHint: "beginner" },
    ],
    confidence: "medium",
    difficulty: "beginner",
    id: "recall:validation:test",
    kind: "recall",
    title: "Validation Recall",
    prompt: "Recall the move.",
    repertoireId: null,
    reviewCardId: null,
    reviewDedupeKey: null,
    reviewPromptKind: "target_move_recall",
    reviewStatus: "new",
    reviewDueAt: null,
    deckRank: 1,
    priority: 10,
    masteryKey: "recall:validation:test",
    sourceCount: 1,
    summary: "Validation recall card",
    conceptIds: ["concept:tactical_ideas:fork"],
    primaryConceptId: "concept:tactical_ideas:fork",
    conceptMasteryKeys: ["concept:tactical_ideas:fork:mastery"],
  };
}

export function makeValidMiniGameCards(): DailyBlundrMiniGameCard[] {
  return DAILY_MINI_GAME_REGISTRY.map((definition) => definition.generate(makeMiniGameContext())!).filter((card): card is DailyBlundrMiniGameCard => Boolean(card));
}

export function makeValidTrainingTargetCards(): DailyBlundrTrainingTargetCard[] {
  return DAILY_TRAINING_TARGET_REGISTRY.map((definition) => definition.generate(makeTrainingTargetContext())!).filter((card): card is DailyBlundrTrainingTargetCard => Boolean(card));
}
