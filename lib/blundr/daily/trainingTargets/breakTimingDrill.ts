import { Chess } from "chess.js";
import type { DailyBlundrCard, DailyBlundrDifficulty } from "../dailyBlundrTypes";
import type {
  DailyBlundrTrainingTargetCard,
  DailyTrainingTargetAdvanceResult,
  DailyTrainingTargetDefinition,
  DailyTrainingTargetGenerationContext,
  DailyTrainingTargetScoreInput,
  DailyTrainingTargetState,
} from "./dailyTrainingTargetTypes";
import {
  applyMoveUci,
  buildBoardFen,
  buildCandidateMoves,
  buildTrainingTargetCard,
  buildTrainingTargetMasteryTargets,
  buildTrainingTargetTrainingState,
  chooseTrainingTargetDifficulty,
  getMoveSan,
  hashString,
  isPawnMove,
  moveToUci,
  pickDailyBlundrCard,
} from "./trainingTargetUtils";
import { scoreDailyTrainingTargetAttempt } from "./dailyTrainingTargetScoring";
import { gradeDailyBlundrMove } from "../dailyMoveGrader";

type BreakTimingScenario = {
  id: string;
  openingName: string;
  fen: string;
  correctMoveUci: string;
};

const BREAK_TIMING_SCENARIOS: BreakTimingScenario[] = [
  {
    id: "queen_break",
    openingName: "Queen's Gambit",
    fen: buildBoardFen(
      [
        { square: "g1", piece: "K" },
        { square: "g8", piece: "k" },
        { square: "c2", piece: "P" },
        { square: "d4", piece: "P" },
        { square: "e3", piece: "P" },
        { square: "c6", piece: "p" },
        { square: "d5", piece: "p" },
        { square: "e6", piece: "p" },
      ],
      "w",
    ),
    correctMoveUci: "c2c4",
  },
  {
    id: "center_break",
    openingName: "Center Break",
    fen: buildBoardFen(
      [
        { square: "g1", piece: "K" },
        { square: "g8", piece: "k" },
        { square: "c2", piece: "P" },
        { square: "d4", piece: "P" },
        { square: "e3", piece: "P" },
        { square: "f2", piece: "P" },
        { square: "c6", piece: "p" },
        { square: "d5", piece: "p" },
        { square: "e6", piece: "p" },
      ],
      "w",
    ),
    correctMoveUci: "e3e4",
  },
  {
    id: "file_break",
    openingName: "File Break",
    fen: buildBoardFen(
      [
        { square: "g1", piece: "K" },
        { square: "g8", piece: "k" },
        { square: "f2", piece: "P" },
        { square: "g2", piece: "P" },
        { square: "h2", piece: "P" },
        { square: "f7", piece: "p" },
        { square: "g7", piece: "p" },
        { square: "h7", piece: "p" },
      ],
      "w",
    ),
    correctMoveUci: "f2f4",
  },
  {
    id: "capture_break",
    openingName: "Capture Break",
    fen: buildBoardFen(
      [
        { square: "g1", piece: "K" },
        { square: "g8", piece: "k" },
        { square: "e4", piece: "P" },
        { square: "d5", piece: "p" },
        { square: "f6", piece: "p" },
      ],
      "w",
    ),
    correctMoveUci: "e4d5",
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

function selectSourceCard(ctx: DailyTrainingTargetGenerationContext): DailyBlundrCard | null {
  return pickDailyBlundrCard(
    ctx.candidateDailyCards,
    (card) => Boolean(card.expectedMoveUci && isPawnMove(card.fen, card.expectedMoveUci)),
    (card) => (card.priority ?? 0) + (card.source === "progress_mistake" ? 34 : card.source === "learning_event" ? 20 : 10),
  );
}

function selectFallbackScenario(ctx: DailyTrainingTargetGenerationContext): BreakTimingScenario {
  const rank = Math.min(BREAK_TIMING_SCENARIOS.length - 1, Math.max(0, normalizeDifficultyRank(ctx.difficulty)));
  const pool = BREAK_TIMING_SCENARIOS.slice(0, Math.max(1, rank + 1));
  const seed = Number.parseInt(hashString(`${ctx.dateKey}|break_timing_drill|${ctx.difficulty}|${ctx.currentMastery.toFixed(2)}|${ctx.confidence.toFixed(2)}`), 36);
  return pool[(Number.isFinite(seed) ? seed : 0) % pool.length];
}

function buildState(ctx: DailyTrainingTargetGenerationContext): { state: DailyTrainingTargetState | null; sourceCard: DailyBlundrCard | null; sourceLabel: string } {
  const sourceCard = selectSourceCard(ctx);
  if (sourceCard?.expectedMoveUci) {
    const difficulty = chooseTrainingTargetDifficulty(ctx.currentMastery, ctx.confidence, ctx.difficulty);
    const answerSan = getMoveSan(sourceCard.fen, sourceCard.expectedMoveUci);
    const formationHash = hashString(`break:${sourceCard.cardKey}|${sourceCard.fen}|${sourceCard.expectedMoveUci}|${difficulty}`);
    const candidateMoves = buildCandidateMoves(sourceCard.fen, sourceCard.expectedMoveUci, 4);
    return {
      sourceCard,
      sourceLabel: sourceCard.openingName || sourceCard.summary || "Daily opening",
      state: buildTrainingTargetTrainingState({
        trainingTargetId: "break_timing_drill",
        skillIds: ["break_timing", "pawn_break"],
        difficulty,
        interactionKind: candidateMoves.length > 1 ? "multiple_choice" : "move_input",
        startFen: sourceCard.fen,
        currentFen: sourceCard.fen,
        learnerSide: new Chess(sourceCard.fen).turn() === "w" ? "white" : "black",
        sideToMove: new Chess(sourceCard.fen).turn(),
        prompt: "Which break changes the position?",
        expectedMoveUci: sourceCard.expectedMoveUci,
        expectedMoveSan: answerSan,
        candidateMoves,
        moveLimit: 1,
        plyCount: 0,
        bestKnownScore: 1,
        formationHash,
        noveltyKey: `break_timing_drill:${formationHash}`,
        sourceCardKey: sourceCard.cardKey,
        sourceLabel: sourceCard.openingName || sourceCard.summary || "Daily opening",
      }),
    };
  }

  const scenario = selectFallbackScenario(ctx);
  const difficulty = chooseTrainingTargetDifficulty(ctx.currentMastery, ctx.confidence, ctx.difficulty);
  const candidateMoves = buildCandidateMoves(scenario.fen, scenario.correctMoveUci, 4);
  const formationHash = hashString(`${scenario.id}|${scenario.fen}|${scenario.correctMoveUci}|${difficulty}`);
  return {
    sourceCard: null,
    sourceLabel: scenario.openingName,
    state: buildTrainingTargetTrainingState({
      trainingTargetId: "break_timing_drill",
      skillIds: ["break_timing", "pawn_break"],
      difficulty,
      interactionKind: candidateMoves.length > 1 ? "multiple_choice" : "move_input",
      startFen: scenario.fen,
      currentFen: scenario.fen,
      learnerSide: new Chess(scenario.fen).turn() === "w" ? "white" : "black",
      sideToMove: new Chess(scenario.fen).turn(),
      prompt: "Which break changes the position?",
      expectedMoveUci: scenario.correctMoveUci,
      expectedMoveSan: getMoveSan(scenario.fen, scenario.correctMoveUci),
      candidateMoves,
      moveLimit: 1,
      plyCount: 0,
      bestKnownScore: 1,
      formationHash,
      noveltyKey: `break_timing_drill:${formationHash}`,
      sourceLabel: scenario.openingName,
    }),
  };
}

function scoreAttempt(input: DailyTrainingTargetScoreInput) {
  return scoreDailyTrainingTargetAttempt(input);
}

export function generateBreakTimingDrillTrainingTargetCard(ctx: DailyTrainingTargetGenerationContext): DailyBlundrTrainingTargetCard | null {
  const built = buildState(ctx);
  if (!built.state) return null;
  const state = built.state;
  const currentMastery = Math.max(0, Math.min(1, ctx.currentMastery));
  const confidence = Math.max(0, Math.min(1, ctx.confidence));
  return buildTrainingTargetCard({
    source: built.sourceCard?.source ?? "daily_attempt",
    cardKey: `target:break_timing_drill:${state.formationHash}`,
    positionKey: state.formationHash,
    fen: state.currentFen,
    expectedMoveUci: state.expectedMoveUci ?? null,
    expectedMoveSan: state.expectedMoveSan ?? null,
    playedMoveUci: null,
    playedMoveSan: null,
    openingId: built.sourceCard?.openingId ?? null,
    openingName: "Break Timing Drill",
    patternId: "target:break_timing_drill",
    concept: "break_timing",
    count: 1,
    weight: 1.12 + (1 - currentMastery) * 0.74,
    lastSeenAt: ctx.mastery?.records["target:break_timing_drill:break_timing"]?.lastSeenAt ?? null,
    note: built.sourceLabel,
    signals: [
      "training_target",
      "target:break_timing_drill",
      "skill:break_timing",
      "skill:pawn_break",
      built.sourceCard?.source ? `source:${built.sourceCard.source}` : "source:fallback",
      built.sourceLabel ? `opening:${built.sourceLabel}` : null,
      `novelty:${state.noveltyKey}`,
    ].filter((value): value is string => Boolean(value)),
    masteryTargets: buildTrainingTargetMasteryTargets(
      "break_timing_drill",
      ["break_timing", "pawn_break"],
      state.difficulty,
      ["Break timing", "Pawn break"],
    ),
    confidence: currentMastery >= 0.8 && confidence >= 0.6 ? "high" : currentMastery >= 0.35 ? "medium" : "low",
    difficulty: state.difficulty,
    id: `target:break_timing_drill:${state.formationHash}`,
    title: "Break Timing Drill",
    prompt: state.prompt,
    repertoireId: null,
    reviewCardId: null,
    reviewDedupeKey: null,
    reviewPromptKind: null,
    reviewStatus: null,
    reviewDueAt: null,
    deckRank: 1,
    priority: Math.round((1 - currentMastery) * 84 + (1 - confidence) * 10 + normalizeDifficultyRank(state.difficulty) * 3 + (ctx.dueReviewCount === 0 ? 9 : 1)),
    masteryKey: `target:break_timing_drill:${state.formationHash}`,
    sourceCount: 1,
    summary: built.sourceLabel ? `Break timing from ${built.sourceLabel}` : "Break timing drill",
    trainingTarget: state,
  });
}

function resolveAttemptMove(state: DailyTrainingTargetState, attempt: { from?: string | null; to?: string | null; uci?: string | null; san?: string | null; choiceUci?: string | null }) {
  const attemptedMove = attempt.choiceUci || attempt.uci || (attempt.from && attempt.to ? `${attempt.from}${attempt.to}` : null) || "";
  return gradeDailyBlundrMove({
    fen: state.currentFen,
    expectedMoveUci: state.expectedMoveUci ?? null,
    expectedMoveSan: state.expectedMoveSan ?? null,
    attemptedMove,
  });
}

function isRelatedPawnMove(state: DailyTrainingTargetState, moveUci: string | null | undefined): boolean {
  if (!moveUci) return false;
  return isPawnMove(state.currentFen, moveUci);
}

export function advanceBreakTimingDrillTrainingTarget(
  state: DailyTrainingTargetState,
  attempt: { from?: string | null; to?: string | null; uci?: string | null; san?: string | null; legal?: boolean; choiceUci?: string | null; usedReveal?: boolean },
): DailyTrainingTargetAdvanceResult {
  if (state.completed) {
    return {
      state,
      completed: true,
      won: Boolean(state.won),
      legal: false,
      reason: "training_target_already_completed",
      attemptedMoveUci: attempt.uci ?? attempt.choiceUci ?? null,
      attemptedMoveSan: attempt.san ?? null,
      responseMoveUci: state.lastMoveUci ?? null,
      responseMoveSan: state.lastMoveSan ?? null,
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

  const usedReveal = Boolean(attempt.usedReveal);
  const attemptedMove = attempt.choiceUci || attempt.uci || (attempt.from && attempt.to ? `${attempt.from}${attempt.to}` : null) || "";
  if (!attemptedMove && usedReveal) {
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
      responseMoveUci: null,
      responseMoveSan: null,
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

  const graded = resolveAttemptMove(state, attempt);
  const legal = Boolean(attempt.legal ?? graded.reason !== "illegal_move_attempt");

  if (graded.reason === "illegal_move_attempt" || !legal) {
    const nextState: DailyTrainingTargetState = {
      ...state,
      completed: true,
      won: false,
      plyCount: state.plyCount + 1,
      lastMoveUci: graded.attemptedMoveUci ?? attemptedMove ?? null,
      lastMoveSan: graded.attemptedMoveSan ?? attempt.san ?? null,
    };
    return {
      state: nextState,
      completed: true,
      won: false,
      legal: false,
      reason: "illegal_move_attempt",
      attemptedMoveUci: graded.attemptedMoveUci ?? attemptedMove ?? null,
      attemptedMoveSan: graded.attemptedMoveSan ?? attempt.san ?? null,
      responseMoveUci: graded.expectedMoveUci ?? null,
      responseMoveSan: null,
      moveCount: nextState.plyCount,
      illegalMoveCount: 1,
      scoreInput: {
        card: null,
        completed: true,
        won: false,
        moveCount: nextState.plyCount,
        moveLimit: state.moveLimit ?? 1,
        bestKnownMoves: state.bestKnownScore ?? 1,
        illegalMoveCount: 1,
        blocked: false,
        perfectPath: false,
        objectiveCount: 1,
        objectivesCompleted: 0,
        usedReveal,
        reason: "illegal_move_attempt",
      },
    };
  }

  const legalPawnMove = isRelatedPawnMove(state, graded.attemptedMoveUci ?? attemptedMove);
  const won = graded.outcome === "correct";
  const nextState: DailyTrainingTargetState = {
    ...state,
    completed: true,
    won,
    plyCount: state.plyCount + 1,
    lastMoveUci: graded.attemptedMoveUci ?? attemptedMove,
    lastMoveSan: graded.attemptedMoveSan ?? attempt.san ?? null,
  };

  return {
    state: nextState,
    completed: true,
    won,
    legal: true,
    reason: won ? "found_break" : legalPawnMove ? "related_pawn_move" : "wrong_break",
    attemptedMoveUci: graded.attemptedMoveUci ?? attemptedMove,
    attemptedMoveSan: graded.attemptedMoveSan ?? attempt.san ?? null,
    responseMoveUci: nextState.lastMoveUci ?? null,
    responseMoveSan: nextState.lastMoveSan ?? null,
    moveCount: nextState.plyCount,
    illegalMoveCount: 0,
    scoreInput: {
      card: null,
      completed: true,
      won,
      moveCount: nextState.plyCount,
      moveLimit: state.moveLimit ?? 1,
      bestKnownMoves: state.bestKnownScore ?? 1,
      illegalMoveCount: 0,
      blocked: false,
      perfectPath: won && !usedReveal,
      objectiveCount: legalPawnMove && !won ? 2 : 1,
      objectivesCompleted: won ? 1 : legalPawnMove && !won ? 1 : 0,
      usedReveal,
      reason: won ? "found_break" : legalPawnMove ? "related_pawn_move" : "wrong_break",
    },
  };
}

export const breakTimingDrillDefinition: DailyTrainingTargetDefinition = {
  id: "break_timing_drill",
  title: "Break Timing Drill",
  summary: "Tempo is training pawn breaks and freeing moves.",
  skillIds: ["break_timing", "pawn_break"],
  recommendedFor: ["intro", "beginner", "early_intermediate", "intermediate", "advanced", "expert"],
  generate: generateBreakTimingDrillTrainingTargetCard,
  scoreAttempt: (input) => scoreDailyTrainingTargetAttempt(input),
};
