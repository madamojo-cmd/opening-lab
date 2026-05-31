import type { CoachContext, CoachDecision } from "./coachTypes";

export function buildCoachDebug(context: CoachContext | null, decision: CoachDecision) {
  return {
    coachMode: decision.mode,
    coachAction: decision.action,
    coachUtteranceId: decision.utteranceId,
    coachUtteranceFamily: decision.utteranceFamily,
    coachVariationReason: decision.debug?.coachVariationReason,
    coachHintStrength: decision.debug?.coachHintStrength,
    coachRevealRisk: decision.revealRisk,
    coachGivesAnswer: decision.givesAnswer,
    coachButtons: decision.buttons,
    coachShouldMarkReviewWorthy: decision.shouldMarkReviewWorthy,
    coachSuppressedReason: decision.suppressedReason,
    coachFrameMatchesBoard: context?.recipeFrameMatchesBoard ?? false,
    coachFenMatchesBoard: context?.recipeFenMatchesBoard ?? false,
    recentCoachUtteranceIds: context?.recentUtteranceIds ?? [],
    coachSafetyWarnings: decision.debug?.coachSafetyWarnings ?? [],
  };
}
