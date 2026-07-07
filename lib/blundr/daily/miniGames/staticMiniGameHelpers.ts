import { Chess } from "chess.js";
import { attachConceptTagsToDailyCard } from "../concepts/dailyConceptTagging";
import { inferConceptTagsForMiniGame } from "../concepts/dailyConceptTagging";
import { scoreDailyMiniGameAttempt } from "./dailyMiniGameScoring";
import { hashString, normalizeText } from "./miniGameUtils";
import type {
  DailyBlundrMiniGameCard,
  DailyMiniGameAdvanceAttempt,
  DailyMiniGameAdvanceResult,
  DailyMiniGameDefinition,
  DailyMiniGameGenerationContext,
  DailyMiniGameId,
  DailyMiniGameSkillId,
  DailyMiniGameState,
} from "./dailyMiniGameTypes";

export type StaticMiniGameScenario = {
  scenarioId: string;
  fen: string;
  prompt: string;
  summary: string;
  note?: string;
  expectedMoveUci: string;
  acceptedMoves?: readonly string[];
  goalSquares?: readonly string[];
  targetSquares?: readonly string[];
  flagSquares?: readonly string[];
  moveLimit?: number;
  bestKnownMoves?: number;
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

export function selectStaticMiniGameScenario<T extends StaticMiniGameScenario>(
  ctx: DailyMiniGameGenerationContext,
  miniGameId: DailyMiniGameId,
  scenarios: readonly T[],
): T {
  const pool = scenarios.length > 0 ? scenarios : [scenarios[0] ?? null].filter(Boolean) as T[];
  const seed = hashString(`${ctx.dateKey}|${miniGameId}|${ctx.difficulty}|${ctx.currentMastery.toFixed(2)}|${ctx.confidence.toFixed(2)}`);
  const index = Number.parseInt(seed, 36);
  return pool[Math.abs(index) % pool.length] ?? pool[0];
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
  const formationHash = hashString(`${input.miniGameId}|${input.scenario.scenarioId}|${input.scenario.fen}|${input.ctx.dateKey}|${input.ctx.difficulty}`);
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
    noveltyKey: `${input.miniGameId}:${input.scenario.scenarioId}`,
    lastMoveUci: null,
    lastMoveSan: null,
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
  const currentMastery = Math.max(0, Math.min(1, input.ctx.currentMastery));
  const confidence = Math.max(0, Math.min(1, input.ctx.confidence));
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
        ...input.skillIds.map((skillId) => `skill:${skillId}`),
        ...(input.tags ?? []).map((tag) => `tag:${tag}`),
        `scenario:${input.scenario.scenarioId}`,
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
    },
    conceptIds,
  );

  return {
    card,
    state,
  };
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
