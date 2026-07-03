import { Chess } from "chess.js";
import type {
  DailyBlundrCard,
  DailyBlundrDifficulty,
  DailyBlundrMasteryState,
} from "../dailyBlundrTypes";
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

type ReplyRadarScenario = {
  id: string;
  openingName: string;
  sourceFen: string;
  userMoveUci: string;
};

const REPLY_RADAR_SCENARIOS: ReplyRadarScenario[] = [
  { id: "e4_e5", openingName: "King's Pawn", sourceFen: new Chess().fen(), userMoveUci: "e2e4" },
  { id: "d4_d5", openingName: "Queen's Pawn", sourceFen: new Chess().fen(), userMoveUci: "d2d4" },
  { id: "c4_e5", openingName: "English Opening", sourceFen: new Chess().fen(), userMoveUci: "c2c4" },
  { id: "nf3_d5", openingName: "Knight's Opening", sourceFen: new Chess().fen(), userMoveUci: "g1f3" },
  { id: "e4_c5", openingName: "Sicilian", sourceFen: new Chess().fen(), userMoveUci: "e2e4" },
];

function normalizeDifficultyForScenario(difficulty: DailyBlundrDifficulty): number {
  if (difficulty === "intro") return 0;
  if (difficulty === "beginner") return 1;
  if (difficulty === "early_intermediate") return 2;
  if (difficulty === "intermediate") return 3;
  if (difficulty === "advanced") return 4;
  return 5;
}

function scoreSourceCard(card: DailyBlundrCard): number {
  const sourceBias = card.source === "progress_mistake" ? 30 : card.source === "learning_event" ? 18 : card.source === "merged" ? 12 : 6;
  const moveBias = card.expectedMoveUci ? 12 : 0;
  const openingBias = card.openingName ? 6 : 0;
  return (card.priority ?? 0) + sourceBias + moveBias + openingBias;
}

function pickSourceCard(ctx: DailyTrainingTargetGenerationContext): DailyBlundrCard | null {
  return pickDailyBlundrCard(
    ctx.candidateDailyCards,
    (card) => Boolean(card.expectedMoveUci || card.expectedMoveSan),
    (card) => scoreSourceCard(card),
  );
}

function selectFallbackScenario(ctx: DailyTrainingTargetGenerationContext): ReplyRadarScenario {
  const difficultyRank = Math.min(REPLY_RADAR_SCENARIOS.length - 1, Math.max(0, normalizeDifficultyForScenario(ctx.difficulty)));
  const pool = REPLY_RADAR_SCENARIOS.slice(0, Math.max(1, difficultyRank + 1));
  const seed = Number.parseInt(hashString(`${ctx.dateKey}|reply_radar|${ctx.difficulty}|${ctx.currentMastery.toFixed(2)}|${ctx.confidence.toFixed(2)}`), 36);
  return pool[(Number.isFinite(seed) ? seed : 0) % pool.length];
}

function buildScenarioFromCard(card: DailyBlundrCard, ctx: DailyTrainingTargetGenerationContext): ReplyRadarScenario | null {
  const userMoveUci = card.expectedMoveUci ?? null;
  if (!userMoveUci) return null;
  const applied = applyMoveUci(card.fen, userMoveUci);
  if (!applied?.move) return null;
  const replyFen = applied.chess.fen();
  const reply = pickBestLegalMove(replyFen, []);
  if (!reply) return null;
  return {
    id: `reply:${card.cardKey}`,
    openingName: card.openingName || "Reply Radar",
    sourceFen: replyFen,
    userMoveUci,
  };
}

function buildScenario(ctx: DailyTrainingTargetGenerationContext): { scenario: ReplyRadarScenario; sourceCard: DailyBlundrCard | null; sourceLabel: string } {
  const sourceCard = pickSourceCard(ctx);
  if (sourceCard) {
    const scenario = buildScenarioFromCard(sourceCard, ctx);
    if (scenario) {
      return {
        scenario: {
          ...scenario,
          openingName: sourceCard.openingName || scenario.openingName,
        },
        sourceCard,
        sourceLabel: sourceCard.openingName || sourceCard.summary || "Daily opening",
      };
    }
  }

  const scenario = selectFallbackScenario(ctx);
  const applied = applyMoveUci(scenario.sourceFen, scenario.userMoveUci);
  const replyFen = applied?.move ? applied.chess.fen() : scenario.sourceFen;
  return {
    scenario: {
      ...scenario,
      sourceFen: replyFen,
    },
    sourceCard: null,
    sourceLabel: scenario.openingName,
  };
}

function buildTrainingTargetState(ctx: DailyTrainingTargetGenerationContext, scenario: ReplyRadarScenario, sourceCard: DailyBlundrCard | null, sourceLabel: string): DailyTrainingTargetState | null {
  const reply = pickBestLegalMove(scenario.sourceFen, []);
  if (!reply) return null;
  const expectedMoveUci = moveToUci(reply);
  if (!expectedMoveUci) return null;
  const expectedMoveSan = reply.san ?? getMoveSan(scenario.sourceFen, expectedMoveUci);
  const candidateMoves = buildCandidateMoves(scenario.sourceFen, expectedMoveUci, 4);
  const difficulty = chooseTrainingTargetDifficulty(ctx.currentMastery, ctx.confidence, ctx.difficulty);
  const moveLimit = 1;
  const formationHash = hashString(`${scenario.id}|${scenario.sourceFen}|${expectedMoveUci}|${difficulty}`);
  return buildTrainingTargetTrainingState({
    trainingTargetId: "reply_radar",
    skillIds: ["candidate_move_recognition", "opponent_reply_recognition"],
    difficulty,
    interactionKind: candidateMoves.length > 1 ? "multiple_choice" : "move_input",
    startFen: scenario.sourceFen,
    currentFen: scenario.sourceFen,
    learnerSide: (new Chess(scenario.sourceFen).turn() === "w" ? "black" : "white"),
    sideToMove: new Chess(scenario.sourceFen).turn(),
    prompt: "What reply should you expect here?",
    expectedMoveUci,
    expectedMoveSan,
    candidateMoves,
    moveLimit,
    plyCount: 0,
    bestKnownScore: 1,
    formationHash,
    noveltyKey: `reply_radar:${formationHash}`,
    sourceCardKey: sourceCard?.cardKey ?? null,
    sourceLabel,
  });
}

function scoreAttempt(input: DailyTrainingTargetScoreInput): ReturnType<typeof scoreDailyTrainingTargetAttempt> {
  return scoreDailyTrainingTargetAttempt(input);
}

export function generateReplyRadarTrainingTargetCard(ctx: DailyTrainingTargetGenerationContext): DailyBlundrTrainingTargetCard | null {
  const { scenario, sourceCard, sourceLabel } = buildScenario(ctx);
  const state = buildTrainingTargetState(ctx, scenario, sourceCard, sourceLabel);
  if (!state) return null;
  const currentMastery = Math.max(0, Math.min(1, ctx.currentMastery));
  const confidence = Math.max(0, Math.min(1, ctx.confidence));
  return attachConceptTagsToDailyCard(buildTrainingTargetCard({
    source: sourceCard?.source ?? "daily_attempt",
    cardKey: `target:reply_radar:${state.formationHash}`,
    positionKey: state.formationHash,
    fen: state.currentFen,
    expectedMoveUci: state.expectedMoveUci ?? null,
    expectedMoveSan: state.expectedMoveSan ?? null,
    playedMoveUci: null,
    playedMoveSan: null,
    openingId: sourceCard?.openingId ?? null,
    openingName: "Reply Radar",
    patternId: "target:reply_radar",
    concept: "candidate_move_recognition",
    count: 1,
    weight: 1.15 + (1 - currentMastery) * 0.7,
    lastSeenAt: ctx.mastery?.records["target:reply_radar:candidate_move_recognition"]?.lastSeenAt ?? null,
    note: sourceLabel,
    signals: [
      "training_target",
      "target:reply_radar",
      "skill:candidate_move_recognition",
      "skill:opponent_reply_recognition",
      sourceCard?.source ? `source:${sourceCard.source}` : "source:fallback",
      sourceLabel ? `opening:${sourceLabel}` : null,
      `novelty:${state.noveltyKey}`,
    ].filter((value): value is string => Boolean(value)),
    masteryTargets: buildTrainingTargetMasteryTargets(
      "reply_radar",
      ["candidate_move_recognition", "opponent_reply_recognition"],
      state.difficulty,
      ["Candidate move recognition", "Opponent reply recognition"],
    ),
    confidence: currentMastery >= 0.8 && confidence >= 0.6 ? "high" : currentMastery >= 0.35 ? "medium" : "low",
    difficulty: state.difficulty,
    id: `target:reply_radar:${state.formationHash}`,
    title: "Reply Radar",
    prompt: state.prompt,
    repertoireId: null,
    reviewCardId: null,
    reviewDedupeKey: null,
    reviewPromptKind: null,
    reviewStatus: null,
    reviewDueAt: null,
    deckRank: 1,
    priority: Math.round((1 - currentMastery) * 82 + (1 - confidence) * 16 + normalizeDifficultyForScenario(state.difficulty) * 2 + (ctx.dueReviewCount === 0 ? 10 : 2)),
    masteryKey: `target:reply_radar:${state.formationHash}`,
    sourceCount: 1,
    summary: sourceLabel ? `Reply radar from ${sourceLabel}` : "Reply radar drill",
    trainingTarget: state,
  }), inferConceptTagsForTrainingTarget("reply_radar", ["candidate_move_recognition", "opponent_reply_recognition"]));
}

function resolveAttemptMove(state: DailyTrainingTargetState, input: { from?: string | null; to?: string | null; uci?: string | null; san?: string | null; choiceUci?: string | null }) {
  const move = input.choiceUci || input.uci || (input.from && input.to ? `${input.from}${input.to}` : null) || null;
  if (!move) return null;
  return gradeDailyBlundrMove({
    fen: state.currentFen,
    expectedMoveUci: state.expectedMoveUci ?? null,
    expectedMoveSan: state.expectedMoveSan ?? null,
    attemptedMove: move,
  });
}

export function advanceReplyRadarTrainingTarget(
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

  const graded = resolveAttemptMove(state, attempt);
  const attemptedMoveUci = attempt.choiceUci || attempt.uci || null;
  const attemptedMoveSan = attempt.san ?? graded?.attemptedMoveSan ?? null;
  const legal = Boolean(attempt.legal ?? graded?.reason !== "illegal_move_attempt");
  const usedReveal = Boolean(attempt.usedReveal);

  if (!graded || graded.reason === "illegal_move_attempt" || !legal) {
    const nextState: DailyTrainingTargetState = {
      ...state,
      completed: true,
      won: false,
      plyCount: state.plyCount + 1,
      selectedSquares: state.selectedSquares ? [...state.selectedSquares] : undefined,
      lastMoveUci: attemptedMoveUci,
      lastMoveSan: attemptedMoveSan,
    };
    return {
      state: nextState,
      completed: true,
      won: false,
      legal: false,
      reason: "illegal_move_attempt",
      attemptedMoveUci,
      attemptedMoveSan,
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

  const won = graded.outcome === "correct";
  const nextState: DailyTrainingTargetState = {
    ...state,
    currentFen: state.currentFen,
    completed: true,
    won,
    plyCount: state.plyCount + 1,
    lastMoveUci: graded.attemptedMoveUci ?? attemptedMoveUci,
    lastMoveSan: graded.attemptedMoveSan ?? attemptedMoveSan,
  };

  return {
    state: nextState,
    completed: true,
    won,
    legal: true,
    reason: won ? "matched_expected_reply" : "wrong_reply_pattern",
    attemptedMoveUci: graded.attemptedMoveUci ?? attemptedMoveUci,
    attemptedMoveSan: graded.attemptedMoveSan ?? attemptedMoveSan,
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
      reason: won ? "matched_expected_reply" : "wrong_reply_pattern",
    },
  };
}

function scoreReplyRadarAttempt(input: DailyTrainingTargetScoreInput) {
  return scoreDailyTrainingTargetAttempt(input);
}

export const replyRadarDefinition: DailyTrainingTargetDefinition = {
  id: "reply_radar",
  title: "Reply Radar",
  summary: "Tempo found a reply pattern to read today.",
  skillIds: ["candidate_move_recognition", "opponent_reply_recognition"],
  recommendedFor: ["intro", "beginner", "early_intermediate", "intermediate", "advanced", "expert"],
  generate: generateReplyRadarTrainingTargetCard,
  scoreAttempt: scoreReplyRadarAttempt,
};
