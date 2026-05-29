import { collectTeachingEvidence, type CollectTeachingEvidenceInput } from "./evidenceCollector";
import { buildTrainingContext } from "./trainingContextEngine";
import type { TeachingTrustTier } from "./trustClassifier";
import type { TrainingContextResult } from "./trainingContextTypes";

export type TeachingOrchestrationResult = TrainingContextResult & {
  classification: {
    tier: TeachingTrustTier;
    moveTrust: TrainingContextResult["moveTrust"];
    contextTrust: TrainingContextResult["contextTrust"];
    safeToRecommendMove: boolean;
    safeToShowAnswerVisuals: boolean;
    safeToShowContextVisuals: boolean;
    reason: string;
  };
  debug: TrainingContextResult["debug"] & {
    visualBudget: TrainingContextResult["visualDecision"]["visualBudgetUsed"];
    rejectedStories: Array<{ id: string; kind: string; total: number; reasons: string[] }>;
  };
};

function legacyTier(result: TrainingContextResult): TeachingTrustTier {
  if (result.moveTrust === "engine_verified") return "engine_verified";
  if (result.moveTrust === "book_supported") return "book_supported";
  if (result.moveTrust === "repertoire_supported") return "repertoire_supported";
  if (result.moveTrust === "engine_close") return "repertoire_supported";
  if (result.moveTrust === "reveal_only_unverified") return "context_only";
  if (result.moveTrust === "strong_alternative") return "strong_alternative";
  if (result.mode === "assisted_context") return "context_only";
  if (result.mode === "line_needs_review") return "needs_review";
  return "unavailable";
}

export function orchestrateTeaching(input: CollectTeachingEvidenceInput & {
  trainerView: "assisted" | "plain";
  showAnswer: boolean;
  isUserTurn: boolean;
  trainingMode: "restricted" | "continuation";
}): TeachingOrchestrationResult {
  const evidence = collectTeachingEvidence(input);
  const result = buildTrainingContext({
    fenBefore: input.teachingInput.fenBefore,
    fenAfter: input.teachingInput.fenAfter,
    expectedMoveUci: input.expectedMove?.uci ?? input.teachingInput.move.uci,
    expectedMoveSan: input.expectedMove?.san ?? input.teachingInput.move.san,
    topMoves: input.engineTopMoves?.map((move) => ({
      uci: move.uci,
      san: move.san,
      rank: move.rank,
      scoreCp: move.scoreCp,
    })),
    moveQuality: {
      status: input.teachingInput.validation.internalStatus,
      topMoves: input.engineTopMoves?.map((move) => ({
        rank: move.rank ?? 0,
        uci: move.uci,
        san: move.san,
        scoreCp: move.scoreCp,
        mate: move.mate,
      })) ?? [],
    },
    moveQualityUserStatus: input.teachingInput.validation.userStatus,
    bookSupport: evidence.bookSupport,
    repertoireSupport: Boolean(input.repertoireMoves?.some((move) => move.uci === (input.expectedMove?.uci ?? input.teachingInput.move.uci))),
    trainerView: input.trainerView,
    trainingMode: input.trainingMode,
    isUserTurn: input.isUserTurn,
    showAnswer: input.showAnswer,
  });
  const tier = legacyTier(result);
  return {
    ...result,
    classification: {
      tier,
      moveTrust: result.moveTrust,
      contextTrust: result.contextTrust,
      safeToRecommendMove: result.permission.canRecommendMove,
      safeToShowAnswerVisuals: result.permission.canShowAnswerOverlays,
      safeToShowContextVisuals: result.permission.canShowContextOverlays,
      reason: result.debug.moveTrustReason,
    },
    debug: {
      ...result.debug,
      visualBudget: result.visualDecision.visualBudgetUsed,
      rejectedStories: result.debug.rejectedStories,
    },
  };
}
