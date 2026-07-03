import { Chess, type Move } from "chess.js";
import type { DailyBlundrMiniGameCard, DailyMiniGameAdvanceResult, DailyMiniGameDefinition, DailyMiniGameGenerationContext, DailyMiniGameState } from "./dailyMiniGameTypes";
import { scoreDailyMiniGameAttempt } from "./dailyMiniGameScoring";
import { hashString, normalizeText, squareDistance, squareToCoords, coordsToSquare } from "./miniGameUtils";
import { attachConceptTagsToDailyCard, inferConceptTagsForMiniGame } from "../concepts/dailyConceptTagging";

type KnightGymScenario = {
  whiteKing: string;
  blackKing: string;
  startKnight: string;
  targetSquares: string[];
};

const KNIGHT_GYM_SCENARIOS: KnightGymScenario[] = [
  { whiteKing: "e1", blackKing: "h8", startKnight: "g1", targetSquares: ["e2"] },
  { whiteKing: "e1", blackKing: "h8", startKnight: "b1", targetSquares: ["c3", "a3"] },
  { whiteKing: "a1", blackKing: "h8", startKnight: "d2", targetSquares: ["f3", "e4"] },
  { whiteKing: "a1", blackKing: "h8", startKnight: "b1", targetSquares: ["c3", "d5", "f4"] },
  { whiteKing: "a1", blackKing: "h8", startKnight: "g5", targetSquares: ["e4", "f6", "h7"] },
];

const KNIGHT_GYM_RECOMMENDED_FOR = ["intro", "beginner", "early_intermediate", "intermediate", "advanced", "expert"] as const;

function difficultyRank(difficulty: DailyBlundrMiniGameCard["miniGame"]["difficulty"]): number {
  if (difficulty === "intro") return 0;
  if (difficulty === "beginner") return 1;
  if (difficulty === "early_intermediate") return 2;
  if (difficulty === "intermediate") return 3;
  if (difficulty === "advanced") return 4;
  return 5;
}

function buildBoardFen(pieces: Array<{ square: string; piece: string }>, sideToMove: "w" | "b" = "w"): string {
  const board = Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => ""));
  const place = (square: string, piece: string) => {
    const file = square.toLowerCase().charCodeAt(0) - 97;
    const rank = 8 - Number(square.slice(1));
    if (file < 0 || file > 7 || rank < 0 || rank > 7) return;
    board[rank][file] = piece;
  };
  for (const entry of pieces) place(entry.square, entry.piece);
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

function isValidSetup(scenario: KnightGymScenario): boolean {
  try {
    const chess = new Chess(
      buildBoardFen([
        { square: scenario.whiteKing, piece: "K" },
        { square: scenario.blackKing, piece: "k" },
        { square: scenario.startKnight, piece: "N" },
        ...scenario.targetSquares.map((square) => ({ square, piece: "p" })),
      ]),
    );
    return Boolean(chess.get(scenario.whiteKing as never) && chess.get(scenario.blackKing as never) && chess.get(scenario.startKnight as never));
  } catch {
    return false;
  }
}

function selectScenario(ctx: DailyMiniGameGenerationContext): KnightGymScenario {
  const rank = difficultyRank(ctx.difficulty);
  const eligible = KNIGHT_GYM_SCENARIOS.filter((_, index) => index <= Math.max(0, Math.min(KNIGHT_GYM_SCENARIOS.length - 1, rank + 1)));
  const pool = eligible.length ? eligible : KNIGHT_GYM_SCENARIOS.slice(0, 1);
  const seed = hashString(`${ctx.dateKey}|knight_gymnasium|${ctx.difficulty}|${ctx.currentMastery.toFixed(2)}|${ctx.confidence.toFixed(2)}`);
  return pool[Number.parseInt(seed, 36) % pool.length];
}

function shortestKnightPath(start: string, targets: readonly string[]): number {
  const uniqueTargets = Array.from(new Set(targets.map((target) => target.toLowerCase())));
  const targetIndex = new Map(uniqueTargets.map((target, index) => [target, index]));
  const allMask = (1 << uniqueTargets.length) - 1;
  if (allMask === 0) return 0;

  const queue: Array<{ square: string; mask: number; distance: number }> = [{ square: start.toLowerCase(), mask: 0, distance: 0 }];
  const seen = new Set<string>([`${start.toLowerCase()}|0`]);
  const knightOffsets = [
    [1, 2],
    [2, 1],
    [2, -1],
    [1, -2],
    [-1, -2],
    [-2, -1],
    [-2, 1],
    [-1, 2],
  ];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.mask === allMask) return current.distance;
    const coords = squareToCoords(current.square);
    for (const [fileDelta, rankDelta] of knightOffsets) {
      const nextSquare = coordsToSquare(coords.file + fileDelta, coords.rank + rankDelta);
      const targetBit = targetIndex.has(nextSquare) ? 1 << targetIndex.get(nextSquare)! : 0;
      const nextMask = current.mask | targetBit;
      const key = `${nextSquare}|${nextMask}`;
      if (seen.has(key)) continue;
      seen.add(key);
      queue.push({ square: nextSquare, mask: nextMask, distance: current.distance + 1 });
    }
  }

  return uniqueTargets.length * 2;
}

function buildKnightGymState(ctx: DailyMiniGameGenerationContext, scenario: KnightGymScenario): DailyMiniGameState {
  const targetSquares = Array.from(new Set(scenario.targetSquares.map((square) => square.toLowerCase())));
  const startFen = buildBoardFen([
    { square: scenario.whiteKing, piece: "K" },
    { square: scenario.blackKing, piece: "k" },
    { square: scenario.startKnight, piece: "N" },
    ...targetSquares.map((square) => ({ square, piece: "p" })),
  ]);
  const bestKnownScore = shortestKnightPath(scenario.startKnight, targetSquares);
  const moveLimit = Math.max(2, bestKnownScore + (ctx.difficulty === "intro" ? 2 : ctx.difficulty === "beginner" ? 1 : 0));
  const formationHash = hashString(`${scenario.startKnight}|${targetSquares.join(",")}|${moveLimit}|${ctx.difficulty}`);
  const noveltyKey = `knight_gymnasium:${formationHash}`;
  return {
    miniGameId: "knight_gymnasium",
    skillIds: ["knight_geometry", "shortest_path"],
    difficulty: ctx.difficulty,
    startFen,
    currentFen: startFen,
    sideToMove: "w",
    learnerSide: "white",
    targetSquares,
    flagSquares: targetSquares,
    moveLimit,
    plyCount: 0,
    bestKnownScore,
    completed: false,
    won: false,
    formationHash,
    noveltyKey,
  };
}

function applyMove(fen: string, from: string, to: string): { chess: Chess; move: Move | null } {
  const chess = new Chess(fen);
  const move = chess.move({
    from: from as never,
    to: to as never,
  });
  return { chess, move };
}

function resolveCardMove(move: Move | null): string {
  if (!move) return "";
  return `${move.from}${move.to}${move.promotion ?? ""}`;
}

export function generateKnightGymnasiumMiniGameCard(ctx: DailyMiniGameGenerationContext): DailyBlundrMiniGameCard | null {
  const scenario = selectScenario(ctx);
  if (!isValidSetup(scenario)) return null;
  const state = buildKnightGymState(ctx, scenario);
  const mastery = Math.max(0, Math.min(1, ctx.currentMastery));
  const confidence = Math.max(0, Math.min(1, ctx.confidence));
  return attachConceptTagsToDailyCard({
    source: "daily_attempt",
    cardKey: `mini:knight_gymnasium:${state.formationHash}`,
    positionKey: state.formationHash,
    fen: state.currentFen,
    expectedMoveUci: null,
    expectedMoveSan: null,
    playedMoveUci: null,
    playedMoveSan: null,
    openingId: null,
    openingName: "Knight Gymnasium",
    patternId: "mini:knight_gymnasium",
    concept: "knight_geometry",
    count: 1,
    weight: 1.3 + (1 - mastery) * 0.55,
    lastSeenAt: ctx.mastery?.records["mini:knight_gymnasium:knight_geometry"]?.lastSeenAt ?? null,
    note: `Targets ${state.targetSquares?.join(", ") ?? "unknown"}`,
    signals: [
      "mini_game",
      "mini:knight_gymnasium",
      "skill:knight_geometry",
      "skill:shortest_path",
      `targets:${state.targetSquares?.length ?? 0}`,
      `novelty:${state.noveltyKey}`,
    ],
    masteryTargets: [
      { conceptKey: "mini:knight_gymnasium:knight_geometry", domain: "mini_game", label: "Knight geometry", difficultyHint: state.difficulty },
      { conceptKey: "mini:knight_gymnasium:shortest_path", domain: "mini_game", label: "Shortest path", difficultyHint: state.difficulty },
    ],
    confidence: mastery >= 0.8 && confidence >= 0.6 ? "high" : mastery >= 0.35 ? "medium" : "low",
    difficulty: state.difficulty,
    id: `mini:knight_gymnasium:${state.formationHash}`,
    kind: "mini_game",
    title: "Knight Gymnasium",
    prompt: `Capture every flagged square with the knight in ${state.moveLimit} moves or fewer.`,
    repertoireId: null,
    reviewCardId: null,
    reviewDedupeKey: null,
    reviewPromptKind: null,
    reviewStatus: null,
    reviewDueAt: null,
    deckRank: 1,
    priority: Math.round((1 - mastery) * 75 + (1 - confidence) * 20 + difficultyRank(state.difficulty) * 3 + 8),
    masteryKey: `mini:knight_gymnasium:${state.formationHash}`,
    sourceCount: 1,
    summary: `Knight route with ${state.targetSquares?.length ?? 0} target${(state.targetSquares?.length ?? 0) === 1 ? "" : "s"}`,
    miniGame: state,
  }, inferConceptTagsForMiniGame("knight_gymnasium", state.skillIds));
}

function updateCapturedTargets(state: DailyMiniGameState, destination: string): string[] {
  if (!(state.targetSquares ?? []).includes(destination)) return state.capturedTargetSquares ?? [];
  return Array.from(new Set([...(state.capturedTargetSquares ?? []), destination]));
}

export function advanceKnightGymnasiumMiniGame(state: DailyMiniGameState, attempt: { from: string; to: string; uci: string; san: string | null; legal: boolean }): DailyMiniGameAdvanceResult {
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
        objectiveCount: Math.max(1, state.targetSquares?.length ?? 1),
        objectivesCompleted: state.won ? Math.max(1, state.targetSquares?.length ?? 1) : 0,
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
        objectiveCount: Math.max(1, state.targetSquares?.length ?? 1),
        objectivesCompleted: 0,
        reason: "illegal_move_attempt",
      },
    };
  }

  const whiteMove = applyMove(state.currentFen, attempt.from, attempt.to);
  if (!whiteMove.move || whiteMove.move.piece !== "n" || whiteMove.move.color !== "w") {
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
        objectiveCount: Math.max(1, state.targetSquares?.length ?? 1),
        objectivesCompleted: 0,
        reason: "illegal_move_attempt",
      },
    };
  }

  const capturedTargets = updateCapturedTargets(state, whiteMove.move.to.toLowerCase());
  const completedTargets = capturedTargets.length >= (state.targetSquares?.length ?? 0);
  const nextFen = whiteMove.chess.fen();
  if (completedTargets) {
    const nextState: DailyMiniGameState = {
      ...state,
      currentFen: nextFen,
      sideToMove: "w",
      plyCount: moveCount,
      completed: true,
      won: true,
      capturedTargetSquares: capturedTargets,
      lastMoveUci: attempt.uci,
      lastMoveSan: whiteMove.move.san ?? attempt.san,
    };
    return {
      state: nextState,
      completed: true,
      won: true,
      legal: true,
      reason: "targets_captured",
      attemptedMoveUci: attempt.uci,
      attemptedMoveSan: whiteMove.move.san ?? attempt.san,
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
        objectiveCount: Math.max(1, state.targetSquares?.length ?? 1),
        objectivesCompleted: Math.max(1, state.targetSquares?.length ?? 1),
        reason: "targets_captured",
      },
    };
  }

  if (moveCount >= state.moveLimit) {
    const nextState: DailyMiniGameState = {
      ...state,
      currentFen: nextFen,
      sideToMove: "w",
      plyCount: moveCount,
      completed: true,
      won: false,
      capturedTargetSquares: capturedTargets,
      lastMoveUci: attempt.uci,
      lastMoveSan: whiteMove.move.san ?? attempt.san,
    };
    return {
      state: nextState,
      completed: true,
      won: false,
      legal: true,
      reason: "move_limit_exceeded",
      attemptedMoveUci: attempt.uci,
      attemptedMoveSan: whiteMove.move.san ?? attempt.san,
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
        objectiveCount: Math.max(1, state.targetSquares?.length ?? 1),
        objectivesCompleted: capturedTargets.length,
        reason: "move_limit_exceeded",
      },
    };
  }

  const nextState: DailyMiniGameState = {
    ...state,
    currentFen: nextFen,
    sideToMove: "w",
    plyCount: moveCount,
    completed: false,
    won: false,
    capturedTargetSquares: capturedTargets,
    lastMoveUci: attempt.uci,
    lastMoveSan: whiteMove.move.san ?? attempt.san,
  };
  return {
    state: nextState,
    completed: false,
    won: false,
    legal: true,
    reason: "continue",
    attemptedMoveUci: attempt.uci,
    attemptedMoveSan: whiteMove.move.san ?? attempt.san,
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
      objectiveCount: Math.max(1, state.targetSquares?.length ?? 1),
      objectivesCompleted: capturedTargets.length,
      reason: "continue",
    },
  };
}

export const knightGymnasiumDefinition: DailyMiniGameDefinition = {
  id: "knight_gymnasium",
  title: "Knight Gymnasium",
  summary: "Take the knight through a shortest-path drill and clear the flagged squares.",
  skillIds: ["knight_geometry", "shortest_path"],
  recommendedFor: [...KNIGHT_GYM_RECOMMENDED_FOR],
  generate: generateKnightGymnasiumMiniGameCard,
  scoreAttempt: (args) => scoreDailyMiniGameAttempt(args),
};
