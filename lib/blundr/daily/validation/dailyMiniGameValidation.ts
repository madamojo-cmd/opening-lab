import { Chess } from "chess.js";
import { DAILY_MINI_GAME_REGISTRY } from "../miniGames/dailyMiniGameRegistry";
import type {
  DailyMiniGameDefinition,
  DailyMiniGameGenerationContext,
  DailyMiniGameScenario,
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

function normalizeMoveUci(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

function isSerializable(value: unknown): boolean {
  try {
    JSON.stringify(value);
    return true;
  } catch {
    return false;
  }
}

function validateLegalMove(fen: string, moveUci: string): boolean {
  try {
    const chess = new Chess(fen);
    return Boolean(
      chess.move({
        from: moveUci.slice(0, 2) as never,
        to: moveUci.slice(2, 4) as never,
        promotion: moveUci.length > 4 ? (moveUci.slice(4, 5) as never) : undefined,
      }),
    );
  } catch {
    return false;
  }
}

function validateKingAdjacency(fen: string): DailyValidationResult {
  try {
    const chess = new Chess(fen);
    const board = chess.board();
    let whiteKing: { file: number; rank: number } | null = null;
    let blackKing: { file: number; rank: number } | null = null;

    for (let rank = 0; rank < board.length; rank += 1) {
      for (let file = 0; file < board[rank].length; file += 1) {
        const piece = board[rank][file];
        if (!piece || piece.type !== "k") continue;
        const coords = { file, rank };
        if (piece.color === "w") whiteKing = coords;
        if (piece.color === "b") blackKing = coords;
      }
    }

    if (!whiteKing || !blackKing) return toValidationResult([]);
    if (Math.max(Math.abs(whiteKing.file - blackKing.file), Math.abs(whiteKing.rank - blackKing.rank)) <= 1) {
      return toValidationResult([
        makeValidationIssue({
          severity: "error",
          category: "fen",
          code: "adjacent_kings",
          message: "Kings are illegally adjacent.",
          suggestion: "Move the kings farther apart before generating the scenario.",
        }),
      ]);
    }
    return toValidationResult([]);
  } catch {
    return toValidationResult([]);
  }
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

export function validateMiniGameScenario(scenario: DailyMiniGameScenario | null | undefined): DailyValidationResult {
  if (!scenario) {
    return toValidationResult([
      makeValidationIssue({
        severity: "error",
        category: "mini_game",
        code: "missing_scenario",
        message: "Mini-game scenario is missing.",
        suggestion: "Generate a scenario before attaching the mini-game card.",
      }),
    ]);
  }

  const issues: DailyValidationIssue[] = [];
  if (!String(scenario.id ?? "").trim()) {
    issues.push(makeValidationIssue({ severity: "error", category: "mini_game", code: "missing_scenario_id", message: "Mini-game scenario id is missing." }));
  }
  if (scenario.source !== "daily_deck" && scenario.source !== "standalone_review") {
    issues.push(
      makeValidationIssue({
        severity: "error",
        category: "mini_game",
        code: "invalid_source",
        message: `Mini-game scenario ${scenario.id} has invalid source ${String(scenario.source ?? "")}.`,
        suggestion: "Use source: daily_deck or standalone_review.",
      }),
    );
  }
  if (scenario.sideToMove !== "w" && scenario.sideToMove !== "b") {
    issues.push(
      makeValidationIssue({
        severity: "error",
        category: "mini_game",
        code: "invalid_side_to_move",
        message: `Mini-game scenario ${scenario.id} has invalid sideToMove ${String(scenario.sideToMove ?? "")}.`,
        suggestion: "Use w or b for sideToMove.",
      }),
    );
  }
  if (!String(scenario.seed ?? "").trim()) {
    issues.push(makeValidationIssue({ severity: "error", category: "mini_game", code: "missing_seed", message: `Mini-game scenario ${scenario.id} is missing a seed.` }));
  }
  if (!String(scenario.generatedAt ?? "").trim() || !String(scenario.createdAt ?? "").trim()) {
    issues.push(makeValidationIssue({ severity: "error", category: "mini_game", code: "missing_generated_at", message: `Mini-game scenario ${scenario.id} is missing generatedAt/createdAt.` }));
  }
  if (!String(scenario.prompt ?? "").trim()) {
    issues.push(makeValidationIssue({ severity: "error", category: "mini_game", code: "missing_prompt", message: `Mini-game scenario ${scenario.id} is missing a prompt.` }));
  }
  if (!String(scenario.instructions ?? "").trim()) {
    issues.push(makeValidationIssue({ severity: "error", category: "mini_game", code: "missing_instructions", message: `Mini-game scenario ${scenario.id} is missing instructions.` }));
  }
  if (!String(scenario.goal ?? "").trim()) {
    issues.push(makeValidationIssue({ severity: "error", category: "mini_game", code: "missing_goal", message: `Mini-game scenario ${scenario.id} is missing a goal.` }));
  }
  if (!String(scenario.solution?.uci ?? "").trim()) {
    issues.push(makeValidationIssue({ severity: "error", category: "mini_game", code: "missing_solution", message: `Mini-game scenario ${scenario.id} is missing a solution.` }));
  }
  if (!String(scenario.explanation ?? "").trim()) {
    issues.push(makeValidationIssue({ severity: "error", category: "mini_game", code: "missing_explanation", message: `Mini-game scenario ${scenario.id} is missing an explanation.` }));
  }
  if (!Array.isArray(scenario.conceptTags) || scenario.conceptTags.length === 0) {
    issues.push(makeValidationIssue({ severity: "error", category: "mini_game", code: "missing_concept_tags", message: `Mini-game scenario ${scenario.id} must include conceptTags.` }));
  }
  if (!Number.isFinite(scenario.estimatedTimeSeconds) || scenario.estimatedTimeSeconds <= 0) {
    issues.push(makeValidationIssue({ severity: "error", category: "mini_game", code: "invalid_estimated_time", message: `Mini-game scenario ${scenario.id} must include a positive estimatedTimeSeconds.` }));
  }
  issues.push(...validateFen(scenario.fen).issues.map((issue) => ({ ...issue, path: issue.path ? `fen.${issue.path}` : "fen" })));
  if (!Array.isArray(scenario.acceptedMoves) || scenario.acceptedMoves.length === 0) {
    issues.push(makeValidationIssue({ severity: "error", category: "mini_game", code: "empty_accepted_moves", message: `Mini-game scenario ${scenario.id} must include at least one accepted move.` }));
  }
  if (!scenario.validation || typeof scenario.validation !== "object") {
    issues.push(makeValidationIssue({ severity: "error", category: "mini_game", code: "missing_validation", message: `Mini-game scenario ${scenario.id} must include validation metadata.` }));
  }
  if (!scenario.scoring || typeof scenario.scoring !== "object") {
    issues.push(makeValidationIssue({ severity: "error", category: "mini_game", code: "missing_scoring", message: `Mini-game scenario ${scenario.id} must include scoring metadata.` }));
  }
  if (!scenario.retryBehavior || typeof scenario.retryBehavior !== "object") {
    issues.push(makeValidationIssue({ severity: "error", category: "mini_game", code: "missing_retry_behavior", message: `Mini-game scenario ${scenario.id} must include retry behavior metadata.` }));
  }
  if (!scenario.revealBehavior || typeof scenario.revealBehavior !== "object") {
    issues.push(makeValidationIssue({ severity: "error", category: "mini_game", code: "missing_reveal_behavior", message: `Mini-game scenario ${scenario.id} must include reveal behavior metadata.` }));
  }
  if (!scenario.novelty || typeof scenario.novelty !== "object") {
    issues.push(makeValidationIssue({ severity: "error", category: "mini_game", code: "missing_novelty_metadata", message: `Mini-game scenario ${scenario.id} must include novelty metadata.` }));
  }
  if (Array.isArray(scenario.novelty?.recentScenarioKeys)) {
    const scenarioKey = String(scenario.novelty?.scenarioKey ?? "").trim();
    const recentScenarioKeys = scenario.novelty.recentScenarioKeys.map((value) => String(value ?? "").trim().toLowerCase());
    if (scenarioKey && recentScenarioKeys.includes(String(scenarioKey).trim().toLowerCase()) && !scenario.novelty.avoidedRepeat) {
      issues.push(
        makeValidationIssue({
          severity: "warning",
          category: "novelty",
          code: "recent_repeat",
          message: `Mini-game scenario ${scenario.id} repeats a recent scenario key.`,
          suggestion: "Use a different template or seed when possible.",
        }),
      );
    }
  }
  if (!isSerializable(scenario)) {
    issues.push(makeValidationIssue({ severity: "error", category: "mini_game", code: "non_serializable_scenario", message: `Mini-game scenario ${scenario.id} must be serializable.` }));
  }

  const acceptedMoves = new Set((scenario.acceptedMoves ?? []).map(normalizeMoveUci).filter(Boolean));
  const solutionUci = normalizeMoveUci(scenario.solution?.uci);
  if (solutionUci && !acceptedMoves.has(solutionUci)) {
    issues.push(
      makeValidationIssue({
        severity: "error",
        category: "mini_game",
        code: "solution_not_accepted",
        message: `Mini-game scenario ${scenario.id} solution must be one of the accepted moves.`,
      }),
    );
  }
  if (solutionUci && !validateLegalMove(scenario.fen, solutionUci)) {
    issues.push(
      makeValidationIssue({
        severity: "error",
        category: "mini_game",
        code: "illegal_solution_move",
        message: `Mini-game scenario ${scenario.id} solution ${solutionUci} is not legal for the position.`,
      }),
    );
  }
  for (const acceptedMove of acceptedMoves) {
    if (!validateLegalMove(scenario.fen, acceptedMove)) {
      issues.push(
        makeValidationIssue({
          severity: "error",
          category: "mini_game",
          code: "illegal_accepted_move",
          message: `Mini-game scenario ${scenario.id} accepted move ${acceptedMove} is not legal for the position.`,
        }),
      );
    }
  }

  const noveltyScenarioKey = String(scenario.novelty?.scenarioKey ?? "").trim();
  if (!noveltyScenarioKey) {
    issues.push(makeValidationIssue({ severity: "error", category: "novelty", code: "missing_scenario_key", message: `Mini-game scenario ${scenario.id} is missing a novelty scenarioKey.` }));
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
  if (state.sideToMove !== "w" && state.sideToMove !== "b") {
    issues.push(
      makeValidationIssue({
        severity: "error",
        category: "mini_game",
        code: "invalid_side_to_move",
        message: `Mini-game ${state.miniGameId} has invalid sideToMove ${String(state.sideToMove ?? "")}.`,
        suggestion: "Use w or b for the sideToMove field.",
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
  issues.push(...validateKingAdjacency(state.startFen).issues.map((issue) => ({ ...issue, path: issue.path ? `startFen.${issue.path}` : "startFen" })));
  issues.push(...validateMiniGameObjectiveSquares(state).issues);
  if (state.scenario) {
    issues.push(...validateMiniGameScenario(state.scenario).issues.map((issue) => ({ ...issue, itemId: state.scenario?.id ?? state.miniGameId })));
  } else {
    issues.push(
      makeValidationIssue({
        severity: "warning",
        category: "mini_game",
        code: "missing_scenario",
        message: `Mini-game ${state.miniGameId} is missing scenario metadata.`,
        suggestion: "Attach a scenario object to generated mini-game cards.",
      }),
    );
  }
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
