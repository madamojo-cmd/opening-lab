import { Chess } from "chess.js";
import type { DailyBlundrDifficulty } from "../dailyBlundrTypes";
import type {
  DailyBlundrTrainingTargetCard,
  DailyTrainingTargetAdvanceResult,
  DailyTrainingTargetDefinition,
  DailyTrainingTargetGenerationContext,
  DailyTrainingTargetScoreInput,
  DailyTrainingTargetState,
} from "./dailyTrainingTargetTypes";
import {
  buildBoardFen,
  buildTrainingTargetCard,
  buildTrainingTargetMasteryTargets,
  buildTrainingTargetTrainingState,
  chooseTrainingTargetDifficulty,
  hashString,
  pickBestLegalMove,
  squareDistance,
} from "./trainingTargetUtils";
import { scoreDailyTrainingTargetAttempt } from "./dailyTrainingTargetScoring";
import { coordsToSquare, squareToCoords } from "./trainingTargetUtils";

type KeySquareScenario = {
  id: string;
  openingName: string;
  fen: string;
  prompt: string;
  correctSquares: string[];
};

const KEY_SQUARE_SCENARIOS: KeySquareScenario[] = [
  {
    id: "king_key",
    openingName: "King and Pawn",
    fen: buildBoardFen(
      [
        { square: "e4", piece: "K" },
        { square: "g8", piece: "k" },
        { square: "d4", piece: "P" },
      ],
      "w",
    ),
    prompt: "Click the key square.",
    correctSquares: ["d5"],
  },
  {
    id: "outpost",
    openingName: "Outpost Square",
    fen: buildBoardFen(
      [
        { square: "g1", piece: "K" },
        { square: "g8", piece: "k" },
        { square: "d5", piece: "N" },
        { square: "c6", piece: "p" },
        { square: "e6", piece: "p" },
      ],
      "w",
    ),
    prompt: "Click the outpost square.",
    correctSquares: ["d5"],
  },
  {
    id: "invasion",
    openingName: "Invasion Square",
    fen: buildBoardFen(
      [
        { square: "g1", piece: "K" },
        { square: "g8", piece: "k" },
        { square: "e1", piece: "R" },
        { square: "e7", piece: "p" },
        { square: "f7", piece: "p" },
      ],
      "w",
    ),
    prompt: "Click the invasion square.",
    correctSquares: ["e7"],
  },
  {
    id: "promotion_support",
    openingName: "Promotion Support",
    fen: buildBoardFen(
      [
        { square: "e4", piece: "K" },
        { square: "e8", piece: "k" },
        { square: "c6", piece: "P" },
      ],
      "w",
    ),
    prompt: "Click the support square for the passer.",
    correctSquares: ["c7"],
  },
];

function normalizeDifficultyRank(difficulty: DailyBlundrDifficulty): number {
  if (difficulty === "intro") return 0;
  if (difficulty === "beginner") return 1;
  if (difficulty === "early_intermediate") return 2;
  if (difficulty === "intermediate") return 3;
  if (difficulty === "advanced") return 4;
  return 5;
}

function selectScenario(ctx: DailyTrainingTargetGenerationContext): KeySquareScenario {
  const rank = Math.min(KEY_SQUARE_SCENARIOS.length - 1, Math.max(0, normalizeDifficultyRank(ctx.difficulty)));
  const pool = KEY_SQUARE_SCENARIOS.slice(0, Math.max(1, rank + 1));
  const seed = Number.parseInt(hashString(`${ctx.dateKey}|key_square_click|${ctx.difficulty}|${ctx.currentMastery.toFixed(2)}|${ctx.confidence.toFixed(2)}`), 36);
  return pool[(Number.isFinite(seed) ? seed : 0) % pool.length];
}

function buildKeySquareState(ctx: DailyTrainingTargetGenerationContext): DailyTrainingTargetState | null {
  const scenario = selectScenario(ctx);
  const difficulty = chooseTrainingTargetDifficulty(ctx.currentMastery, ctx.confidence, ctx.difficulty);
  const formationHash = hashString(`${scenario.id}|${scenario.fen}|${scenario.correctSquares.join(",")}|${difficulty}`);
  const autoSelected = pickBestLegalMove(scenario.fen, []);
  const sourceLabel = `${scenario.openingName}`;
  return buildTrainingTargetTrainingState({
    trainingTargetId: "key_square_click",
    skillIds: ["key_square_awareness", "square_control"],
    difficulty,
    interactionKind: "square_click",
    startFen: scenario.fen,
    currentFen: scenario.fen,
    learnerSide: new Chess(scenario.fen).turn() === "w" ? "white" : "black",
    sideToMove: new Chess(scenario.fen).turn(),
    prompt: scenario.prompt,
    targetSquares: scenario.correctSquares,
    correctSquareKeys: scenario.correctSquares,
    moveLimit: 1,
    plyCount: 0,
    bestKnownScore: 1,
    formationHash,
    noveltyKey: `key_square_click:${formationHash}`,
    sourceLabel,
    lastMoveUci: autoSelected ? `${autoSelected.from}${autoSelected.to}${autoSelected.promotion ?? ""}` : null,
    lastMoveSan: autoSelected?.san ?? null,
  });
}

function scoreAttempt(input: DailyTrainingTargetScoreInput) {
  return scoreDailyTrainingTargetAttempt(input);
}

export function generateKeySquareClickTrainingTargetCard(ctx: DailyTrainingTargetGenerationContext): DailyBlundrTrainingTargetCard | null {
  const state = buildKeySquareState(ctx);
  if (!state) return null;
  const currentMastery = Math.max(0, Math.min(1, ctx.currentMastery));
  const confidence = Math.max(0, Math.min(1, ctx.confidence));
  return buildTrainingTargetCard({
    source: "daily_attempt",
    cardKey: `target:key_square_click:${state.formationHash}`,
    positionKey: state.formationHash,
    fen: state.currentFen,
    expectedMoveUci: null,
    expectedMoveSan: null,
    playedMoveUci: null,
    playedMoveSan: null,
    openingId: null,
    openingName: "Key Square Click",
    patternId: "target:key_square_click",
    concept: "key_square_awareness",
    count: 1,
    weight: 1.08 + (1 - currentMastery) * 0.68,
    lastSeenAt: ctx.mastery?.records["target:key_square_click:key_square_awareness"]?.lastSeenAt ?? null,
    note: state.prompt,
    signals: [
      "training_target",
      "target:key_square_click",
      "skill:key_square_awareness",
      "skill:square_control",
      `prompt:${state.prompt}`,
      `novelty:${state.noveltyKey}`,
    ],
    masteryTargets: buildTrainingTargetMasteryTargets(
      "key_square_click",
      ["key_square_awareness", "square_control"],
      state.difficulty,
      ["Key square awareness", "Square control"],
    ),
    confidence: currentMastery >= 0.8 && confidence >= 0.6 ? "high" : currentMastery >= 0.35 ? "medium" : "low",
    difficulty: state.difficulty,
    id: `target:key_square_click:${state.formationHash}`,
    title: "Key Square Click",
    prompt: state.prompt,
    repertoireId: null,
    reviewCardId: null,
    reviewDedupeKey: null,
    reviewPromptKind: null,
    reviewStatus: null,
    reviewDueAt: null,
    deckRank: 1,
    priority: Math.round((1 - currentMastery) * 82 + (1 - confidence) * 10 + normalizeDifficultyRank(state.difficulty) * 4 + (ctx.dueReviewCount === 0 ? 10 : 2)),
    masteryKey: `target:key_square_click:${state.formationHash}`,
    sourceCount: 1,
    summary: state.prompt,
    trainingTarget: state,
  });
}

function findNearestCorrectSquare(correctSquares: readonly string[], clickedSquare: string): string | null {
  if (!correctSquares.length) return null;
  const normalizedClicked = clickedSquare.toLowerCase();
  return [...correctSquares].sort((a, b) => squareDistance(normalizedClicked, a) - squareDistance(normalizedClicked, b) || a.localeCompare(b))[0] ?? null;
}

export function advanceKeySquareClickTrainingTarget(
  state: DailyTrainingTargetState,
  attempt: { square?: string | null; usedReveal?: boolean },
): DailyTrainingTargetAdvanceResult {
  if (state.completed) {
    return {
      state,
      completed: true,
      won: Boolean(state.won),
      legal: false,
      reason: "training_target_already_completed",
      attemptedMoveUci: null,
      attemptedMoveSan: null,
      selectedSquare: attempt.square ?? null,
      moveCount: state.plyCount,
      illegalMoveCount: 0,
      scoreInput: {
        card: null,
        completed: true,
        won: Boolean(state.won),
        moveCount: state.plyCount,
        moveLimit: state.moveLimit ?? 1,
        bestKnownMoves: state.bestKnownScore ?? 1,
        illegalMoveCount: 0,
        blocked: false,
        perfectPath: Boolean(state.won),
        objectiveCount: 1,
        objectivesCompleted: state.won ? 1 : 0,
        usedReveal: Boolean(attempt.usedReveal),
        reason: "training_target_already_completed",
      },
    };
  }

  const clickedSquare = (attempt.square ?? "").trim().toLowerCase();
  const usedReveal = Boolean(attempt.usedReveal);
  if (!clickedSquare && usedReveal) {
    return {
      state: {
        ...state,
        completed: true,
        won: false,
      },
      completed: true,
      won: false,
      legal: true,
      reason: "reviewed_after_reveal",
      attemptedMoveUci: null,
      attemptedMoveSan: null,
      selectedSquare: null,
      moveCount: state.plyCount,
      illegalMoveCount: 0,
      scoreInput: {
        card: null,
        completed: true,
        won: false,
        moveCount: state.plyCount,
        moveLimit: state.moveLimit ?? 1,
        bestKnownMoves: state.bestKnownScore ?? 1,
        illegalMoveCount: 0,
        blocked: false,
        perfectPath: false,
        objectiveCount: 1,
        objectivesCompleted: 0,
        usedReveal: true,
        reason: "reviewed_after_reveal",
      },
    };
  }

  if (!clickedSquare) {
    return {
      state: {
        ...state,
        completed: true,
        won: false,
      },
      completed: true,
      won: false,
      legal: false,
      reason: "empty_square_click",
      attemptedMoveUci: null,
      attemptedMoveSan: null,
      selectedSquare: null,
      moveCount: state.plyCount,
      illegalMoveCount: 1,
      scoreInput: {
        card: null,
        completed: true,
        won: false,
        moveCount: state.plyCount,
        moveLimit: state.moveLimit ?? 1,
        bestKnownMoves: state.bestKnownScore ?? 1,
        illegalMoveCount: 1,
        blocked: false,
        perfectPath: false,
        objectiveCount: 1,
        objectivesCompleted: 0,
        usedReveal,
        reason: "empty_square_click",
      },
    };
  }

  const correctSquares = new Set((state.correctSquareKeys ?? state.targetSquares ?? []).map((square) => square.toLowerCase()));
  const isCorrect = correctSquares.has(clickedSquare);
  const nearestCorrectSquare = findNearestCorrectSquare(Array.from(correctSquares), clickedSquare);
  const nearby = !isCorrect && nearestCorrectSquare ? squareDistance(clickedSquare, nearestCorrectSquare) <= 1 : false;
  const nextState: DailyTrainingTargetState = {
    ...state,
    completed: true,
    won: isCorrect,
    plyCount: state.plyCount + 1,
    selectedSquares: [...(state.selectedSquares ?? []), clickedSquare],
  };

  return {
    state: nextState,
    completed: true,
    won: isCorrect,
    legal: true,
    reason: isCorrect ? "key_square_found" : nearby ? "nearby_square" : "wrong_square",
    attemptedMoveUci: null,
    attemptedMoveSan: null,
    selectedSquare: clickedSquare,
    moveCount: nextState.plyCount,
    illegalMoveCount: 0,
    scoreInput: {
      card: null,
      completed: true,
      won: isCorrect,
      moveCount: nextState.plyCount,
      moveLimit: state.moveLimit ?? 1,
      bestKnownMoves: state.bestKnownScore ?? 1,
      illegalMoveCount: 0,
      blocked: false,
      perfectPath: isCorrect && !usedReveal,
      objectiveCount: nearby && !isCorrect ? 2 : 1,
      objectivesCompleted: isCorrect ? 1 : nearby ? 1 : 0,
      usedReveal,
      reason: isCorrect ? "key_square_found" : nearby ? "nearby_square" : "wrong_square",
    },
  };
}

export const keySquareClickDefinition: DailyTrainingTargetDefinition = {
  id: "key_square_click",
  title: "Key Square Click",
  summary: "Tempo is training square awareness and control.",
  skillIds: ["key_square_awareness", "square_control"],
  recommendedFor: ["intro", "beginner", "early_intermediate", "intermediate", "advanced", "expert"],
  generate: generateKeySquareClickTrainingTargetCard,
  scoreAttempt: (input) => scoreDailyTrainingTargetAttempt(input),
};
