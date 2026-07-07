import { reconcileDailyBlundrSession } from "../dailyBlundrStorage";
import { selectDailyMiniGame } from "./dailyMiniGameSelector";
import { DAILY_MINI_GAME_REGISTRY } from "./dailyMiniGameRegistry";
import type { DailyBlundrMasteryState, DailyBlundrDifficulty } from "../dailyBlundrTypes";
import { validateMiniGameCard, validateMiniGameDefinition, validateMiniGameState } from "../validation/dailyMiniGameValidation";
import type { DailyMiniGameGenerationContext, DailyMiniGameId } from "./dailyMiniGameTypes";

export type DailyMiniGameHealthEntry = {
  miniGameId: DailyMiniGameId;
  title: string;
  displayName: string;
  shortDescription: string | null;
  skillIds: string[];
  recommendedFor: DailyBlundrDifficulty[];
  selectable: boolean;
  canAppearInDailyBlundr: boolean;
  canAppearInStandalonePractice: boolean;
  generated: boolean;
  sessionCardCount: number;
  errors: string[];
};

export type DailyMiniGameRegistryEntry = {
  miniGameId: DailyMiniGameId;
  title: string;
  displayName: string;
  shortDescription: string | null;
  skillIds: string[];
  recommendedFor: DailyBlundrDifficulty[];
  canAppearInDailyBlundr: boolean;
  canAppearInStandalonePractice: boolean;
};

export type DailyMiniGameHealthReport = {
  generatedAt: string;
  registeredCount: number;
  registeredIds: DailyMiniGameId[];
  registeredMiniGames: DailyMiniGameRegistryEntry[];
  selectableIds: DailyMiniGameId[];
  standalonePracticeIds: DailyMiniGameId[];
  deckInsertionViability: DailyMiniGameHealthEntry[];
  errors: string[];
};

function nowIso(): string {
  return new Date().toISOString();
}

function buildDefaultContext(dateKey: string, now: string, mastery: DailyBlundrMasteryState | null, difficulty: DailyBlundrDifficulty): DailyMiniGameGenerationContext {
  return {
    dateKey,
    now,
    mastery,
    difficulty,
    currentMastery: 0.2,
    confidence: 0.2,
    dueReviewCount: 0,
    selectedReviewCount: 0,
    recentMiniGameIds: [],
    recentFenKeys: [],
    sessionMiniGameIds: [],
  };
}

function buildExcludedIds(miniGameId: DailyMiniGameId): DailyMiniGameId[] {
  return DAILY_MINI_GAME_REGISTRY.map((definition) => definition.id).filter((id) => id !== miniGameId) as DailyMiniGameId[];
}

export function buildDailyMiniGameHealthReport(input: {
  dateKey?: string;
  now?: string;
  mastery?: DailyBlundrMasteryState | null;
} = {}): DailyMiniGameHealthReport {
  const generatedAt = input.now ?? nowIso();
  const dateKey = input.dateKey ?? generatedAt.slice(0, 10);
  const mastery = input.mastery ?? null;
  const errors: string[] = [];
  const registeredIds = DAILY_MINI_GAME_REGISTRY.map((definition) => definition.id);
  const registeredMiniGames: DailyMiniGameRegistryEntry[] = DAILY_MINI_GAME_REGISTRY.map((definition) => ({
    miniGameId: definition.id,
    title: definition.title,
    displayName: definition.displayName ?? definition.title,
    shortDescription: definition.shortDescription ?? null,
    skillIds: [...definition.skillIds],
    recommendedFor: [...definition.recommendedFor],
    canAppearInDailyBlundr: definition.canAppearInDailyBlundr !== false,
    canAppearInStandalonePractice: definition.canAppearInStandalonePractice !== false,
  }));
  const selectableIds: DailyMiniGameId[] = [];
  const standalonePracticeIds: DailyMiniGameId[] = [];
  const deckInsertionViability: DailyMiniGameHealthEntry[] = [];

  for (const definition of DAILY_MINI_GAME_REGISTRY) {
    const definitionIssues = validateMiniGameDefinition(definition).issues;
    const context = buildDefaultContext(dateKey, generatedAt, mastery, definition.recommendedFor[0] ?? "beginner");
    const generatedCard = definition.generate(context);
    const cardIssues = generatedCard ? validateMiniGameCard(generatedCard).issues : [];
    const stateIssues = generatedCard ? validateMiniGameState(generatedCard.miniGame).issues : [];
    const selection = selectDailyMiniGame({
      mastery,
      dateKey,
      now: generatedAt,
      dueReviewCount: 0,
      selectedReviewCount: 0,
      recentMiniGameIds: [],
      recentFenKeys: [],
      sessionMiniGameIds: [],
      excludedMiniGameIds: buildExcludedIds(definition.id),
    });
    const selectable = Boolean(selection && selection.definition.id === definition.id);
    const session = generatedCard ? reconcileDailyBlundrSession({ dateKey, deck: [generatedCard], existing: null }) : null;
    const canInsert = Boolean(generatedCard && session && session.cards.length === 1 && session.cardOrder.length === 1 && session.cardOrder[0] === generatedCard.id);
    const entryErrors = [
      ...definitionIssues.map((issue) => `${definition.id}:definition:${issue.code}`),
      ...cardIssues.map((issue) => `${definition.id}:card:${issue.code}`),
      ...stateIssues.map((issue) => `${definition.id}:state:${issue.code}`),
      ...(generatedCard ? [] : [`${definition.id}:generate:null_card`]),
      ...(selectable ? [] : [`${definition.id}:selectable:false`]),
      ...(canInsert ? [] : [`${definition.id}:deck_insertion:false`]),
    ];

    if (entryErrors.length) {
      errors.push(...entryErrors);
    } else {
      selectableIds.push(definition.id);
    }
    if (definition.canAppearInStandalonePractice !== false) {
      standalonePracticeIds.push(definition.id);
    }

    deckInsertionViability.push({
      miniGameId: definition.id,
      title: definition.title,
      displayName: definition.displayName ?? definition.title,
      shortDescription: definition.shortDescription ?? null,
      skillIds: [...definition.skillIds],
      recommendedFor: [...definition.recommendedFor],
      selectable,
      canAppearInDailyBlundr: definition.canAppearInDailyBlundr !== false,
      canAppearInStandalonePractice: definition.canAppearInStandalonePractice !== false,
      generated: Boolean(generatedCard),
      sessionCardCount: session?.cards.length ?? 0,
      errors: entryErrors,
    });
  }

  return {
    generatedAt,
    registeredCount: DAILY_MINI_GAME_REGISTRY.length,
    registeredIds,
    registeredMiniGames,
    selectableIds,
    standalonePracticeIds,
    deckInsertionViability,
    errors: Array.from(new Set(errors)),
  };
}
