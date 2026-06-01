import { buildCoachContext } from "../coach/coachContextBuilder";
import { decideCoachOutput } from "../coach/coachDecisionEngine";
import type { CoachUtteranceMemoryEntry } from "../coach/coachTypes";
import { profileCandidateMoves } from "../liveCoach/candidateMoveProfiler";
import { selectBestLiveComment } from "../liveCoach/liveCoachCommentRanker";
import { pickLiveCoachCopy } from "../liveCoach/liveCoachCopyLibrary";
import { selectIntentForOpportunity } from "../liveCoach/liveCoachIntentSelector";
import { rankPedagogicalOpportunities } from "../liveCoach/pedagogicalOpportunityEngine";
import { buildPositionEvidence } from "../liveCoach/positionEvidenceBuilder";
import { extractPositionFeatures } from "../liveCoach/positionFeatureExtractor";
import { shouldLiveCoachStaySilent } from "../liveCoach/liveCoachSilencePolicy";
import { scoreCoachBenchmarkFixture } from "./coachQualityScorer";
import type { CoachBenchmarkEvaluation, CoachBenchmarkFixture, CoachBenchmarkResult } from "./coachBenchmarkTypes";

function baseCoachEvaluation(): CoachBenchmarkEvaluation {
  return {
    buttons: [],
    exactMoveAllowed: false,
    claimTypes: [],
    silent: true,
  };
}

function runAdaptiveFixture(fixture: CoachBenchmarkFixture, memory: CoachUtteranceMemoryEntry[]): CoachBenchmarkEvaluation {
  const contextBuilt = buildCoachContext({
    frameId: fixture.visualRecipeFixture?.frameMatches ? "70" : "71",
    boardFen: fixture.fen,
    viewMode: fixture.viewMode === "freeplay" ? "assisted" : fixture.viewMode,
    revealState: fixture.userState.answerShown ? "revealed" : "hidden",
    phase: "ready_for_user",
    userToMove: true,
    bookStatus: fixture.bookStatus,
    trainingContext: {
      conceptId: fixture.visualRecipeFixture?.conceptId,
      patternId: fixture.visualRecipeFixture?.patternId,
      moveTrust: fixture.expected.exactMoveAllowed ? "book_supported" : "reveal_only_unverified",
      contextTrust: "safe_context",
    },
    visualRecipe: fixture.visualRecipeFixture
      ? {
          frameId: fixture.visualRecipeFixture.frameMatches ? "70" : "72",
          fen: fixture.visualRecipeFixture.fenMatches ? fixture.fen : "8/8/8/8/8/8/8/8 w - -",
          conceptId: fixture.visualRecipeFixture.conceptId,
          patternId: fixture.visualRecipeFixture.patternId,
          visualRecipeId: `${fixture.id}:vr`,
          moveUci: fixture.visualRecipeFixture.moveUci,
          moveSan: fixture.visualRecipeFixture.moveSan,
          keySquares: fixture.visualRecipeFixture.keySquares,
          keyPieces: fixture.visualRecipeFixture.keyPieces,
          primitiveTypes: fixture.visualRecipeFixture.primitiveTypes,
          canShowAnswerMove: fixture.expected.exactMoveAllowed,
          canShowContext: true,
        }
      : null,
    attempts: fixture.userState.attempts,
    wrongAttempts: fixture.userState.wrongAttempts,
    hintUsed: fixture.userState.hintUsed,
    answerShown: fixture.userState.answerShown,
    elapsedMs: fixture.userState.elapsedMs,
    priorPatternMisses: fixture.userState.priorPatternMisses,
    priorPatternSuccesses: fixture.userState.priorPatternSuccesses,
    recentUtteranceIds: memory.slice(-5).map((entry) => entry.utteranceId),
    recentUtteranceFamilies: memory.slice(-5).map((entry) => entry.utteranceFamily),
  });

  const interaction = fixture.viewMode === "plain" && fixture.userState.answerShown
    ? "answer"
    : fixture.viewMode === "plain" && (fixture.userState.hintUsed || fixture.userState.wrongAttempts > 0)
      ? "hint"
      : "none";

  const decision = decideCoachOutput({
    context: contextBuilt.context,
    interaction,
    outcome: fixture.userState.wrongAttempts > 0 ? "wrong" : "none",
    hintRequestCount: fixture.userState.hintUsed ? 1 : 0,
    utteranceMemory: memory,
  });

  return {
    mode: decision.mode,
    text: decision.answer ?? decision.hint ?? decision.body,
    buttons: decision.buttons,
    exactMoveAllowed: Boolean(contextBuilt.context?.exactMoveAllowed),
    shouldMarkReviewWorthy: decision.shouldMarkReviewWorthy,
    claimTypes: decision.claimTypes,
    silent: !decision.shouldShowCoachCard,
  };
}

function runLiveFixture(fixture: CoachBenchmarkFixture): CoachBenchmarkEvaluation {
  if (fixture.expected.shouldStaySilent) {
    return {
      ...baseCoachEvaluation(),
      mode: "suppressed",
      silent: true,
    };
  }
  const features = fixture.positionFeatureFixture ?? extractPositionFeatures(fixture.fen);
  const evidence = buildPositionEvidence({
    frameId: fixture.id === "stale_frame_fen" ? "91" : "70",
    trainerFrameId: fixture.id === "stale_frame_fen" ? "70" : "70",
    fen: fixture.fen,
    boardFen: fixture.normalizedFen,
    moveHistorySan: fixture.moveHistorySan,
    bookStatus: fixture.bookStatus,
    maiaSignals: fixture.maiaFixture,
    engineSignals: fixture.engineFixture,
    patternSignals: fixture.patternSignalFixture,
    userMemorySignals: {
      recentPatternIds: [],
      weakConcepts: fixture.userState.weakConcepts,
      priorMissesInSimilarPositions: fixture.userState.priorPatternMisses,
      hintsUsedRecently: fixture.userState.hintUsed ? 1 : 0,
      answerRevealsRecently: fixture.userState.answerShown ? 1 : 0,
    },
  });
  const mergedEvidence = { ...evidence, positionFeatures: features };

  const candidates = profileCandidateMoves(mergedEvidence);
  const opportunities = rankPedagogicalOpportunities(mergedEvidence, candidates);
  const selected = selectBestLiveComment(opportunities);
  const silence = shouldLiveCoachStaySilent({
    evidence: mergedEvidence,
    selected,
    userRequestedHelp: fixture.userState.hintUsed,
    repeatedConcept: false,
  });

  if (silence.silent) {
    return {
      ...baseCoachEvaluation(),
      mode: "suppressed",
      opportunity: selected?.opportunity,
      intent: selected?.intent,
      silent: true,
    };
  }

  const intent = selected?.intent ?? (selected ? selectIntentForOpportunity(selected.opportunity) : "stay_silent");
  const text = pickLiveCoachCopy(selected?.opportunity ?? "silence", fixture.id);
  const exactMoveAllowed = Boolean(selected?.exactMoveAllowed && fixture.expected.exactMoveAllowed);
  const buttons = exactMoveAllowed ? ["hint", "show_plan", "analyze_idea", "show_move"] : ["hint", "show_plan", "analyze_idea"];

  return {
    mode: exactMoveAllowed ? "supported_continuation" : "freeplay_principle",
    opportunity: selected?.opportunity,
    intent,
    text,
    buttons,
    exactMoveAllowed,
    shouldMarkReviewWorthy: fixture.userState.wrongAttempts >= 2 || fixture.userState.answerShown,
    claimTypes: [selected?.opportunity === "pattern_transfer" ? "pattern_transfer" : "plan_principle"],
    silent: false,
  };
}

export function evaluateCoachBenchmarkFixture(
  fixture: CoachBenchmarkFixture,
  utteranceMemory: CoachUtteranceMemoryEntry[] = [],
): CoachBenchmarkResult {
  const evaluation = fixture.bookStatus === "in_book" ? runAdaptiveFixture(fixture, utteranceMemory) : runLiveFixture(fixture);
  return scoreCoachBenchmarkFixture(fixture, evaluation);
}

export function runCoachBenchmark(
  fixtures: CoachBenchmarkFixture[],
  utteranceMemory: CoachUtteranceMemoryEntry[] = [],
): CoachBenchmarkResult[] {
  return fixtures.map((fixture) => evaluateCoachBenchmarkFixture(fixture, utteranceMemory));
}
