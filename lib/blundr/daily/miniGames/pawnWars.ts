import { Chess, type Move } from "chess.js";
import type {
  DailyBlundrMiniGameCard,
  DailyMiniGameAdvanceResult,
  DailyMiniGameDefinition,
  DailyMiniGameGenerationContext,
  DailyMiniGameScenario,
  DailyMiniGameState,
} from "./dailyMiniGameTypes";
import { scoreDailyMiniGameAttempt } from "./dailyMiniGameScoring";
import { hashString, normalizeText, squareToCoords } from "./miniGameUtils";
import { enumerateMiniGameTransforms, hashTransformSelection, transformSquare } from "./miniGameScenarioTransforms";
import { attachConceptTagsToDailyCard, inferConceptTagsForMiniGame } from "../concepts/dailyConceptTagging";

type PawnWarsObjective = "promotion" | "passed_pawn";

type PawnWarsScenario = {
  whiteKing: string;
  blackKing: string;
  whitePawn: string;
  blackPawns: string[];
  objective: PawnWarsObjective;
  goalSquare: string;
};

const PAWN_WARS_SCENARIOS: PawnWarsScenario[] = [
  { whiteKing: "a1", blackKing: "h8", whitePawn: "e7", blackPawns: ["d6"], objective: "promotion", goalSquare: "e8" },
  { whiteKing: "a1", blackKing: "h8", whitePawn: "c5", blackPawns: ["b6", "d6"], objective: "passed_pawn", goalSquare: "c6" },
  { whiteKing: "a1", blackKing: "h8", whitePawn: "g7", blackPawns: ["f6"], objective: "promotion", goalSquare: "g8" },
  { whiteKing: "a1", blackKing: "h8", whitePawn: "b5", blackPawns: ["a6", "c6"], objective: "passed_pawn", goalSquare: "b6" },
  { whiteKing: "a1", blackKing: "h8", whitePawn: "d7", blackPawns: ["c6", "e6"], objective: "promotion", goalSquare: "d8" },
];

const PAWN_WARS_RECOMMENDED_FOR = ["intro", "beginner", "early_intermediate", "intermediate", "advanced", "expert"] as const;

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

function uniqueText(values: readonly (string | null | undefined)[]): string[] {
  return Array.from(new Set(values.map((value) => normalizeText(value)).filter(Boolean)));
}

function buildScenarioKey(scenario: PawnWarsScenario, source: string): string {
  return hashString([scenario.whiteKing, scenario.blackKing, scenario.whitePawn, scenario.blackPawns.join(","), scenario.objective, scenario.goalSquare, source].join("|"));
}

function weightedSeedValue(value: string): number {
  let total = 0;
  for (let index = 0; index < value.length; index += 1) {
    total = (total + value.charCodeAt(index) * (index + 1)) % 1_000_000_007;
  }
  return total;
}

function resolveScenarioSeed(ctx: DailyMiniGameGenerationContext): string {
  const explicitSeed = normalizeText(ctx.seed);
  if (explicitSeed) return explicitSeed;
  return hashString([ctx.dateKey, ctx.userIdOrLocalId ?? "local", ctx.deckId ?? "deck", ctx.source ?? "daily_deck", "pawn_wars", ctx.difficulty].join("|"));
}

function isValidSetup(scenario: PawnWarsScenario): boolean {
  try {
    const chess = new Chess(
      buildBoardFen([
        { square: scenario.whiteKing, piece: "K" },
        { square: scenario.blackKing, piece: "k" },
        { square: scenario.whitePawn, piece: "P" },
        ...scenario.blackPawns.map((square) => ({ square, piece: "p" })),
      ]),
    );
    return Boolean(chess.get(scenario.whiteKing as never) && chess.get(scenario.blackKing as never) && chess.get(scenario.whitePawn as never));
  } catch {
    return false;
  }
}

function selectScenario(ctx: DailyMiniGameGenerationContext): PawnWarsScenario {
  const rank = difficultyRank(ctx.difficulty);
  const eligible = PAWN_WARS_SCENARIOS.filter((_, index) => index <= Math.max(0, Math.min(PAWN_WARS_SCENARIOS.length - 1, rank + 1)));
  const pool = eligible.length ? eligible : PAWN_WARS_SCENARIOS.slice(0, 1);
  const source = ctx.source ?? "daily_deck";
  const recentScenarioKeys = new Set((ctx.recentScenarioKeys ?? []).map((value) => normalizeText(value)).filter(Boolean));
  const variants = pool.flatMap((scenario) => {
    const transforms = enumerateMiniGameTransforms([scenario.whitePawn, ...scenario.blackPawns, scenario.goalSquare], {
      allowMirrorFiles: true,
      allowMirrorRanks: false,
      maxFileDelta: 3,
      maxRankDelta: 2,
    });
    return transforms
      .map((transform) => transformPawnWarsScenario(scenario, transform))
      .filter((entry): entry is PawnWarsScenario => Boolean(entry) && isValidSetup(entry));
  });
  if (!variants.length) {
    return pool[0] ?? PAWN_WARS_SCENARIOS[0];
  }
  const seed = resolveScenarioSeed(ctx);
  const ranked = variants
    .map((scenario, index) => {
      const key = buildScenarioKey(scenario, source);
      const recentIndex = Array.from(recentScenarioKeys).indexOf(key);
      const recencyPenalty = recentIndex >= 0 ? (recentScenarioKeys.size - recentIndex) * 1_000_000 : 0;
      const score = hashTransformSelection(seed, `${key}|pawn_wars`, index) + recencyPenalty;
      return { scenario, score, key };
    })
    .sort((a, b) => a.score - b.score || a.key.localeCompare(b.key));
  for (const entry of ranked) {
    if (!recentScenarioKeys.has(entry.key)) return entry.scenario;
  }
  return ranked[0]?.scenario ?? pool[0] ?? PAWN_WARS_SCENARIOS[0];
}

function transformPawnWarsScenario(scenario: PawnWarsScenario, transform: Parameters<typeof transformSquare>[1]): PawnWarsScenario | null {
  const whitePawn = transformSquare(scenario.whitePawn, transform);
  const goalSquare = transformSquare(scenario.goalSquare, transform);
  const blackPawns = scenario.blackPawns.map((square) => transformSquare(square, transform));
  if (!whitePawn || !goalSquare || blackPawns.some((square) => !square)) return null;
  return {
    whiteKing: scenario.whiteKing,
    blackKing: scenario.blackKing,
    whitePawn,
    blackPawns: blackPawns.filter((square): square is string => Boolean(square)),
    objective: scenario.objective,
    goalSquare,
  };
}

function resolveSolutionMove(fen: string, scenario: PawnWarsScenario): { from: string; to: string; uci: string; san: string | null } | null {
  try {
    const chess = new Chess(fen);
    const goalSquare = scenario.goalSquare.toLowerCase();
    const moves = chess.moves({ verbose: true }) as Move[];
    const preferred = moves.find((move) => move.piece === "p" && move.color === "w" && move.to.toLowerCase() === goalSquare) ?? moves.find((move) => move.piece === "p" && move.color === "w");
    if (!preferred) return null;
    const applied = applyMove(fen, preferred.from, preferred.to);
    if (!applied.move) return null;
    return {
      from: applied.move.from,
      to: applied.move.to,
      uci: `${applied.move.from}${applied.move.to}${applied.move.promotion ?? ""}`,
      san: applied.move.san ?? null,
    };
  } catch {
    return null;
  }
}

function startRank(square: string): number {
  return Number(square.slice(1));
}

function fileIndex(square: string): number {
  return square.toLowerCase().charCodeAt(0) - 97;
}

function computeBestKnownMoves(scenario: PawnWarsScenario): number {
  const start = startRank(scenario.whitePawn);
  const goal = startRank(scenario.goalSquare);
  const base = Math.max(1, goal - start);
  return scenario.objective === "promotion" ? Math.max(1, base - (start === 2 ? 1 : 0)) : Math.max(1, base - (start === 2 ? 1 : 0));
}

function findWhitePawnSquare(chess: Chess): string | null {
  const board = chess.board();
  for (let rank = 0; rank < board.length; rank += 1) {
    for (let file = 0; file < board[rank].length; file += 1) {
      const piece = board[rank][file];
      if (piece?.type === "p" && piece.color === "w") {
        return `${String.fromCharCode(97 + file)}${8 - rank}`;
      }
    }
  }
  return null;
}

function collectBlackPawns(chess: Chess): string[] {
  const squares: string[] = [];
  const board = chess.board();
  for (let rank = 0; rank < board.length; rank += 1) {
    for (let file = 0; file < board[rank].length; file += 1) {
      const piece = board[rank][file];
      if (piece?.type === "p" && piece.color === "b") {
        squares.push(`${String.fromCharCode(97 + file)}${8 - rank}`);
      }
    }
  }
  return squares;
}

function isPassedPawn(chess: Chess, whitePawnSquare: string): boolean {
  const file = fileIndex(whitePawnSquare);
  const rank = startRank(whitePawnSquare);
  for (const blackPawn of collectBlackPawns(chess)) {
    const blackFile = fileIndex(blackPawn);
    const blackRank = startRank(blackPawn);
    if (Math.abs(blackFile - file) <= 1 && blackRank > rank) {
      return false;
    }
  }
  return true;
}

function applyMove(fen: string, from: string, to: string): { chess: Chess; move: Move | null } {
  const chess = new Chess(fen);
  const move = chess.move({
    from: from as never,
    to: to as never,
    promotion: "q",
  });
  return { chess, move };
}

function scoreBlackMove(move: Move, whitePawnSquare: string | null): number {
  const toRank = startRank(move.to);
  const fileAlignment = whitePawnSquare ? Math.abs(fileIndex(move.to) - fileIndex(whitePawnSquare)) : 0;
  const captureBonus = move.captured === "p" ? -100 : 0;
  const promotionBonus = move.promotion ? -90 : 0;
  const filePressure = whitePawnSquare ? fileAlignment * 2 : 0;
  return captureBonus + promotionBonus + toRank * 4 + filePressure;
}

function selectBlackReply(chess: Chess, whitePawnSquare: string | null): Move | null {
  const moves = chess.moves({ verbose: true }) as Move[];
  if (!moves.length) return null;
  return [...moves]
    .sort((a, b) => scoreBlackMove(a, whitePawnSquare) - scoreBlackMove(b, whitePawnSquare) || `${a.from}${a.to}${a.promotion ?? ""}`.localeCompare(`${b.from}${b.to}${b.promotion ?? ""}`))
    [0] ?? null;
}

function buildPawnWarsState(ctx: DailyMiniGameGenerationContext, scenario: PawnWarsScenario): DailyMiniGameState {
  const startFen = buildBoardFen([
    { square: scenario.whiteKing, piece: "K" },
    { square: scenario.blackKing, piece: "k" },
    { square: scenario.whitePawn, piece: "P" },
    ...scenario.blackPawns.map((square) => ({ square, piece: "p" })),
  ]);
  const bestKnownScore = computeBestKnownMoves(scenario);
  const moveLimit = Math.max(2, bestKnownScore + (ctx.difficulty === "intro" ? 2 : ctx.difficulty === "beginner" ? 1 : 0));
  const formationHash = hashString(`${scenario.whitePawn}|${scenario.blackPawns.join(",")}|${scenario.goalSquare}|${scenario.objective}|${moveLimit}|${ctx.difficulty}`);
  const noveltyKey = `pawn_wars:${formationHash}`;
  return {
    miniGameId: "pawn_wars",
    skillIds: ["pawn_race", "promotion", "passed_pawn"],
    difficulty: ctx.difficulty,
    startFen,
    currentFen: startFen,
    sideToMove: "w",
    learnerSide: "white",
    goalSquares: [scenario.goalSquare],
    targetSquares: scenario.blackPawns.slice(),
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

export function generatePawnWarsMiniGameCard(ctx: DailyMiniGameGenerationContext): DailyBlundrMiniGameCard | null {
  const scenario = selectScenario(ctx);
  if (!isValidSetup(scenario)) return null;
  const state = buildPawnWarsState(ctx, scenario);
  const source = ctx.source ?? "daily_deck";
  const seed = resolveScenarioSeed(ctx);
  const solution = resolveSolutionMove(state.startFen, scenario);
  if (!solution) return null;
  const recentScenarioKeys = uniqueText(ctx.recentScenarioKeys ?? []);
  const scenarioKey = buildScenarioKey(scenario, source);
  const scenarioContract: DailyMiniGameScenario = {
    id: `mini:pawn_wars:${state.formationHash}`,
    miniGameId: "pawn_wars",
    source,
    seed,
    generatedAt: ctx.now,
    createdAt: ctx.now,
    fen: state.startFen,
    sideToMove: state.sideToMove,
    prompt: scenario.objective === "promotion"
      ? `Promote the pawn on the ${scenario.whitePawn[0]}-file by moving to ${scenario.goalSquare}.`
      : `Create a passed pawn by moving to ${scenario.goalSquare}.`,
    instructions: `Tap the white pawn, then ${scenario.goalSquare}.`,
    goal: `Reach ${scenario.goalSquare}.`,
    acceptedMoves: [solution.uci],
    solution: {
      uci: solution.uci,
      san: solution.san,
    },
    explanation: scenario.objective === "promotion"
      ? `Advance the pawn to ${scenario.goalSquare} and promote before the defense can stop it.`
      : `Advance to ${scenario.goalSquare} to create the passed pawn and win the race.`,
    conceptTags: uniqueText([
      ...inferConceptTagsForMiniGame("pawn_wars", state.skillIds),
      "pawn race",
      scenario.objective,
      scenario.whitePawn[0] ?? "",
    ]),
    difficulty: state.difficulty,
    estimatedTimeSeconds: 30,
    validation: {
      checkedAt: ctx.now,
      valid: true,
      attempts: 1,
      issues: [],
    },
    scoring: {
      mode: "single_move",
      maxAttempts: Math.max(1, state.moveLimit),
      revealPenalty: 0.1,
      canRetry: true,
      correctMoveReward: 1,
    },
    retryBehavior: {
      allowRetry: true,
      refreshSeedOnRetry: true,
      nextLabel: "Next",
    },
    revealBehavior: {
      revealLabel: "Reveal",
      continueLabel: "Continue",
      showAnswerLabel: null,
      markReviewedLabel: null,
    },
    novelty: {
      scenarioKey,
      cooldownGroup: "pawn_wars",
      recentScenarioKeys,
      avoidedRepeat: recentScenarioKeys.includes(scenarioKey),
    },
    theme: scenario.objective === "promotion" ? "promotion race" : "passed pawn race",
    targetSquares: [scenario.goalSquare],
    goalSquares: [scenario.goalSquare],
    acceptedSquares: [scenario.goalSquare],
    boardOrientationHint: ctx.boardPreferences?.boardOrientation ?? "auto",
    candidateMoves: (() => {
      try {
        const chess = new Chess(state.startFen);
        return (chess.moves({ verbose: true }) as Move[]).map((move) => ({
          uci: `${move.from}${move.to}${move.promotion ?? ""}`,
          san: move.san ?? null,
          label: move.to.toLowerCase() === scenario.goalSquare.toLowerCase() ? "Reach the goal square" : `Pawn move to ${move.to}`,
          correct: move.to.toLowerCase() === scenario.goalSquare.toLowerCase(),
        }));
      } catch {
        return [{ uci: solution.uci, san: solution.san, label: "Reach the goal square", correct: true }];
      }
    })(),
  };
  state.scenario = scenarioContract;
  state.noveltyKey = scenarioContract.novelty.scenarioKey;
  const mastery = Math.max(0, Math.min(1, ctx.currentMastery));
  const confidence = Math.max(0, Math.min(1, ctx.confidence));
  const fileLabel = scenario.whitePawn[0].toUpperCase();
  return attachConceptTagsToDailyCard({
    source: "daily_attempt",
    cardKey: `mini:pawn_wars:${state.formationHash}`,
    positionKey: state.formationHash,
    fen: state.currentFen,
    expectedMoveUci: null,
    expectedMoveSan: null,
    playedMoveUci: null,
    playedMoveSan: null,
    openingId: null,
    openingName: "Pawn Wars",
    patternId: "mini:pawn_wars",
    concept: scenario.objective === "promotion" ? "promotion" : "passed_pawn",
    count: 1,
    weight: 1.25 + (1 - mastery) * 0.6,
    lastSeenAt: ctx.mastery?.records["mini:pawn_wars:pawn_race"]?.lastSeenAt ?? null,
    note: `${scenario.objective} on the ${fileLabel}-file`,
    signals: [
      "mini_game",
      "mini:pawn_wars",
      "skill:pawn_race",
      "skill:promotion",
      "skill:passed_pawn",
      `objective:${scenario.objective}`,
      `file:${scenario.whitePawn[0]}`,
      `novelty:${state.noveltyKey}`,
    ],
    masteryTargets: [
      { conceptKey: "mini:pawn_wars:pawn_race", domain: "mini_game", label: "Pawn race", difficultyHint: state.difficulty },
      { conceptKey: "mini:pawn_wars:promotion", domain: "mini_game", label: "Promotion", difficultyHint: state.difficulty },
      { conceptKey: "mini:pawn_wars:passed_pawn", domain: "mini_game", label: "Passed pawn", difficultyHint: state.difficulty },
    ],
    confidence: mastery >= 0.8 && confidence >= 0.6 ? "high" : mastery >= 0.35 ? "medium" : "low",
    difficulty: state.difficulty,
    id: `mini:pawn_wars:${state.formationHash}`,
    kind: "mini_game",
    title: "Pawn Wars",
    prompt: scenario.objective === "promotion"
      ? `Promote the pawn on the ${scenario.whitePawn[0]}-file before the reply stops the race.`
      : `Build a passed pawn on the ${scenario.goalSquare} square before the blockade closes.`,
    repertoireId: null,
    reviewCardId: null,
    reviewDedupeKey: null,
    reviewPromptKind: null,
    reviewStatus: null,
    reviewDueAt: null,
    deckRank: 1,
    priority: Math.round((1 - mastery) * 75 + (1 - confidence) * 18 + difficultyRank(state.difficulty) * 4 + 9),
    masteryKey: `mini:pawn_wars:${state.formationHash}`,
    sourceCount: 1,
    summary: scenario.objective === "promotion"
      ? `Promotion race on the ${scenario.whitePawn[0]}-file`
      : `Passed pawn on the ${scenario.whitePawn[0]}-file`,
    miniGame: state,
  }, inferConceptTagsForMiniGame("pawn_wars", state.skillIds));
}

function createFailedState(state: DailyMiniGameState, moveCount: number, reason: string, lastMoveUci: string, lastMoveSan: string | null, currentFen: string, capturedTargetSquares: string[] = []): DailyMiniGameState {
  return {
    ...state,
    currentFen,
    sideToMove: "w",
    plyCount: moveCount,
    completed: true,
    won: false,
    capturedTargetSquares,
    lastMoveUci,
    lastMoveSan,
  };
}

export function advancePawnWarsMiniGame(state: DailyMiniGameState, attempt: { from: string; to: string; uci: string; san: string | null; legal: boolean }): DailyMiniGameAdvanceResult {
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
    const nextState = createFailedState(state, moveCount, "illegal_move_attempt", attempt.uci, attempt.san, state.currentFen);
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

  const whiteMove = applyMove(state.currentFen, attempt.from, attempt.to);
  if (!whiteMove.move || whiteMove.move.piece !== "p" || whiteMove.move.color !== "w") {
    const nextState = createFailedState(state, moveCount, "illegal_move_attempt", attempt.uci, attempt.san, state.currentFen);
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

  const nextFenAfterWhite = whiteMove.chess.fen();
  const destination = whiteMove.move.to.toLowerCase();
  const promotion = Boolean(whiteMove.move.promotion);
  const whitePawnSquare = promotion ? null : destination;
  const passed = whitePawnSquare ? isPassedPawn(whiteMove.chess, whitePawnSquare) : true;
  const promotionReached = promotion || Number(destination.slice(1)) === 8;
  const objectiveReached = state.goalSquares?.includes(destination) && passed;
  if (promotionReached || objectiveReached) {
    const nextState: DailyMiniGameState = {
      ...state,
      currentFen: nextFenAfterWhite,
      sideToMove: "w",
      plyCount: moveCount,
      completed: true,
      won: true,
      capturedTargetSquares: Array.from(new Set([...(state.capturedTargetSquares ?? []), ...(whiteMove.move.captured === "p" ? [whiteMove.move.to.toLowerCase()] : [])])),
      visitedGoalSquares: objectiveReached && whitePawnSquare ? Array.from(new Set([...(state.visitedGoalSquares ?? []), whitePawnSquare])) : state.visitedGoalSquares,
      lastMoveUci: attempt.uci,
      lastMoveSan: whiteMove.move.san ?? attempt.san,
    };
    return {
      state: nextState,
      completed: true,
      won: true,
      legal: true,
      reason: promotionReached ? "promotion_reached" : "passed_pawn_created",
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
        objectiveCount: 1,
        objectivesCompleted: 1,
        reason: promotionReached ? "promotion_reached" : "passed_pawn_created",
      },
    };
  }

  if (moveCount >= state.moveLimit) {
    const nextState = createFailedState(state, moveCount, "move_limit_exceeded", attempt.uci, whiteMove.move.san ?? attempt.san, nextFenAfterWhite);
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
        objectiveCount: 1,
        objectivesCompleted: 0,
        reason: "move_limit_exceeded",
      },
    };
  }

  const activeWhitePawnSquare = findWhitePawnSquare(whiteMove.chess);
  const blackReply = selectBlackReply(whiteMove.chess, activeWhitePawnSquare);
  if (!blackReply) {
    const nextState: DailyMiniGameState = {
      ...state,
      currentFen: nextFenAfterWhite,
      sideToMove: "w",
      plyCount: moveCount,
      completed: true,
      won: true,
      lastMoveUci: attempt.uci,
      lastMoveSan: whiteMove.move.san ?? attempt.san,
    };
    return {
      state: nextState,
      completed: true,
      won: true,
      legal: true,
      reason: "no_black_reply",
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
        objectiveCount: 1,
        objectivesCompleted: 1,
        reason: "no_black_reply",
      },
    };
  }

  const blackResult = whiteMove.chess.move({
    from: blackReply.from as never,
    to: blackReply.to as never,
    promotion: blackReply.promotion as never,
  });
  const blackFen = whiteMove.chess.fen();
  const blackPromoted = Boolean(blackReply.promotion);
  const blackCapturedWhitePawn = blackReply.captured === "p";

  if (blackPromoted || blackCapturedWhitePawn) {
    const nextState = createFailedState(state, moveCount, blackPromoted ? "blocked_by_promotion" : "white_pawn_captured", attempt.uci, whiteMove.move.san ?? attempt.san, blackFen);
    return {
      state: nextState,
      completed: true,
      won: false,
      legal: true,
      reason: blackPromoted ? "blocked_by_promotion" : "white_pawn_captured",
      attemptedMoveUci: attempt.uci,
      attemptedMoveSan: whiteMove.move.san ?? attempt.san,
      responseMoveUci: `${blackReply.from}${blackReply.to}${blackReply.promotion ?? ""}`,
      responseMoveSan: blackResult?.san ?? null,
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
        reason: blackPromoted ? "blocked_by_promotion" : "white_pawn_captured",
      },
    };
  }

  const nextState: DailyMiniGameState = {
    ...state,
    currentFen: blackFen,
    sideToMove: "w",
    plyCount: moveCount,
    completed: false,
    won: false,
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
    responseMoveUci: `${blackReply.from}${blackReply.to}${blackReply.promotion ?? ""}`,
    responseMoveSan: blackResult?.san ?? null,
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

export const pawnWarsDefinition: DailyMiniGameDefinition = {
  id: "pawn_wars",
  title: "Pawn Wars",
  summary: "Race a pawn through a defended structure and either promote or build an unstoppable passed pawn.",
  skillIds: ["pawn_race", "promotion", "passed_pawn"],
  recommendedFor: [...PAWN_WARS_RECOMMENDED_FOR],
  generate: generatePawnWarsMiniGameCard,
  scoreAttempt: (args) => scoreDailyMiniGameAttempt(args),
};
