import { Chess } from "chess.js";
import { attachConceptTagsToDailyCard, inferConceptTagsForMiniGame } from "../concepts/dailyConceptTagging";
import { scoreDailyMiniGameAttempt } from "./dailyMiniGameScoring";
import { hashString, normalizeText, uniqueSquares } from "./miniGameUtils";
import type {
  DailyBlundrMiniGameCard,
  DailyMiniGameAdvanceAttempt,
  DailyMiniGameAdvanceResult,
  DailyMiniGameDefinition,
  DailyMiniGameGenerationContext,
  DailyMiniGameId,
  DailyMiniGameScenario,
  DailyMiniGameSkillId,
  DailyMiniGameState,
  DailyMiniGameSource,
} from "./dailyMiniGameTypes";

export type StaticMiniGameScenario = {
  scenarioId: string;
  fen: string;
  prompt: string;
  summary: string;
  note?: string;
  expectedMoveUci: string;
  expectedMoveSan?: string | null;
  acceptedMoves?: readonly string[];
  goalSquares?: readonly string[];
  targetSquares?: readonly string[];
  flagSquares?: readonly string[];
  moveLimit?: number;
  bestKnownMoves?: number;
  theme?: string;
  instructions?: string;
  goal?: string;
  explanation?: string;
  conceptTags?: readonly string[];
  estimatedTimeSeconds?: number;
  source?: DailyMiniGameSource;
  solutionSan?: string | null;
  boardOrientationHint?: "white" | "black" | "auto";
  candidateMoves?: Array<{ uci: string; san: string | null; label: string; correct: boolean }>;
  scoringMode?: DailyMiniGameScenario["scoring"]["mode"];
  retryBehavior?: Partial<DailyMiniGameScenario["retryBehavior"]>;
  revealBehavior?: Partial<DailyMiniGameScenario["revealBehavior"]>;
};

function normalizeMoveUci(value: string): string {
  return normalizeText(value).toLowerCase();
}

function parseFenSideToMove(fen: string): "w" | "b" {
  const side = normalizeText(fen).split(/\s+/)[1];
  return side === "b" ? "b" : "w";
}

function applyMoveUci(fen: string, uci: string): { fen: string; san: string | null; uci: string } | null {
  try {
    const chess = new Chess(fen);
    const move = chess.move({
      from: uci.slice(0, 2) as never,
      to: uci.slice(2, 4) as never,
      promotion: uci.length > 4 ? (uci.slice(4, 5) as never) : undefined,
    });
    if (!move) return null;
    return {
      fen: chess.fen(),
      san: move.san,
      uci: `${move.from}${move.to}${move.promotion ?? ""}`,
    };
  } catch {
    return null;
  }
}

function uniqueConceptIds(values: readonly (string | null | undefined)[]): string[] {
  return Array.from(
    new Set(
      values
        .map((value) => normalizeText(value))
        .filter((value) => Boolean(value) && value.startsWith("concept:")),
    ),
  );
}

function uniqueText(values: readonly (string | null | undefined)[]): string[] {
  return Array.from(new Set(values.map((value) => normalizeText(value)).filter(Boolean)));
}

function buildScenarioKey(input: {
  miniGameId: DailyMiniGameId;
  theme: string;
  fen: string;
  solutionUci: string;
  targetSquares?: readonly string[] | null;
  goalSquares?: readonly string[] | null;
  difficulty: string;
  source: DailyMiniGameSource;
}): string {
  const placement = normalizeText(input.fen).replace(/\s+/g, " ");
  const target = uniqueSquares(input.targetSquares ?? []).join(",");
  const goal = uniqueSquares(input.goalSquares ?? []).join(",");
  return hashString(
    [
      input.miniGameId,
      normalizeText(input.theme) || input.miniGameId,
      placement,
      normalizeMoveUci(input.solutionUci),
      target,
      goal,
      normalizeText(input.difficulty),
      input.source,
    ].join("|"),
  );
}

function buildScenarioValidation(attempts: number, now: string): DailyMiniGameScenario["validation"] {
  return {
    checkedAt: now,
    valid: true,
    attempts,
    issues: [],
  };
}

function buildScenarioConceptTags(input: {
  scenario: StaticMiniGameScenario;
  skillIds: readonly DailyMiniGameSkillId[];
  miniGameId: DailyMiniGameId;
  title: string;
}): string[] {
  return uniqueText([
    ...(input.scenario.conceptTags ?? []),
    ...(input.scenario.theme ? [input.scenario.theme] : []),
    input.scenario.goal ?? input.scenario.summary,
    input.scenario.summary,
    ...input.skillIds.map((skillId) => skillId.replace(/_/g, " ")),
    input.title,
    input.miniGameId.replace(/_/g, " "),
  ]);
}

function buildScenarioRetryBehavior(scenario: StaticMiniGameScenario): DailyMiniGameScenario["retryBehavior"] {
  return {
    allowRetry: scenario.retryBehavior?.allowRetry ?? true,
    refreshSeedOnRetry: scenario.retryBehavior?.refreshSeedOnRetry ?? true,
    nextLabel: scenario.retryBehavior?.nextLabel ?? "Next",
  };
}

function buildScenarioRevealBehavior(scenario: StaticMiniGameScenario): DailyMiniGameScenario["revealBehavior"] {
  return {
    revealLabel: "Reveal",
    continueLabel: scenario.revealBehavior?.continueLabel ?? "Continue",
    showAnswerLabel: scenario.revealBehavior?.showAnswerLabel ?? null,
    markReviewedLabel: scenario.revealBehavior?.markReviewedLabel ?? null,
  };
}

function buildScenarioScoring(scenario: StaticMiniGameScenario, moveLimit: number): DailyMiniGameScenario["scoring"] {
  return {
    mode: scenario.scoringMode ?? (moveLimit > 1 ? "route" : "single_move"),
    maxAttempts: Math.max(1, moveLimit),
    revealPenalty: 0.1,
    canRetry: true,
    correctMoveReward: 1,
  };
}

function buildScenarioNovelty(input: {
  miniGameId: DailyMiniGameId;
  scenario: StaticMiniGameScenario;
  seed: string;
  source: DailyMiniGameSource;
  difficulty: string;
  recentScenarioKeys: readonly string[];
}): DailyMiniGameScenario["novelty"] {
  const scenarioKey = buildScenarioKey({
    miniGameId: input.miniGameId,
    theme: input.scenario.theme ?? input.scenario.note ?? input.scenario.summary ?? input.scenario.scenarioId,
    fen: input.scenario.fen,
    solutionUci: input.scenario.expectedMoveUci,
    targetSquares: input.scenario.targetSquares,
    goalSquares: input.scenario.goalSquares,
    difficulty: input.difficulty,
    source: input.source,
  });
  const recentScenarioKeys = uniqueText(input.recentScenarioKeys);
  const recentIndex = recentScenarioKeys.indexOf(scenarioKey);
  return {
    scenarioKey,
    cooldownGroup: input.scenario.theme ?? input.scenario.summary ?? input.miniGameId,
    recentScenarioKeys,
    avoidedRepeat: recentIndex >= 0,
  };
}

function resolveMiniGameSeed(input: {
  ctx: DailyMiniGameGenerationContext;
  miniGameId: DailyMiniGameId;
  scenarioId: string;
}): string {
  const explicitSeed = normalizeText(input.ctx.seed);
  if (explicitSeed) return explicitSeed;
  return hashString(
    [
      input.ctx.dateKey,
      input.ctx.userIdOrLocalId ?? "local",
      input.ctx.deckId ?? "deck",
      input.ctx.source ?? "daily_deck",
      input.miniGameId,
      input.scenarioId,
      input.ctx.difficulty,
      input.ctx.currentMastery.toFixed(2),
      input.ctx.confidence.toFixed(2),
    ].join("|"),
  );
}

function rankScenarios<T extends StaticMiniGameScenario>(
  ctx: DailyMiniGameGenerationContext,
  miniGameId: DailyMiniGameId,
  scenarios: readonly T[],
): T[] {
  const pool = scenarios.length > 0 ? [...scenarios] : [];
  if (!pool.length) return [];
  const seed = resolveMiniGameSeed({ ctx, miniGameId, scenarioId: pool[0]?.scenarioId ?? miniGameId });
  const recentScenarioKeys = uniqueText(ctx.recentScenarioKeys ?? []);
  return pool
    .map((scenario, index) => {
      const scenarioKey = buildScenarioKey({
        miniGameId,
        theme: scenario.theme ?? scenario.note ?? scenario.summary ?? scenario.scenarioId,
        fen: scenario.fen,
        solutionUci: scenario.expectedMoveUci,
        targetSquares: scenario.targetSquares,
        goalSquares: scenario.goalSquares,
        difficulty: ctx.difficulty,
        source: ctx.source ?? "daily_deck",
      });
      const recentIndex = recentScenarioKeys.indexOf(scenarioKey);
      const recencyPenalty = recentIndex >= 0 ? (recentScenarioKeys.length - recentIndex) * 1_000_000 : 0;
      const score = Number.parseInt(hashString(`${seed}|${miniGameId}|${scenario.scenarioId}|${index}`), 36) + recencyPenalty;
      return { scenario, score };
    })
    .sort((a, b) => a.score - b.score || a.scenario.scenarioId.localeCompare(b.scenario.scenarioId))
    .map((entry) => entry.scenario);
}

function buildScenarioContract(input: {
  miniGameId: DailyMiniGameId;
  title: string;
  summary: string;
  prompt: string;
  scenario: StaticMiniGameScenario;
  ctx: DailyMiniGameGenerationContext;
  skillIds: readonly DailyMiniGameSkillId[];
  conceptId?: string;
  conceptIds?: readonly string[];
  tags?: string[];
  difficultyWeight?: number;
  selectionPriority?: number;
  displayName?: string;
  shortDescription?: string;
  instructions?: string;
  estimatedSeconds?: number;
  canAppearInDailyBlundr?: boolean;
  canAppearInStandalonePractice?: boolean;
  moveLimit?: number;
  bestKnownScore?: number;
}) {
  const state = createStaticMiniGameState({
    miniGameId: input.miniGameId,
    scenario: input.scenario,
    ctx: input.ctx,
    skillIds: input.skillIds,
    moveLimit: input.moveLimit,
    bestKnownScore: input.bestKnownScore,
  });
  const currentMastery = Math.max(0, Math.min(1, input.ctx.currentMastery));
  const confidence = Math.max(0, Math.min(1, input.ctx.confidence));
  const source = input.ctx.source ?? "daily_deck";
  const seed = resolveMiniGameSeed({ ctx: input.ctx, miniGameId: input.miniGameId, scenarioId: input.scenario.scenarioId });
  const solution = applyMoveUci(state.startFen, input.scenario.expectedMoveUci) ?? applyMoveUci(state.startFen, input.scenario.expectedMoveUci.toLowerCase());
  if (!solution) return null;
  const acceptedMoves = uniqueText([input.scenario.expectedMoveUci, ...(input.scenario.acceptedMoves ?? [])]).map(normalizeMoveUci);
  const scenario: DailyMiniGameScenario = {
    id: `mini:${input.miniGameId}:${state.formationHash}`,
    miniGameId: input.miniGameId,
    source,
    seed,
    generatedAt: input.ctx.now,
    createdAt: input.ctx.now,
    fen: state.startFen,
    sideToMove: state.sideToMove,
    prompt: input.prompt,
    instructions: input.instructions ?? input.prompt,
    goal: input.scenario.goal ?? input.scenario.summary,
    acceptedMoves,
    solution: {
      uci: solution.uci,
      san: input.scenario.expectedMoveSan ?? solution.san,
    },
    explanation: input.scenario.explanation ?? input.scenario.note ?? input.scenario.summary,
    conceptTags: buildScenarioConceptTags({
      scenario: input.scenario,
      skillIds: input.skillIds,
      miniGameId: input.miniGameId,
      title: input.title,
    }),
    difficulty: input.ctx.difficulty,
    estimatedTimeSeconds: Math.max(5, Number(input.estimatedSeconds ?? input.scenario.estimatedTimeSeconds ?? 45) || 45),
    validation: buildScenarioValidation(1, input.ctx.now),
    scoring: buildScenarioScoring(input.scenario, state.moveLimit),
    retryBehavior: buildScenarioRetryBehavior(input.scenario),
    revealBehavior: buildScenarioRevealBehavior(input.scenario),
    novelty: buildScenarioNovelty({
      miniGameId: input.miniGameId,
      scenario: input.scenario,
      seed,
      source,
      difficulty: input.ctx.difficulty,
      recentScenarioKeys: input.ctx.recentScenarioKeys ?? [],
    }),
    theme: input.scenario.theme ?? input.scenario.note ?? input.scenario.summary ?? input.title,
    targetSquares: uniqueSquares(input.scenario.targetSquares),
    goalSquares: uniqueSquares(input.scenario.goalSquares),
    acceptedSquares: uniqueSquares([...(input.scenario.targetSquares ?? []), ...(input.scenario.goalSquares ?? []), ...(input.scenario.flagSquares ?? [])]),
    boardOrientationHint: input.scenario.boardOrientationHint ?? input.ctx.boardPreferences?.boardOrientation ?? "auto",
    candidateMoves: input.scenario.candidateMoves ? [...input.scenario.candidateMoves] : undefined,
  };

  state.scenario = scenario;
  state.noveltyKey = scenario.novelty.scenarioKey;

  const conceptIds = uniqueConceptIds([
    ...(input.conceptIds ?? []),
    ...inferConceptTagsForMiniGame(input.miniGameId, input.skillIds),
  ]);

  const card = attachConceptTagsToDailyCard(
    {
      source: "daily_attempt",
      cardKey: `mini:${input.miniGameId}:${state.formationHash}`,
      positionKey: state.formationHash,
      fen: state.currentFen,
      expectedMoveUci: null,
      expectedMoveSan: null,
      playedMoveUci: null,
      playedMoveSan: null,
      openingId: null,
      openingName: input.title,
      patternId: `mini:${input.miniGameId}`,
      concept: input.conceptId ?? conceptIds[0] ?? null,
      count: 1,
      weight: input.difficultyWeight ?? 1.25,
      lastSeenAt: input.ctx.mastery?.records[`mini:${input.miniGameId}:${input.skillIds[0] ?? input.miniGameId}`]?.lastSeenAt ?? null,
      note: input.scenario.note ?? input.summary,
      signals: [
        "mini_game",
        `mini:${input.miniGameId}`,
        `source:${scenario.source}`,
        `theme:${scenario.theme}`,
        `scenario:${input.scenario.scenarioId}`,
        `novelty:${scenario.novelty.scenarioKey}`,
        ...input.skillIds.map((skillId) => `skill:${skillId}`),
        ...(input.tags ?? []).map((tag) => `tag:${tag}`),
      ],
      masteryTargets: input.skillIds.map((skillId) => ({
        conceptKey: `mini:${input.miniGameId}:${skillId}`,
        domain: "mini_game" as const,
        label: skillId.replace(/_/g, " "),
        difficultyHint: input.ctx.difficulty,
      })),
      confidence: currentMastery >= 0.8 && confidence >= 0.6 ? "high" : currentMastery >= 0.35 ? "medium" : "low",
      difficulty: input.ctx.difficulty,
      id: `mini:${input.miniGameId}:${state.formationHash}`,
      kind: "mini_game",
      title: input.displayName ?? input.title,
      prompt: input.prompt,
      repertoireId: null,
      reviewCardId: null,
      reviewDedupeKey: null,
      reviewPromptKind: null,
      reviewStatus: null,
      reviewDueAt: null,
      deckRank: 1,
      priority: Math.round((1 - currentMastery) * 80 + (1 - confidence) * 15 + (input.selectionPriority ?? 0)),
      masteryKey: `mini:${input.miniGameId}:${state.formationHash}`,
      sourceCount: 1,
      summary: input.summary,
      miniGame: state,
      conceptIds,
    },
    conceptIds,
  );

  return {
    card,
    state,
  };
}

export function buildBoardFenFromPieces(pieces: Array<{ square: string; piece: string }>, sideToMove: "w" | "b" = "w"): string {
  const board = Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => ""));
  const place = (square: string, piece: string) => {
    const file = square.toLowerCase().charCodeAt(0) - 97;
    const rank = 8 - Number(square.slice(1));
    if (file < 0 || file > 7 || rank < 0 || rank > 7) return;
    board[rank][file] = piece;
  };
  for (const entry of pieces) {
    place(entry.square, entry.piece);
  }
  const ranks = board
    .map((rank) => {
      let empty = 0;
      let row = "";
      for (const cell of rank) {
        if (!cell) {
          empty += 1;
          continue;
        }
        if (empty > 0) {
          row += String(empty);
          empty = 0;
        }
        row += cell;
      }
      if (empty > 0) row += String(empty);
      return row || "8";
    })
    .join("/");
  return `${ranks} ${sideToMove} - - 0 1`;
}

export function rankStaticMiniGameScenarios<T extends StaticMiniGameScenario>(
  ctx: DailyMiniGameGenerationContext,
  miniGameId: DailyMiniGameId,
  scenarios: readonly T[],
): T[] {
  return rankScenarios(ctx, miniGameId, scenarios);
}

export function selectStaticMiniGameScenario<T extends StaticMiniGameScenario>(
  ctx: DailyMiniGameGenerationContext,
  miniGameId: DailyMiniGameId,
  scenarios: readonly T[],
): T {
  const ranked = rankScenarios(ctx, miniGameId, scenarios);
  return ranked[0] ?? scenarios[0] ?? (null as never);
}

export function createStaticMiniGameState(input: {
  miniGameId: DailyMiniGameId;
  scenario: StaticMiniGameScenario;
  ctx: DailyMiniGameGenerationContext;
  skillIds: readonly DailyMiniGameSkillId[];
  bestKnownScore?: number;
  moveLimit?: number;
}): DailyMiniGameState {
  const moveLimit = Math.max(1, Number(input.moveLimit ?? input.scenario.moveLimit ?? 2) || 2);
  const bestKnownScore = Math.max(1, Number(input.bestKnownScore ?? input.scenario.bestKnownMoves ?? 1) || 1);
  const seed = resolveMiniGameSeed({ ctx: input.ctx, miniGameId: input.miniGameId, scenarioId: input.scenario.scenarioId });
  const formationHash = hashString(`${input.miniGameId}|${input.scenario.scenarioId}|${input.scenario.fen}|${seed}|${input.ctx.dateKey}|${input.ctx.difficulty}`);
  const noveltyKey = buildScenarioKey({
    miniGameId: input.miniGameId,
    theme: input.scenario.theme ?? input.scenario.note ?? input.scenario.summary ?? input.scenario.scenarioId,
    fen: input.scenario.fen,
    solutionUci: input.scenario.expectedMoveUci,
    targetSquares: input.scenario.targetSquares,
    goalSquares: input.scenario.goalSquares,
    difficulty: input.ctx.difficulty,
    source: input.ctx.source ?? "daily_deck",
  });
  return {
    miniGameId: input.miniGameId,
    scenarioId: input.scenario.scenarioId,
    skillIds: [...input.skillIds],
    difficulty: input.ctx.difficulty,
    startFen: input.scenario.fen,
    currentFen: input.scenario.fen,
    sideToMove: parseFenSideToMove(input.scenario.fen),
    learnerSide: "white",
    goalSquares: input.scenario.goalSquares ? [...input.scenario.goalSquares] : undefined,
    targetSquares: input.scenario.targetSquares ? [...input.scenario.targetSquares] : undefined,
    flagSquares: input.scenario.flagSquares ? [...input.scenario.flagSquares] : undefined,
    moveLimit,
    plyCount: 0,
    bestKnownScore,
    completed: false,
    won: false,
    formationHash,
    noveltyKey,
    lastMoveUci: null,
    lastMoveSan: null,
    scenario: null,
  };
}

export function buildStaticMiniGameCard(input: {
  miniGameId: DailyMiniGameId;
  title: string;
  summary: string;
  prompt: string;
  scenario: StaticMiniGameScenario;
  ctx: DailyMiniGameGenerationContext;
  skillIds: readonly DailyMiniGameSkillId[];
  conceptId?: string;
  conceptIds?: readonly string[];
  tags?: string[];
  difficultyWeight?: number;
  selectionPriority?: number;
  displayName?: string;
  shortDescription?: string;
  instructions?: string;
  estimatedSeconds?: number;
  canAppearInDailyBlundr?: boolean;
  canAppearInStandalonePractice?: boolean;
  moveLimit?: number;
  bestKnownScore?: number;
}) {
  const state = createStaticMiniGameState({
    miniGameId: input.miniGameId,
    scenario: input.scenario,
    ctx: input.ctx,
    skillIds: input.skillIds,
    moveLimit: input.moveLimit,
    bestKnownScore: input.bestKnownScore,
  });
  const bundle = buildScenarioContract({
    miniGameId: input.miniGameId,
    title: input.title,
    summary: input.summary,
    prompt: input.prompt,
    scenario: input.scenario,
    ctx: input.ctx,
    skillIds: input.skillIds,
    conceptId: input.conceptId,
    conceptIds: input.conceptIds,
    tags: input.tags,
    difficultyWeight: input.difficultyWeight,
    selectionPriority: input.selectionPriority,
    displayName: input.displayName,
    shortDescription: input.shortDescription,
    instructions: input.instructions,
    estimatedSeconds: input.estimatedSeconds,
    canAppearInDailyBlundr: input.canAppearInDailyBlundr,
    canAppearInStandalonePractice: input.canAppearInStandalonePractice,
    moveLimit: input.moveLimit,
    bestKnownScore: input.bestKnownScore,
  });
  if (!bundle) return null;
  const { card, state: generatedState } = bundle;
  generatedState.scenario = card.miniGame?.scenario ?? null;
  return {
    card,
    state: generatedState,
  };
}

export function advanceStaticMiniGame(
  state: DailyMiniGameState,
  attempt: DailyMiniGameAdvanceAttempt,
  scenario: StaticMiniGameScenario,
): DailyMiniGameAdvanceResult {
  if (state.completed) {
    return {
      state,
      completed: true,
      won: Boolean(state.won),
      legal: false,
      reason: "mini_game_already_completed",
      attemptedMoveUci: null,
      attemptedMoveSan: null,
      moveCount: state.plyCount,
      illegalMoveCount: 0,
      scoreInput: {
        card: null as never,
        completed: true,
        won: Boolean(state.won),
        moveCount: state.plyCount,
        moveLimit: state.moveLimit,
        bestKnownMoves: state.bestKnownScore ?? null,
        illegalMoveCount: 0,
        blocked: false,
        perfectPath: Boolean(state.won && typeof state.bestKnownScore === "number" ? state.plyCount <= state.bestKnownScore : false),
        objectiveCount: 1,
        objectivesCompleted: Boolean(state.won) ? 1 : 0,
        reason: "mini_game_already_completed",
      },
    };
  }

  const nextMoveCount = state.plyCount + 1;
  const attemptUci = normalizeMoveUci(attempt.uci);
  const acceptedMoves = new Set([normalizeMoveUci(scenario.expectedMoveUci), ...(scenario.acceptedMoves ?? []).map(normalizeMoveUci)]);
  if (!attempt.legal) {
    return {
      state: {
        ...state,
        plyCount: nextMoveCount,
        lastMoveUci: attempt.uci,
        lastMoveSan: attempt.san ?? null,
      },
      completed: false,
      won: false,
      legal: false,
      reason: "illegal_move_attempt",
      attemptedMoveUci: attempt.uci,
      attemptedMoveSan: attempt.san ?? null,
      moveCount: nextMoveCount,
      illegalMoveCount: 1,
      scoreInput: {
        card: null as never,
        completed: false,
        won: false,
        moveCount: nextMoveCount,
        moveLimit: state.moveLimit,
        bestKnownMoves: state.bestKnownScore ?? null,
        illegalMoveCount: 1,
        blocked: false,
        perfectPath: false,
        objectiveCount: 1,
        objectivesCompleted: 0,
        reason: "illegal_move_attempt",
      },
    };
  }

  if (!acceptedMoves.has(attemptUci)) {
    return {
      state: {
        ...state,
        plyCount: nextMoveCount,
        lastMoveUci: attempt.uci,
        lastMoveSan: attempt.san ?? null,
      },
      completed: false,
      won: false,
      legal: true,
      reason: "try_again",
      attemptedMoveUci: attempt.uci,
      attemptedMoveSan: attempt.san ?? null,
      moveCount: nextMoveCount,
      illegalMoveCount: 0,
      scoreInput: {
        card: null as never,
        completed: false,
        won: false,
        moveCount: nextMoveCount,
        moveLimit: state.moveLimit,
        bestKnownMoves: state.bestKnownScore ?? null,
        illegalMoveCount: 0,
        blocked: false,
        perfectPath: false,
        objectiveCount: 1,
        objectivesCompleted: 0,
        reason: "try_again",
      },
    };
  }

  const applied = applyMoveUci(state.currentFen, attempt.uci) ?? applyMoveUci(state.currentFen, scenario.expectedMoveUci);
  const nextState: DailyMiniGameState = {
    ...state,
    currentFen: applied?.fen ?? state.currentFen,
    sideToMove: applied ? parseFenSideToMove(applied.fen) : state.sideToMove,
    plyCount: nextMoveCount,
    completed: true,
    won: true,
    lastMoveUci: applied?.uci ?? attempt.uci,
    lastMoveSan: applied?.san ?? attempt.san ?? null,
  };

  return {
    state: nextState,
    completed: true,
    won: true,
    legal: true,
    reason: "best_known_route",
    attemptedMoveUci: attempt.uci,
    attemptedMoveSan: attempt.san ?? null,
    responseMoveUci: applied?.uci ?? attempt.uci,
    responseMoveSan: applied?.san ?? attempt.san ?? null,
    moveCount: nextMoveCount,
    illegalMoveCount: 0,
    scoreInput: {
      card: null as never,
      completed: true,
      won: true,
      moveCount: nextMoveCount,
      moveLimit: state.moveLimit,
      bestKnownMoves: state.bestKnownScore ?? null,
      illegalMoveCount: 0,
      blocked: false,
      perfectPath: typeof state.bestKnownScore === "number" ? nextMoveCount <= state.bestKnownScore : false,
      objectiveCount: 1,
      objectivesCompleted: 1,
      reason: "best_known_route",
    },
  };
}

export function scoreStaticMiniGameAttempt(state: DailyMiniGameState, completed: boolean, won: boolean, moveCount: number, reason: string) {
  return scoreDailyMiniGameAttempt({
    card: null as never,
    completed,
    won,
    moveCount,
    moveLimit: state.moveLimit,
    bestKnownMoves: state.bestKnownScore ?? null,
    illegalMoveCount: 0,
    blocked: false,
    perfectPath: Boolean(won && typeof state.bestKnownScore === "number" ? moveCount <= state.bestKnownScore : false),
    objectiveCount: 1,
    objectivesCompleted: won ? 1 : 0,
    reason,
  });
}
