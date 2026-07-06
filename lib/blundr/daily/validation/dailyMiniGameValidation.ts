import { DAILY_MINI_GAME_REGISTRY } from "../miniGames/dailyMiniGameRegistry";
import type {
  DailyMiniGameDefinition,
  DailyMiniGameGenerationContext,
  DailyMiniGameState,
  DailyBlundrMiniGameCard,
} from "../miniGames/dailyMiniGameTypes";
import { validateFen, validateFenSideToMove } from "./dailyFenValidation";
import { validateDailyCardConcepts } from "./dailyConceptValidation";
import type { DailyValidationIssue, DailyValidationResult } from "./dailyValidationTypes";
import { isDailyBlundrDifficulty, makeValidationIssue, toValidationResult } from "./dailyValidationUtils";

function uniqueStrings(values: readonly (string | null | undefined)[]): string[] {
  return Array.from(new Set(values.map((value) => String(value ?? "").trim()).filter(Boolean)));
}

function validateDifficultyBand(value: unknown): DailyValidationResult {
  if (isDailyBlundrDifficulty(value)) return toValidationResult([]);
  return toValidationResult([
    makeValidationIssue({
      severity: "error",
      category: "difficulty",
      code: "invalid_difficulty",
      message: `Invalid difficulty: ${String(value ?? "")}`,
      suggestion: "Use a Daily Blundr difficulty band.",
    }),
  ]);
}

export function validateMiniGameDefinition(definition: DailyMiniGameDefinition): DailyValidationResult {
  const issues: DailyValidationIssue[] = [];
  if (!String(definition.id ?? "").trim()) {
    issues.push(
      makeValidationIssue({
        severity: "error",
        category: "mini_game",
        code: "missing_definition_id",
        message: "Mini-game definition id is missing.",
      }),
    );
  }
  if (!String(definition.title ?? "").trim()) {
    issues.push(
      makeValidationIssue({
        severity: "error",
        category: "mini_game",
        code: "missing_title",
        message: `Mini-game ${definition.id} is missing a title.`,
      }),
    );
  }
  if (!String(definition.summary ?? "").trim()) {
    issues.push(
      makeValidationIssue({
        severity: "error",
        category: "mini_game",
        code: "missing_summary",
        message: `Mini-game ${definition.id} is missing a summary.`,
      }),
    );
  }
  if (!Array.isArray(definition.skillIds) || definition.skillIds.length === 0) {
    issues.push(
      makeValidationIssue({
        severity: "error",
        category: "mini_game",
        code: "missing_skill_ids",
        message: `Mini-game ${definition.id} must define at least one skillId.`,
      }),
    );
  }
  if (!Array.isArray(definition.recommendedFor) || definition.recommendedFor.length === 0) {
    issues.push(
      makeValidationIssue({
        severity: "error",
        category: "mini_game",
        code: "missing_recommended_for",
        message: `Mini-game ${definition.id} must define at least one recommended difficulty band.`,
      }),
    );
  } else {
    for (const difficulty of definition.recommendedFor) {
      issues.push(...validateDifficultyBand(difficulty).issues.map((issue) => ({ ...issue, itemId: definition.id, path: "recommendedFor" })));
    }
  }
  if (typeof definition.generate !== "function") {
    issues.push(
      makeValidationIssue({
        severity: "error",
        category: "mini_game",
        code: "missing_generate",
        message: `Mini-game ${definition.id} must expose a generate() function.`,
      }),
    );
  }
  if (typeof definition.scoreAttempt !== "function") {
    issues.push(
      makeValidationIssue({
        severity: "error",
        category: "mini_game",
        code: "missing_score_attempt",
        message: `Mini-game ${definition.id} must expose a scoreAttempt() function.`,
      }),
    );
  }
  return toValidationResult(issues);
}

export function validateMiniGameRegistry(): DailyValidationResult {
  const issues: DailyValidationIssue[] = [];
  const seenIds = new Set<string>();
  for (const definition of DAILY_MINI_GAME_REGISTRY) {
    issues.push(...validateMiniGameDefinition(definition).issues.map((issue) => ({ ...issue, itemId: definition.id })));
    if (seenIds.has(definition.id)) {
      issues.push(
        makeValidationIssue({
          severity: "error",
          category: "registry",
          code: "duplicate_mini_game_id",
          message: `Duplicate mini-game id: ${definition.id}`,
          itemId: definition.id,
        }),
      );
    } else {
      seenIds.add(definition.id);
    }
  }
  return toValidationResult(issues);
}

function validateMiniGameObjectiveSquares(state: DailyMiniGameState): DailyValidationResult {
  const squares = uniqueStrings([...(state.goalSquares ?? []), ...(state.targetSquares ?? []), ...(state.flagSquares ?? [])]);
  if (squares.length > 0) return toValidationResult([]);
  return toValidationResult([
    makeValidationIssue({
      severity: "error",
      category: "mini_game",
      code: "missing_objective_squares",
      message: `Mini-game ${state.miniGameId} must define at least one goal, target, or flag square.`,
      suggestion: "Populate goalSquares, targetSquares, or flagSquares when generating the mini-game.",
    }),
  ]);
}

export function validateMiniGameState(state: DailyMiniGameState | null | undefined): DailyValidationResult {
  if (!state) {
    return toValidationResult([
      makeValidationIssue({
        severity: "error",
        category: "mini_game",
        code: "missing_state",
        message: "Mini-game state is missing.",
        suggestion: "Attach a generated miniGame state to the card.",
      }),
    ]);
  }

  const issues: DailyValidationIssue[] = [];
  if (!String(state.miniGameId ?? "").trim()) {
    issues.push(
      makeValidationIssue({
        severity: "error",
        category: "mini_game",
        code: "missing_mini_game_id",
        message: "Mini-game state is missing miniGameId.",
      }),
    );
  }
  if (!Array.isArray(state.skillIds) || state.skillIds.length === 0) {
    issues.push(
      makeValidationIssue({
        severity: "error",
        category: "mini_game",
        code: "missing_skill_ids",
        message: `Mini-game ${state.miniGameId} must define skillIds.`,
      }),
    );
  }
  if (!Number.isFinite(state.moveLimit) || state.moveLimit <= 0) {
    issues.push(
      makeValidationIssue({
        severity: "error",
        category: "mini_game",
        code: "invalid_move_limit",
        message: `Mini-game ${state.miniGameId} must define a positive moveLimit.`,
      }),
    );
  }
  if (!String(state.formationHash ?? "").trim()) {
    issues.push(
      makeValidationIssue({
        severity: "error",
        category: "novelty",
        code: "missing_formation_hash",
        message: `Mini-game ${state.miniGameId} must define a formationHash.`,
      }),
    );
  }
  if (!String(state.noveltyKey ?? "").trim()) {
    issues.push(
      makeValidationIssue({
        severity: "warning",
        category: "novelty",
        code: "missing_novelty_key",
        message: `Mini-game ${state.miniGameId} is missing a noveltyKey.`,
        suggestion: "Generate a stable noveltyKey for the mini-game formation.",
      }),
    );
  }
  issues.push(...validateFen(state.startFen).issues.map((issue) => ({ ...issue, path: issue.path ? `startFen.${issue.path}` : "startFen" })));
  issues.push(...validateFen(state.currentFen).issues.map((issue) => ({ ...issue, path: issue.path ? `currentFen.${issue.path}` : "currentFen" })));
  issues.push(...validateFenSideToMove(state.currentFen, state.sideToMove).issues.map((issue) => ({ ...issue, path: issue.path ? `currentFen.${issue.path}` : "currentFen" })));
  issues.push(...validateMiniGameObjectiveSquares(state).issues);
  if (state.currentFen !== state.startFen && state.plyCount === 0) {
    issues.push(
      makeValidationIssue({
        severity: "warning",
        category: "mini_game",
        code: "unexpected_initial_fen",
        message: `Mini-game ${state.miniGameId} has a different currentFen before any moves were played.`,
      }),
    );
  }
  return toValidationResult(issues);
}

export function validateMiniGameCard(card: Pick<DailyBlundrMiniGameCard, "id" | "cardKey" | "kind" | "source" | "difficulty" | "masteryTargets" | "miniGame" | "conceptIds" | "primaryConceptId" | "conceptMasteryKeys" | "fen">): DailyValidationResult {
  const issues: DailyValidationIssue[] = [];
  if (card.kind !== "mini_game") {
    issues.push(
      makeValidationIssue({
        severity: "error",
        category: "mini_game",
        code: "invalid_kind",
        message: `Expected a mini_game card, received ${String(card.kind ?? "")}.`,
      }),
    );
  }
  if (!String(card.source ?? "").trim()) {
    issues.push(
      makeValidationIssue({
        severity: "error",
        category: "card",
        code: "missing_source",
        message: "Mini-game card source is missing.",
      }),
    );
  }
  if (!Array.isArray(card.masteryTargets) || card.masteryTargets.length === 0) {
    issues.push(
      makeValidationIssue({
        severity: "error",
        category: "mini_game",
        code: "missing_mastery_targets",
        message: `Mini-game ${card.cardKey} must define masteryTargets.`,
      }),
    );
  }
  issues.push(...validateMiniGameState(card.miniGame).issues.map((issue) => ({ ...issue, itemId: card.cardKey })));
  issues.push(...validateDailyCardConcepts(card).issues.map((issue) => ({ ...issue, itemId: card.cardKey })));
  return toValidationResult(issues);
}

export function validateGeneratedMiniGames(context: DailyMiniGameGenerationContext): DailyValidationResult {
  const issues: DailyValidationIssue[] = [];
  for (const definition of DAILY_MINI_GAME_REGISTRY) {
    issues.push(...validateMiniGameDefinition(definition).issues.map((issue) => ({ ...issue, itemId: definition.id })));
    const card = definition.generate(context);
    if (!card) {
      issues.push(
        makeValidationIssue({
          severity: "warning",
          category: "mini_game",
          code: "generated_null_card",
          message: `Mini-game generator ${definition.id} returned null for the validation context.`,
          itemId: definition.id,
        }),
      );
      continue;
    }
    issues.push(...validateMiniGameCard(card).issues.map((issue) => ({ ...issue, itemId: card.cardKey })));
  }
  return toValidationResult(issues);
}
