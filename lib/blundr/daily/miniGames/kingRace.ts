import { Chess, type Move } from "chess.js";
import type { DailyBlundrMiniGameCard, DailyMiniGameAdvanceResult, DailyMiniGameDefinition, DailyMiniGameGenerationContext, DailyMiniGameState } from "./dailyMiniGameTypes";
import { scoreDailyMiniGameAttempt } from "./dailyMiniGameScoring";
import { hashString, normalizeText, squareDistance } from "./miniGameUtils";
import { attachConceptTagsToDailyCard, inferConceptTagsForMiniGame } from "../concepts/dailyConceptTagging";

type KingRaceScenario = {
  whiteKing: string;
  blackKing: string;
  goalSquare: string;
  moveLimitOffset: number;
};

const KING_RACE_SCENARIOS: KingRaceScenario[] = [
  { whiteKing: "d4", blackKing: "h8", goalSquare: "a8", moveLimitOffset: 2 },
  { whiteKing: "e3", blackKing: "h8", goalSquare: "a8", moveLimitOffset: 1 },
  { whiteKing: "d1", blackKing: "h8", goalSquare: "a8", moveLimitOffset: 0 },
  { whiteKing: "c2", blackKing: "a8", goalSquare: "h1", moveLimitOffset: 0 },
  { whiteKing: "e1", blackKing: "a8", goalSquare: "h8", moveLimitOffset: 0 },
];

const KING_RACE_RECOMMENDED_FOR = ["intro", "beginner", "early_intermediate", "intermediate", "advanced", "expert"] as const;

function difficultyRank(difficulty: DailyBlundrMiniGameCard["miniGame"]["difficulty"]): number {
  if (difficulty === "intro") return 0;
  if (difficulty === "beginner") return 1;
  if (difficulty === "early_intermediate") return 2;
  if (difficulty === "intermediate") return 3;
  if (difficulty === "advanced") return 4;
  return 5;
}

function difficultyFromIndex(index: number): DailyBlundrMiniGameCard["miniGame"]["difficulty"] {
  if (index <= 0) return "intro";
  if (index === 1) return "beginner";
  if (index === 2) return "early_intermediate";
  if (index === 3) return "intermediate";
  if (index === 4) return "advanced";
  return "expert";
}

function buildBoardFen(whiteKing: string, blackKing: string, sideToMove: "w" | "b" = "w"): string {
  const board = Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => ""));
  const place = (square: string, piece: string) => {
    const file = square.toLowerCase().charCodeAt(0) - 97;
    const rank = 8 - Number(square.slice(1));
    if (file < 0 || file > 7 || rank < 0 || rank > 7) return;
    board[rank][file] = piece;
  };
  place(whiteKing, "K");
  place(blackKing, "k");
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

function isValidSetup(whiteKing: string, blackKing: string): boolean {
  try {
    const chess = new Chess(buildBoardFen(whiteKing, blackKing));
    return Boolean(chess.get(whiteKing as never) && chess.get(blackKing as never));
  } catch {
    return false;
  }
}

function selectScenario(ctx: DailyMiniGameGenerationContext): KingRaceScenario {
  const minRank = difficultyRank(ctx.difficulty);
  const eligible = KING_RACE_SCENARIOS.filter((_, index) => index <= Math.max(0, Math.min(KING_RACE_SCENARIOS.length - 1, minRank + 1)));
  const pool = eligible.length ? eligible : KING_RACE_SCENARIOS.slice(0, 1);
  const seed = hashString(`${ctx.dateKey}|king_race|${ctx.difficulty}|${ctx.currentMastery.toFixed(2)}|${ctx.confidence.toFixed(2)}`);
  return pool[seed ? Number.parseInt(seed, 36) % pool.length : 0];
}

function buildKingRaceState(ctx: DailyMiniGameGenerationContext, scenario: KingRaceScenario): DailyMiniGameState {
  const startFen = buildBoardFen(scenario.whiteKing, scenario.blackKing, "w");
  const moveLimit = Math.max(2, squareDistance(scenario.whiteKing, scenario.goalSquare) + scenario.moveLimitOffset);
  const bestKnownScore = squareDistance(scenario.whiteKing, scenario.goalSquare);
  const formationHash = hashString(`${scenario.whiteKing}|${scenario.blackKing}|${scenario.goalSquare}|${moveLimit}|${ctx.difficulty}`);
  const noveltyKey = `king_race:${formationHash}`;
  return {
    miniGameId: "king_race",
    skillIds: ["king_pathing", "opposition", "goal_zone"],
    difficulty: ctx.difficulty,
    startFen,
    currentFen: startFen,
    sideToMove: "w",
    learnerSide: "white",
    goalSquares: [scenario.goalSquare],
    flagSquares: [scenario.goalSquare],
    moveLimit,
    plyCount: 0,
    bestKnownScore,
    completed: false,
    won: false,
    formationHash,
    noveltyKey,
  };
}

function selectBlackMove(fen: string, goalSquares: readonly string[], whiteSquare: string): Move | null {
  try {
    const chess = new Chess(fen);
    const moves = chess.moves({ verbose: true }) as Move[];
    if (!moves.length) return null;
    const scored = moves
      .map((move) => {
        const destination = move.to.toLowerCase();
        const goalPriority = goalSquares.includes(destination) ? -100 : 0;
        const goalDistance = Math.min(...goalSquares.map((goal) => squareDistance(destination, goal)));
        const oppositionDistance = squareDistance(destination, whiteSquare);
        const score = goalPriority + goalDistance * 4 + oppositionDistance;
        return { move, score };
      })
      .sort((a, b) => a.score - b.score || `${a.move.from}${a.move.to}${a.move.promotion ?? ""}`.localeCompare(`${b.move.from}${b.move.to}${b.move.promotion ?? ""}`));
    return scored[0]?.move ?? null;
  } catch {
    return null;
  }
}

function locateWhiteKing(chess: Chess): string {
  const board = chess.board();
  for (let rank = 0; rank < board.length; rank += 1) {
    for (let file = 0; file < board[rank].length; file += 1) {
      const piece = board[rank][file];
      if (piece?.type === "k" && piece.color === "w") {
        return `${String.fromCharCode(97 + file)}${8 - rank}`;
      }
    }
  }
  return "";
}

function applyMove(fen: string, from: string, to: string): { chess: Chess; move: Move | null } {
  const chess = new Chess(fen);
  const move = chess.move({
    from: from as never,
    to: to as never,
  });
  return { chess, move };
}

function resolveKingRaceFeedbackInput(state: DailyMiniGameState, won: boolean, moveCount: number, legal: boolean, blocked: boolean, reason: string): DailyMiniGameAdvanceResult["scoreInput"] {
  return {
    card: null as never,
    completed: state.completed,
    won,
    moveCount,
    moveLimit: state.moveLimit,
    bestKnownMoves: state.bestKnownScore ?? null,
    illegalMoveCount: legal ? 0 : 1,
    blocked,
    perfectPath: won && typeof state.bestKnownScore === "number" ? moveCount <= state.bestKnownScore : false,
    objectiveCount: 1,
    objectivesCompleted: won ? 1 : 0,
    reason,
  };
}

export function generateKingRaceMiniGameCard(ctx: DailyMiniGameGenerationContext): DailyBlundrMiniGameCard | null {
  const scenario = selectScenario(ctx);
  if (!isValidSetup(scenario.whiteKing, scenario.blackKing)) return null;
  const state = buildKingRaceState(ctx, scenario);
  const currentMastery = Math.max(0, Math.min(1, ctx.currentMastery));
  const confidence = Math.max(0, Math.min(1, ctx.confidence));
  return attachConceptTagsToDailyCard({
    source: "daily_attempt",
    cardKey: `mini:king_race:${state.formationHash}`,
    positionKey: state.formationHash,
    fen: state.currentFen,
    expectedMoveUci: null,
    expectedMoveSan: null,
    playedMoveUci: null,
    playedMoveSan: null,
    openingId: null,
    openingName: "King Race",
    patternId: "mini:king_race",
    concept: "king_pathing",
    count: 1,
    weight: 1.35 + (1 - currentMastery) * 0.6,
    lastSeenAt: ctx.mastery?.records[`mini:king_race:king_pathing`]?.lastSeenAt ?? null,
    note: `Goal ${state.goalSquares?.[0] ?? "unknown"}`,
    signals: [
      "mini_game",
      "mini:king_race",
      "skill:king_pathing",
      "skill:opposition",
      "skill:goal_zone",
      `goal:${state.goalSquares?.[0] ?? "unknown"}`,
      `novelty:${state.noveltyKey}`,
    ],
    masteryTargets: [
      { conceptKey: "mini:king_race:king_pathing", domain: "mini_game", label: "King pathing", difficultyHint: state.difficulty },
      { conceptKey: "mini:king_race:opposition", domain: "mini_game", label: "Opposition", difficultyHint: state.difficulty },
      { conceptKey: "mini:king_race:goal_zone", domain: "mini_game", label: "Goal zone", difficultyHint: state.difficulty },
    ],
    confidence: currentMastery >= 0.8 && confidence >= 0.6 ? "high" : currentMastery >= 0.35 ? "medium" : "low",
    difficulty: state.difficulty,
    id: `mini:king_race:${state.formationHash}`,
    kind: "mini_game",
    title: "King Race",
    prompt: `Guide the white king to ${state.goalSquares?.[0] ?? "the goal"}. Black will try to block the lane.`,
    repertoireId: null,
    reviewCardId: null,
    reviewDedupeKey: null,
    reviewPromptKind: null,
    reviewStatus: null,
    reviewDueAt: null,
    deckRank: 1,
    priority: Math.round((1 - currentMastery) * 80 + (1 - confidence) * 15 + difficultyRank(state.difficulty) * 3 + 10),
    masteryKey: `mini:king_race:${state.formationHash}`,
    sourceCount: 1,
    summary: `White king to ${state.goalSquares?.[0] ?? "goal square"}`,
    miniGame: state,
  }, inferConceptTagsForMiniGame("king_race", state.skillIds));
}

export function advanceKingRaceMiniGame(state: DailyMiniGameState, attempt: { from: string; to: string; uci: string; san: string | null; legal: boolean }): DailyMiniGameAdvanceResult {
  const moveCount = state.plyCount + 1;
  if (state.completed) {
    return {
      state,
      completed: true,
      won: Boolean(state.won),
      legal: false,
      reason: "mini_game_already_completed",
      attemptedMoveUci: attempt.uci,
      attemptedMoveSan: attempt.san,
      moveCount,
      illegalMoveCount: 0,
      scoreInput: {
        card: null as never,
        completed: true,
        won: Boolean(state.won),
        moveCount,
        moveLimit: state.moveLimit,
        bestKnownMoves: state.bestKnownScore ?? null,
        illegalMoveCount: 0,
        blocked: false,
        perfectPath: Boolean(state.won) && typeof state.bestKnownScore === "number" ? moveCount <= state.bestKnownScore : false,
        objectiveCount: 1,
        objectivesCompleted: state.won ? 1 : 0,
        reason: "mini_game_already_completed",
      },
    };
  }

  if (!attempt.legal) {
    const nextState: DailyMiniGameState = {
      ...state,
      completed: true,
      won: false,
      plyCount: moveCount,
      lastMoveUci: attempt.uci,
      lastMoveSan: attempt.san,
    };
    return {
      state: nextState,
      completed: true,
      won: false,
      legal: false,
      reason: "illegal_move_attempt",
      attemptedMoveUci: attempt.uci,
      attemptedMoveSan: attempt.san,
      moveCount,
      illegalMoveCount: 1,
      scoreInput: {
        card: null as never,
        completed: true,
        won: false,
        moveCount,
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

  const whiteReply = applyMove(state.currentFen, attempt.from, attempt.to);
  if (!whiteReply.move) {
    const nextState: DailyMiniGameState = {
      ...state,
      completed: true,
      won: false,
      plyCount: moveCount,
      lastMoveUci: attempt.uci,
      lastMoveSan: attempt.san,
    };
    return {
      state: nextState,
      completed: true,
      won: false,
      legal: false,
      reason: "illegal_move_attempt",
      attemptedMoveUci: attempt.uci,
      attemptedMoveSan: attempt.san,
      moveCount,
      illegalMoveCount: 1,
      scoreInput: {
        card: null as never,
        completed: true,
        won: false,
        moveCount,
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

  const goalSquares = state.goalSquares ?? [];
  const whiteKingSquare = locateWhiteKing(whiteReply.chess);
  const whiteOnGoal = goalSquares.includes(whiteKingSquare);
  if (whiteOnGoal) {
    const nextState: DailyMiniGameState = {
      ...state,
      currentFen: whiteReply.chess.fen(),
      sideToMove: "w",
      plyCount: moveCount,
      completed: true,
      won: true,
      lastMoveUci: attempt.uci,
      lastMoveSan: whiteReply.move.san ?? attempt.san,
      visitedGoalSquares: Array.from(new Set([...(state.visitedGoalSquares ?? []), whiteKingSquare])),
    };
    return {
      state: nextState,
      completed: true,
      won: true,
      legal: true,
      reason: "goal_reached",
      attemptedMoveUci: attempt.uci,
      attemptedMoveSan: whiteReply.move.san ?? attempt.san,
      moveCount,
      illegalMoveCount: 0,
      scoreInput: {
        card: null as never,
        completed: true,
        won: true,
        moveCount,
        moveLimit: state.moveLimit,
        bestKnownMoves: state.bestKnownScore ?? null,
        illegalMoveCount: 0,
        blocked: false,
        perfectPath: typeof state.bestKnownScore === "number" ? moveCount <= state.bestKnownScore : false,
        objectiveCount: 1,
        objectivesCompleted: 1,
        reason: "goal_reached",
      },
    };
  }

  if (moveCount >= state.moveLimit) {
    const nextState: DailyMiniGameState = {
      ...state,
      currentFen: whiteReply.chess.fen(),
      sideToMove: "w",
      plyCount: moveCount,
      completed: true,
      won: false,
      lastMoveUci: attempt.uci,
      lastMoveSan: whiteReply.move.san ?? attempt.san,
    };
    return {
      state: nextState,
      completed: true,
      won: false,
      legal: true,
      reason: "move_limit_exceeded",
      attemptedMoveUci: attempt.uci,
      attemptedMoveSan: whiteReply.move.san ?? attempt.san,
      moveCount,
      illegalMoveCount: 0,
      scoreInput: {
        card: null as never,
        completed: true,
        won: false,
        moveCount,
        moveLimit: state.moveLimit,
        bestKnownMoves: state.bestKnownScore ?? null,
        illegalMoveCount: 0,
        blocked: false,
        perfectPath: false,
        objectiveCount: 1,
        objectivesCompleted: 0,
        reason: "move_limit_exceeded",
      },
    };
  }

  const blackMove = selectBlackMove(whiteReply.chess.fen(), goalSquares, whiteKingSquare);
  if (!blackMove) {
    const nextState: DailyMiniGameState = {
      ...state,
      currentFen: whiteReply.chess.fen(),
      sideToMove: "w",
      plyCount: moveCount,
      completed: true,
      won: true,
      lastMoveUci: attempt.uci,
      lastMoveSan: whiteReply.move.san ?? attempt.san,
      visitedGoalSquares: Array.from(new Set([...(state.visitedGoalSquares ?? []), whiteKingSquare])),
    };
    return {
      state: nextState,
      completed: true,
      won: true,
      legal: true,
      reason: "blocked_side_has_no_reply",
      attemptedMoveUci: attempt.uci,
      attemptedMoveSan: whiteReply.move.san ?? attempt.san,
      moveCount,
      illegalMoveCount: 0,
      scoreInput: {
        card: null as never,
        completed: true,
        won: true,
        moveCount,
        moveLimit: state.moveLimit,
        bestKnownMoves: state.bestKnownScore ?? null,
        illegalMoveCount: 0,
        blocked: false,
        perfectPath: typeof state.bestKnownScore === "number" ? moveCount <= state.bestKnownScore : false,
        objectiveCount: 1,
        objectivesCompleted: 1,
        reason: "blocked_side_has_no_reply",
      },
    };
  }

  const blackReply = whiteReply.chess.move({ from: blackMove.from as never, to: blackMove.to as never, promotion: blackMove.promotion as never });
  const blackSquare = blackMove.to.toLowerCase();
  const blocked = goalSquares.includes(blackSquare);
  const nextState: DailyMiniGameState = {
    ...state,
    currentFen: whiteReply.chess.fen(),
    sideToMove: "w",
    plyCount: moveCount,
    completed: blocked,
    won: false,
    lastMoveUci: attempt.uci,
    lastMoveSan: whiteReply.move.san ?? attempt.san,
    visitedGoalSquares: whiteKingSquare ? Array.from(new Set([...(state.visitedGoalSquares ?? []), whiteKingSquare])) : state.visitedGoalSquares,
  };

  if (blocked) {
    return {
      state: {
        ...nextState,
        currentFen: whiteReply.chess.fen(),
        completed: true,
        won: false,
      },
      completed: true,
      won: false,
      legal: true,
      reason: "blocked_by_defense",
      attemptedMoveUci: attempt.uci,
      attemptedMoveSan: whiteReply.move.san ?? attempt.san,
      responseMoveUci: `${blackReply.from}${blackReply.to}${blackReply.promotion ?? ""}`,
      responseMoveSan: blackMove.san,
      moveCount,
      illegalMoveCount: 0,
      scoreInput: {
        card: null as never,
        completed: true,
        won: false,
        moveCount,
        moveLimit: state.moveLimit,
        bestKnownMoves: state.bestKnownScore ?? null,
        illegalMoveCount: 0,
        blocked: true,
        perfectPath: false,
        objectiveCount: 1,
        objectivesCompleted: 0,
        reason: "blocked_by_defense",
      },
    };
  }

  return {
    state: nextState,
    completed: false,
    won: false,
    legal: true,
    reason: "continue",
    attemptedMoveUci: attempt.uci,
    attemptedMoveSan: whiteReply.move.san ?? attempt.san,
    responseMoveUci: `${blackReply.from}${blackReply.to}${blackReply.promotion ?? ""}`,
    responseMoveSan: blackMove.san,
    moveCount,
    illegalMoveCount: 0,
    scoreInput: {
      card: null as never,
      completed: false,
      won: false,
      moveCount,
      moveLimit: state.moveLimit,
      bestKnownMoves: state.bestKnownScore ?? null,
      illegalMoveCount: 0,
      blocked: false,
      perfectPath: false,
      objectiveCount: 1,
      objectivesCompleted: 0,
      reason: "continue",
    },
  };
}

export const kingRaceDefinition: DailyMiniGameDefinition = {
  id: "king_race",
  title: "King Race",
  summary: "Guide the king through opposition and reach the goal square before Tempo's blocker arrives.",
  skillIds: ["king_pathing", "opposition", "goal_zone"],
  recommendedFor: [...KING_RACE_RECOMMENDED_FOR],
  generate: generateKingRaceMiniGameCard,
  scoreAttempt: (args) => scoreDailyMiniGameAttempt(args),
};
