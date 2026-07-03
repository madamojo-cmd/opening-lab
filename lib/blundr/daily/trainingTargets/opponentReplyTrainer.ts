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
  buildCandidateMoves,
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
import { attachConceptTagsToDailyCard, inferConceptTagsForTrainingTarget } from "../concepts/dailyConceptTagging";
import { gradeDailyBlundrMove } from "../dailyMoveGrader";

type OpponentReplyScenario = {
  id: string;
  openingName: string;
  sourceFen: string;
  userMoveUci: string;
};

const OPPONENT_REPLY_SCENARIOS: OpponentReplyScenario[] = [
  { id: "e4_e5", openingName: "King's Pawn", sourceFen: new Chess().fen(), userMoveUci: "e2e4" },
  { id: "d4_d5", openingName: "Queen's Pawn", sourceFen: new Chess().fen(), userMoveUci: "d2d4" },
  { id: "c4_e5", openingName: "English Opening", sourceFen: new Chess().fen(), userMoveUci: "c2c4" },
  { id: "nf3_d5", openingName: "Reti Opening", sourceFen: new Chess().fen(), userMoveUci: "g1f3" },
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
    (card) => (card.priority ?? 0) + (card.source === "progress_mistake" ? 28 : card.source === "learning_event" ? 18 : 6),
  );
}

function selectFallbackScenario(ctx: DailyTrainingTargetGenerationContext): OpponentReplyScenario {
  const rank = Math.min(OPPONENT_REPLY_SCENARIOS.length - 1, Math.max(0, normalizeDifficultyRank(ctx.difficulty)));
  const pool = OPPONENT_REPLY_SCENARIOS.slice(0, Math.max(1, rank + 1));
  const seed = Number.parseInt(hashString(`${ctx.dateKey}|opponent_reply_trainer|${ctx.difficulty}|${ctx.currentMastery.toFixed(2)}|${ctx.confidence.toFixed(2)}`), 36);
  return pool[(Number.isFinite(seed) ? seed : 0) % pool.length];
}

function buildScenarioFromCard(card: DailyBlundrCard): OpponentReplyScenario | null {
  const userMoveUci = card.expectedMoveUci ?? null;
  if (!userMoveUci) return null;
  return {
    id: `reply:${card.cardKey}`,
    openingName: card.openingName || "Opponent Reply Trainer",
    sourceFen: card.fen,
    userMoveUci,
  };
}

function buildScenario(ctx: DailyTrainingTargetGenerationContext): { sourceCard: DailyBlundrCard | null; scenario: OpponentReplyScenario; sourceLabel: string } {
  const sourceCard = selectSourceCard(ctx);
  if (sourceCard) {
    const scenario = buildScenarioFromCard(sourceCard);
    if (scenario) {
      return {
        sourceCard,
        scenario,
        sourceLabel: sourceCard.openingName || sourceCard.summary || "Daily opening",
      };
    }
  }

  const scenario = selectFallbackScenario(ctx);
  return {
    sourceCard: null,
    scenario,
    sourceLabel: scenario.openingName,
  };
}

function buildTrainerState(ctx: DailyTrainingTargetGenerationContext): { state: DailyTrainingTargetState | null; sourceCard: DailyBlundrCard | null; sourceLabel: string } {
  const { sourceCard, scenario, sourceLabel } = buildScenario(ctx);
  const applied = applyMoveUci(scenario.sourceFen, scenario.userMoveUci);
  if (!applied?.move) return { state: null, sourceCard, sourceLabel };
  const replyFen = applied.chess.fen();
  const reply = pickBestLegalMove(replyFen, []);
  if (!reply) return { state: null, sourceCard, sourceLabel };
  const replyUci = moveToUci(reply);
  const replySan = reply.san ?? getMoveSan(replyFen, replyUci);
  const candidateMoves = buildCandidateMoves(replyFen, replyUci, 4);
  const difficulty = chooseTrainingTargetDifficulty(ctx.currentMastery, ctx.confidence, ctx.difficulty);
  const formationHash = hashString(`${scenario.id}|${replyFen}|${replyUci}|${difficulty}`);
  return {
    state: buildTrainingTargetTrainingState({
      trainingTargetId: "opponent_reply_trainer",
      skillIds: ["common_reply", "opponent_reply_recognition"],
      difficulty,
      interactionKind: candidateMoves.length > 1 ? "multiple_choice" : "move_input",
      startFen: replyFen,
      currentFen: replyFen,
      learnerSide: new Chess(replyFen).turn() === "w" ? "black" : "white",
      sideToMove: new Chess(replyFen).turn(),
      prompt: "What is the opponent's common reply?",
      expectedMoveUci: replyUci,
      expectedMoveSan: replySan,
      candidateMoves,
      moveLimit: 1,
      plyCount: 0,
      bestKnownScore: 1,
      formationHash,
      noveltyKey: `opponent_reply_trainer:${formationHash}`,
      sourceCardKey: sourceCard?.cardKey ?? null,
      sourceLabel,
    }),
    sourceCard,
    sourceLabel,
  };
}

function scoreAttempt(input: DailyTrainingTargetScoreInput) {
  return scoreDailyTrainingTargetAttempt(input);
}

export function generateOpponentReplyTrainerTrainingTargetCard(ctx: DailyTrainingTargetGenerationContext): DailyBlundrTrainingTargetCard | null {
  const built = buildTrainerState(ctx);
  if (!built.state) return null;
  const state = built.state;
  const currentMastery = Math.max(0, Math.min(1, ctx.currentMastery));
  const confidence = Math.max(0, Math.min(1, ctx.confidence));
  return attachConceptTagsToDailyCard(buildTrainingTargetCard({
    source: built.sourceCard?.source ?? "daily_attempt",
    cardKey: `target:opponent_reply_trainer:${state.formationHash}`,
    positionKey: state.formationHash,
    fen: state.currentFen,
    expectedMoveUci: state.expectedMoveUci ?? null,
    expectedMoveSan: state.expectedMoveSan ?? null,
    playedMoveUci: null,
    playedMoveSan: null,
    openingId: built.sourceCard?.openingId ?? null,
    openingName: "Opponent Reply Trainer",
    patternId: "target:opponent_reply_trainer",
    concept: "common_reply",
    count: 1,
    weight: 1.1 + (1 - currentMastery) * 0.72,
    lastSeenAt: ctx.mastery?.records["target:opponent_reply_trainer:common_reply"]?.lastSeenAt ?? null,
    note: built.sourceLabel,
    signals: [
      "training_target",
      "target:opponent_reply_trainer",
      "skill:common_reply",
      "skill:opponent_reply_recognition",
      built.sourceCard?.source ? `source:${built.sourceCard.source}` : "source:fallback",
      built.sourceLabel ? `opening:${built.sourceLabel}` : null,
      `novelty:${state.noveltyKey}`,
    ].filter((value): value is string => Boolean(value)),
    masteryTargets: buildTrainingTargetMasteryTargets(
      "opponent_reply_trainer",
      ["common_reply", "opponent_reply_recognition"],
      state.difficulty,
      ["Common reply", "Opponent reply recognition"],
    ),
    confidence: currentMastery >= 0.8 && confidence >= 0.6 ? "high" : currentMastery >= 0.35 ? "medium" : "low",
    difficulty: state.difficulty,
    id: `target:opponent_reply_trainer:${state.formationHash}`,
    title: "Opponent Reply Trainer",
    prompt: state.prompt,
    repertoireId: null,
    reviewCardId: null,
    reviewDedupeKey: null,
    reviewPromptKind: null,
    reviewStatus: null,
    reviewDueAt: null,
    deckRank: 1,
    priority: Math.round((1 - currentMastery) * 84 + (1 - confidence) * 12 + normalizeDifficultyRank(state.difficulty) * 2 + (ctx.dueReviewCount === 0 ? 9 : 2)),
    masteryKey: `target:opponent_reply_trainer:${state.formationHash}`,
    sourceCount: 1,
    summary: built.sourceLabel ? `Reply trainer from ${built.sourceLabel}` : "Opponent reply drill",
    trainingTarget: state,
  }), inferConceptTagsForTrainingTarget("opponent_reply_trainer", ["common_reply", "opponent_reply_recognition"]));
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

export function advanceOpponentReplyTrainerTrainingTarget(
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
    reason: won ? "matched_common_reply" : "wrong_reply_pattern",
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
      objectiveCount: 1,
      objectivesCompleted: won ? 1 : 0,
      usedReveal,
      reason: won ? "matched_common_reply" : "wrong_reply_pattern",
    },
  };
}

export const opponentReplyTrainerDefinition: DailyTrainingTargetDefinition = {
  id: "opponent_reply_trainer",
  title: "Opponent Reply Trainer",
  summary: "Tempo is training the reply that usually follows your move.",
  skillIds: ["common_reply", "opponent_reply_recognition"],
  recommendedFor: ["intro", "beginner", "early_intermediate", "intermediate", "advanced", "expert"],
  generate: generateOpponentReplyTrainerTrainingTargetCard,
  scoreAttempt: (input) => scoreDailyTrainingTargetAttempt(input),
};
