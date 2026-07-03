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
  buildSequenceFromFen,
  buildTrainingTargetCard,
  buildTrainingTargetMasteryTargets,
  buildTrainingTargetTrainingState,
  chooseTrainingTargetDifficulty,
  getMoveSan,
  hashString,
  moveToUci,
  pickDailyBlundrCard,
  pickBestLegalMove,
} from "./trainingTargetUtils";
import { scoreDailyTrainingTargetAttempt } from "./dailyTrainingTargetScoring";
import { gradeDailyBlundrMove } from "../dailyMoveGrader";

type BranchBuilderScenario = {
  id: string;
  openingName: string;
  fen: string;
  firstMoveUci: string;
};

const BRANCH_BUILDER_SCENARIOS: BranchBuilderScenario[] = [
  { id: "kings_pawn", openingName: "King's Pawn", fen: new Chess().fen(), firstMoveUci: "e2e4" },
  { id: "queens_pawn", openingName: "Queen's Pawn", fen: new Chess().fen(), firstMoveUci: "d2d4" },
  { id: "english", openingName: "English Opening", fen: new Chess().fen(), firstMoveUci: "c2c4" },
  { id: "reti", openingName: "Reti Opening", fen: new Chess().fen(), firstMoveUci: "g1f3" },
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
    (card) => Boolean(card.expectedMoveUci || card.expectedMoveSan),
    (card) => (card.priority ?? 0) + (card.source === "progress_mistake" ? 32 : card.source === "learning_event" ? 20 : 8),
  );
}

function selectFallbackScenario(ctx: DailyTrainingTargetGenerationContext): BranchBuilderScenario {
  const rank = Math.min(BRANCH_BUILDER_SCENARIOS.length - 1, Math.max(0, normalizeDifficultyRank(ctx.difficulty)));
  const pool = BRANCH_BUILDER_SCENARIOS.slice(0, Math.max(1, rank + 1));
  const seed = Number.parseInt(hashString(`${ctx.dateKey}|opening_branch_builder|${ctx.difficulty}|${ctx.currentMastery.toFixed(2)}|${ctx.confidence.toFixed(2)}`), 36);
  return pool[(Number.isFinite(seed) ? seed : 0) % pool.length];
}

function buildSequenceStart(ctx: DailyTrainingTargetGenerationContext): { sourceCard: DailyBlundrCard | null; scenario: BranchBuilderScenario; sourceLabel: string } {
  const sourceCard = selectSourceCard(ctx);
  if (sourceCard?.expectedMoveUci) {
    return {
      sourceCard,
      scenario: {
        id: `branch:${sourceCard.cardKey}`,
        openingName: sourceCard.openingName || "Branch Builder",
        fen: sourceCard.fen,
        firstMoveUci: sourceCard.expectedMoveUci,
      },
      sourceLabel: sourceCard.openingName || sourceCard.summary || "Daily opening",
    };
  }

  const scenario = selectFallbackScenario(ctx);
  return {
    sourceCard: null,
    scenario,
    sourceLabel: scenario.openingName,
  };
}

function desiredPlyCount(ctx: DailyTrainingTargetGenerationContext): number {
  const rank = normalizeDifficultyRank(ctx.difficulty);
  if (rank <= 1) return 2;
  if (rank === 2) return 3;
  if (rank === 3) return 3;
  return 4;
}

function buildBranchBuilderState(ctx: DailyTrainingTargetGenerationContext): {
  state: DailyTrainingTargetState | null;
  sourceCard: DailyBlundrCard | null;
  sourceLabel: string;
} {
  const { sourceCard, scenario, sourceLabel } = buildSequenceStart(ctx);
  const plies = desiredPlyCount(ctx);
  const sequenceData = buildSequenceFromFen(scenario.fen, plies, [scenario.firstMoveUci]);
  if (sequenceData.sequence.length < 2) return { state: null, sourceCard, sourceLabel };
  const firstMoveUci = sequenceData.sequence[0];
  const firstMoveSan = getMoveSan(scenario.fen, firstMoveUci);
  const difficulty = chooseTrainingTargetDifficulty(ctx.currentMastery, ctx.confidence, ctx.difficulty);
  const formationHash = hashString(`${scenario.id}|${scenario.fen}|${sequenceData.sequence.join(",")}|${difficulty}`);
  return {
    sourceCard,
    sourceLabel,
    state: buildTrainingTargetTrainingState({
      trainingTargetId: "opening_branch_builder",
      skillIds: ["branch_memory", "move_order_precision"],
      difficulty,
      interactionKind: "sequence",
      startFen: scenario.fen,
      currentFen: scenario.fen,
      learnerSide: new Chess(scenario.fen).turn() === "w" ? "white" : "black",
      sideToMove: new Chess(scenario.fen).turn(),
      prompt: `Build the next ${sequenceData.sequence.length} plies of the branch, one move at a time.`,
      expectedMoveUci: firstMoveUci,
      expectedMoveSan: firstMoveSan,
      expectedSequenceUci: sequenceData.sequence,
      moveLimit: sequenceData.sequence.length,
      plyCount: 0,
      bestKnownScore: sequenceData.sequence.length,
      formationHash,
      noveltyKey: `opening_branch_builder:${formationHash}`,
      sourceCardKey: sourceCard?.cardKey ?? null,
      sourceLabel,
    }),
  };
}

function scoreAttempt(input: DailyTrainingTargetScoreInput) {
  return scoreDailyTrainingTargetAttempt(input);
}

export function generateOpeningBranchBuilderTrainingTargetCard(ctx: DailyTrainingTargetGenerationContext): DailyBlundrTrainingTargetCard | null {
  const built = buildBranchBuilderState(ctx);
  if (!built.state) return null;
  const state = built.state;
  const currentMastery = Math.max(0, Math.min(1, ctx.currentMastery));
  const confidence = Math.max(0, Math.min(1, ctx.confidence));
  return buildTrainingTargetCard({
    source: built.sourceCard?.source ?? "daily_attempt",
    cardKey: `target:opening_branch_builder:${state.formationHash}`,
    positionKey: state.formationHash,
    fen: state.startFen,
    expectedMoveUci: state.expectedMoveUci ?? null,
    expectedMoveSan: state.expectedMoveSan ?? null,
    playedMoveUci: null,
    playedMoveSan: null,
    openingId: built.sourceCard?.openingId ?? null,
    openingName: "Opening Branch Builder",
    patternId: "target:opening_branch_builder",
    concept: "branch_memory",
    count: 1,
    weight: 1.2 + (1 - currentMastery) * 0.72,
    lastSeenAt: ctx.mastery?.records["target:opening_branch_builder:branch_memory"]?.lastSeenAt ?? null,
    note: built.sourceLabel,
    signals: [
      "training_target",
      "target:opening_branch_builder",
      "skill:branch_memory",
      "skill:move_order_precision",
      built.sourceCard?.source ? `source:${built.sourceCard.source}` : "source:fallback",
      built.sourceLabel ? `opening:${built.sourceLabel}` : null,
      `sequence:${state.expectedSequenceUci?.length ?? 0}`,
      `novelty:${state.noveltyKey}`,
    ].filter((value): value is string => Boolean(value)),
    masteryTargets: buildTrainingTargetMasteryTargets(
      "opening_branch_builder",
      ["branch_memory", "move_order_precision"],
      state.difficulty,
      ["Branch memory", "Move order precision"],
    ),
    confidence: currentMastery >= 0.8 && confidence >= 0.6 ? "high" : currentMastery >= 0.35 ? "medium" : "low",
    difficulty: state.difficulty,
    id: `target:opening_branch_builder:${state.formationHash}`,
    title: "Opening Branch Builder",
    prompt: state.prompt,
    repertoireId: null,
    reviewCardId: null,
    reviewDedupeKey: null,
    reviewPromptKind: null,
    reviewStatus: null,
    reviewDueAt: null,
    deckRank: 1,
    priority: Math.round((1 - currentMastery) * 84 + (1 - confidence) * 12 + normalizeDifficultyRank(state.difficulty) * 2 + (ctx.dueReviewCount === 0 ? 8 : 1)),
    masteryKey: `target:opening_branch_builder:${state.formationHash}`,
    sourceCount: 1,
    summary: built.sourceLabel ? `Branch builder from ${built.sourceLabel}` : "Branch builder drill",
    trainingTarget: state,
  });
}

function resolveAttemptMove(state: DailyTrainingTargetState, attempt: { from?: string | null; to?: string | null; uci?: string | null; san?: string | null; choiceUci?: string | null }) {
  const attemptedMove = attempt.choiceUci || attempt.uci || (attempt.from && attempt.to ? `${attempt.from}${attempt.to}` : null) || "";
  return gradeDailyBlundrMove({
    fen: state.currentFen,
    expectedMoveUci: state.expectedSequenceUci?.[state.plyCount] ?? state.expectedMoveUci ?? null,
    expectedMoveSan: null,
    attemptedMove,
  });
}

export function advanceOpeningBranchBuilderTrainingTarget(
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
        objectiveCount: Math.max(1, state.expectedSequenceUci?.length ?? 1),
        objectivesCompleted: state.won ? Math.max(1, state.expectedSequenceUci?.length ?? 1) : state.plyCount,
        usedReveal: Boolean(attempt.usedReveal),
        reason: "training_target_already_completed",
      },
    };
  }

  const sequence = state.expectedSequenceUci ?? [];
  const expectedUci = sequence[state.plyCount] ?? state.expectedMoveUci ?? null;
  const attemptedMove = attempt.choiceUci || attempt.uci || (attempt.from && attempt.to ? `${attempt.from}${attempt.to}` : null) || "";
  const usedReveal = Boolean(attempt.usedReveal);
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
        moveLimit: state.moveLimit ?? (sequence.length || 1),
        bestKnownMoves: state.bestKnownScore ?? (sequence.length || 1),
        illegalMoveCount: 0,
        blocked: false,
        perfectPath: false,
        objectiveCount: Math.max(1, sequence.length),
        objectivesCompleted: state.plyCount,
        usedReveal: true,
        reason: "reviewed_after_reveal",
      },
    };
  }

  const graded = gradeDailyBlundrMove({
    fen: state.currentFen,
    expectedMoveUci: expectedUci,
    expectedMoveSan: null,
    attemptedMove,
  });
  const legal = Boolean(attempt.legal ?? graded.reason !== "illegal_move_attempt");

  if (graded.reason === "illegal_move_attempt" || !legal) {
    return {
      state: {
        ...state,
        completed: true,
        won: false,
        plyCount: state.plyCount + 1,
        lastMoveUci: graded.attemptedMoveUci ?? attemptedMove ?? null,
        lastMoveSan: graded.attemptedMoveSan ?? attempt.san ?? null,
      },
      completed: true,
      won: false,
      legal: false,
      reason: "illegal_move_attempt",
      attemptedMoveUci: graded.attemptedMoveUci ?? attemptedMove ?? null,
      attemptedMoveSan: graded.attemptedMoveSan ?? attempt.san ?? null,
      responseMoveUci: graded.expectedMoveUci ?? null,
      responseMoveSan: null,
      moveCount: state.plyCount + 1,
      illegalMoveCount: 1,
      scoreInput: {
        card: null,
        completed: true,
        won: false,
        moveCount: state.plyCount + 1,
        moveLimit: state.moveLimit ?? (sequence.length || 1),
        bestKnownMoves: state.bestKnownScore ?? (sequence.length || 1),
        illegalMoveCount: 1,
        blocked: false,
        perfectPath: false,
        objectiveCount: Math.max(1, sequence.length),
        objectivesCompleted: state.plyCount,
        usedReveal,
        reason: "illegal_move_attempt",
      },
    };
  }

  const nextApplied = applyMoveUci(state.currentFen, graded.attemptedMoveUci ?? attemptedMove);
  const nextFen = nextApplied?.chess.fen() ?? state.currentFen;
  const nextPlyCount = state.plyCount + 1;
  const completed = nextPlyCount >= sequence.length;
  const won = completed && graded.outcome === "correct";
  const nextState: DailyTrainingTargetState = {
    ...state,
    currentFen: nextFen,
    completed,
    won,
    plyCount: nextPlyCount,
    lastMoveUci: graded.attemptedMoveUci ?? attemptedMove,
    lastMoveSan: graded.attemptedMoveSan ?? attempt.san ?? null,
  };

  return {
    state: nextState,
    completed,
    won,
    legal: true,
    reason: won ? "sequence_complete" : "sequence_progress",
    attemptedMoveUci: graded.attemptedMoveUci ?? attemptedMove,
    attemptedMoveSan: graded.attemptedMoveSan ?? attempt.san ?? null,
    responseMoveUci: nextState.lastMoveUci ?? null,
    responseMoveSan: nextState.lastMoveSan ?? null,
    moveCount: nextPlyCount,
    illegalMoveCount: 0,
    scoreInput: {
      card: null,
      completed,
      won,
      moveCount: nextPlyCount,
      moveLimit: state.moveLimit ?? (sequence.length || 1),
      bestKnownMoves: state.bestKnownScore ?? (sequence.length || 1),
      illegalMoveCount: 0,
      blocked: false,
      perfectPath: won && !usedReveal,
      objectiveCount: Math.max(1, sequence.length),
      objectivesCompleted: won ? sequence.length : nextPlyCount,
      usedReveal,
      reason: won ? "sequence_complete" : "sequence_progress",
    },
  };
}

export const openingBranchBuilderDefinition: DailyTrainingTargetDefinition = {
  id: "opening_branch_builder",
  title: "Opening Branch Builder",
  summary: "Tempo is training short opening sequence recall.",
  skillIds: ["branch_memory", "move_order_precision"],
  recommendedFor: ["intro", "beginner", "early_intermediate", "intermediate", "advanced", "expert"],
  generate: generateOpeningBranchBuilderTrainingTargetCard,
  scoreAttempt: scoreAttempt,
};
