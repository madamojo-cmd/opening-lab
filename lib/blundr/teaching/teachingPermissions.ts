import type { TeachingTrustClassification } from "./trustClassifier";

export type TeachingPermission = {
  tier: string;
  userLabel: string;
  canRecommendMove: boolean;
  canShowMoveArrow: boolean;
  canShowPatternCue: boolean;
  canShowContextCue: boolean;
  canShowAnswerOverlays: boolean;
  canShowContextOverlays: boolean;
  canShowRevealMove: boolean;
  canShowAlternatives: boolean;
  canShowPlanIndicators: boolean;
  canShowWeakSquareHighlights: boolean;
  canShowIdealPieceSquares: boolean;
  canShowDebugEvidence: boolean;
};

export type ViewContext = {
  trainerView: "assisted" | "plain";
  showAnswer: boolean;
};

function labelForTier(tier: TeachingTrustClassification["tier"]): string {
  if (tier === "engine_verified") return "Blundr Brain Validated";
  if (tier === "book_supported") return "Book-supported pattern";
  if (tier === "repertoire_supported") return "Saved training pattern";
  if (tier === "strong_alternative") return "Strong alternative";
  if (tier === "context_only") return "Assisted context";
  if (tier === "needs_review") return "Line needs review";
  return "Move not verified";
}

export function deriveTeachingPermission(classification: TeachingTrustClassification, viewContext: ViewContext): TeachingPermission {
  if (viewContext.trainerView === "plain" && !viewContext.showAnswer) {
    return {
      tier: classification.tier,
      userLabel: "Plain View • No hints",
      canRecommendMove: false,
      canShowMoveArrow: false,
      canShowPatternCue: false,
      canShowContextCue: false,
      canShowAnswerOverlays: false,
      canShowContextOverlays: false,
      canShowRevealMove: true,
      canShowAlternatives: false,
      canShowPlanIndicators: false,
      canShowWeakSquareHighlights: false,
      canShowIdealPieceSquares: false,
      canShowDebugEvidence: true,
    };
  }

  const base: TeachingPermission = {
    tier: classification.tier,
    userLabel: labelForTier(classification.tier),
    canRecommendMove: classification.safeToRecommendMove,
    canShowMoveArrow: classification.safeToShowAnswerVisuals,
    canShowPatternCue: classification.safeToRecommendMove,
    canShowContextCue: classification.safeToShowContextVisuals,
    canShowAnswerOverlays: classification.safeToShowAnswerVisuals,
    canShowContextOverlays: classification.safeToShowContextVisuals,
    canShowRevealMove: true,
    canShowAlternatives: classification.tier === "strong_alternative",
    canShowPlanIndicators: classification.safeToShowContextVisuals,
    canShowWeakSquareHighlights: classification.safeToShowContextVisuals,
    canShowIdealPieceSquares: classification.safeToShowContextVisuals,
    canShowDebugEvidence: true,
  };

  if (classification.tier === "engine_verified" || classification.tier === "book_supported") {
    return {
      ...base,
      canRecommendMove: true,
      canShowMoveArrow: true,
      canShowPatternCue: true,
      canShowAnswerOverlays: true,
      canShowContextCue: true,
      canShowContextOverlays: true,
      canShowPlanIndicators: true,
    };
  }

  if (classification.tier === "repertoire_supported") {
    return {
      ...base,
      canRecommendMove: false,
      canShowMoveArrow: viewContext.showAnswer,
      canShowPatternCue: true,
      canShowAnswerOverlays: viewContext.showAnswer,
      canShowContextCue: true,
      canShowContextOverlays: true,
    };
  }

  if (classification.tier === "strong_alternative") {
    return {
      ...base,
      canRecommendMove: false,
      canShowMoveArrow: false,
      canShowPatternCue: false,
      canShowContextCue: true,
      canShowAnswerOverlays: false,
      canShowContextOverlays: true,
    };
  }

  if (classification.tier === "needs_review" || classification.tier === "context_only") {
    return {
      ...base,
      canRecommendMove: false,
      canShowMoveArrow: false,
      canShowPatternCue: false,
      canShowContextCue: true,
      canShowAnswerOverlays: false,
      canShowContextOverlays: true,
    };
  }

  return {
    ...base,
    canRecommendMove: false,
    canShowMoveArrow: false,
    canShowPatternCue: false,
    canShowContextCue: false,
    canShowAnswerOverlays: false,
    canShowContextOverlays: false,
    canShowPlanIndicators: false,
    canShowWeakSquareHighlights: false,
    canShowIdealPieceSquares: false,
  };
}
