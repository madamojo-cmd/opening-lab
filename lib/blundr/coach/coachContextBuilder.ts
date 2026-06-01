import { normalizeFenForVisualFrame, visualFrameMatches } from "../teaching/overlayLifecycle";
import type { CoachContext, CoachContextInput } from "./coachTypes";

function isTrustedMoveTrust(moveTrust?: string): boolean {
  return moveTrust === "engine_verified" || moveTrust === "book_supported" || moveTrust === "repertoire_supported" || moveTrust === "engine_close";
}

export function buildCoachContext(input: CoachContextInput): { context: CoachContext | null; suppressedReason?: string } {
  const normalizedFen = normalizeFenForVisualFrame(input.boardFen);
  if (!normalizedFen) return { context: null, suppressedReason: "invalid_board_fen" };

  const recipe = input.visualRecipe;
  if (!recipe) {
    const trainingContext = input.trainingContext as any;
    const contextMoveUci = trainingContext?.cue?.metadata?.moveUci;
    const contextMoveSan = trainingContext?.cue?.metadata?.moveSan;
    const moveTrust = input.trainingContext?.moveTrust;
    const exactMoveAllowed = Boolean(
      isTrustedMoveTrust(moveTrust) &&
        contextMoveUci &&
        input.userToMove &&
        input.phase === "ready_for_user" &&
        (input.viewMode === "assisted" || input.revealState === "revealed" || input.answerShown),
    );
    return {
      context: {
        frameId: String(input.frameId),
        fen: input.boardFen,
        normalizedFen,
        viewMode: input.viewMode,
        revealState: input.revealState,
        phase: input.phase,
        userToMove: input.userToMove,
        bookStatus: input.bookStatus,
        conceptId: trainingContext?.cue?.conceptId ?? trainingContext?.selectedStory?.conceptId ?? input.trainingContext?.conceptId,
        patternId: trainingContext?.cue?.id ?? input.trainingContext?.patternId,
        visualRecipeId: undefined,
        moveUci: contextMoveUci,
        moveSan: contextMoveSan,
        keySquares: trainingContext?.cue?.visual?.keySquares?.map((cue: { square: string }) => cue.square) ?? [],
        keyPieces: [],
        visualPrimitiveTypes: [],
        moveTrust,
        contextTrust: input.trainingContext?.contextTrust,
        attempts: input.attempts,
        wrongAttempts: input.wrongAttempts,
        hintUsed: input.hintUsed,
        answerShown: input.answerShown,
        elapsedMs: input.elapsedMs,
        priorPatternMisses: input.priorPatternMisses,
        priorPatternSuccesses: input.priorPatternSuccesses,
        recentUtteranceIds: input.recentUtteranceIds,
        recentUtteranceFamilies: input.recentUtteranceFamilies,
        recipeFrameMatchesBoard: true,
        recipeFenMatchesBoard: true,
        exactMoveAllowed,
        canShowAnswerMove: exactMoveAllowed,
        canShowContext: true,
        source: input.trainingContext ? "training_context" : "none",
      },
      suppressedReason: input.trainingContext ? undefined : "missing_visual_recipe",
    };
  }

  const recipeFenNormalized = normalizeFenForVisualFrame(recipe.fen);
  const frameMatches = visualFrameMatches(recipe.frameId, input.frameId);
  const fenMatches = Boolean(recipeFenNormalized && recipeFenNormalized === normalizedFen);

  if (!frameMatches) return { context: null, suppressedReason: "stale_frame" };
  if (!fenMatches) return { context: null, suppressedReason: "stale_fen" };

  const moveTrust = input.trainingContext?.moveTrust;
  const exactMoveAllowed = Boolean(
    isTrustedMoveTrust(moveTrust) &&
      recipe.moveUci &&
      input.userToMove &&
      input.phase === "ready_for_user" &&
      (input.viewMode === "assisted" || input.revealState === "revealed" || input.answerShown),
  );

  return {
    context: {
      frameId: String(input.frameId),
      fen: input.boardFen,
      normalizedFen,
      viewMode: input.viewMode,
      revealState: input.revealState,
      phase: input.phase,
      userToMove: input.userToMove,
      bookStatus: input.bookStatus,
      conceptId: recipe.conceptId ?? input.trainingContext?.conceptId,
      patternId: recipe.patternId ?? input.trainingContext?.patternId,
      visualRecipeId: recipe.visualRecipeId,
      moveUci: recipe.moveUci,
      moveSan: recipe.moveSan,
      keySquares: recipe.keySquares ?? [],
      keyPieces: recipe.keyPieces ?? [],
      visualPrimitiveTypes: recipe.primitiveTypes ?? [],
      moveTrust,
      contextTrust: input.trainingContext?.contextTrust,
      attempts: input.attempts,
      wrongAttempts: input.wrongAttempts,
      hintUsed: input.hintUsed,
      answerShown: input.answerShown,
      elapsedMs: input.elapsedMs,
      priorPatternMisses: input.priorPatternMisses,
      priorPatternSuccesses: input.priorPatternSuccesses,
      recentUtteranceIds: input.recentUtteranceIds,
      recentUtteranceFamilies: input.recentUtteranceFamilies,
      recipeFrameMatchesBoard: frameMatches,
      recipeFenMatchesBoard: fenMatches,
      exactMoveAllowed,
      canShowAnswerMove: Boolean(recipe.canShowAnswerMove),
      canShowContext: Boolean(recipe.canShowContext ?? true),
      source: "visual_recipe",
    },
  };
}
