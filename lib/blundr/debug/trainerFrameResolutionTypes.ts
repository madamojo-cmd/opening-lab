import type { PendingPromotion, PromotionPiece } from "../runtime/promotionAuthority";
import type { Stage2ProviderWarning, Stage2ProviderWarningSummary } from "../providers/providerWarningPolicy";

export type TrainerFrameCoachCardAuthority = "pipeline_coach_decision" | "visible_surface_v28" | "unknown";

export type TrainerFrameCoachCardCopy = {
  title: string | null;
  body: string | null;
  buttons: string[];
  source: string | null;
  authority: TrainerFrameCoachCardAuthority;
};

export type TrainerFrameCoachCardResolution = {
  preAuthority: TrainerFrameCoachCardCopy;
  pipeline: TrainerFrameCoachCardCopy;
  finalRendered: TrainerFrameCoachCardCopy;
  renderedCopyAuthority: TrainerFrameCoachCardAuthority;
  finalRenderedMatchesPipeline: boolean;
  finalRenderedMatchesPreAuthority: boolean;
};

export type TrainerFrameVisualAuthority = "approved_recipe" | "generated_recipe" | "fallback_current_surface" | "none";

export type TrainerFrameVisualResult = {
  rendered: boolean;
  visualSource: TrainerFrameVisualAuthority;
  finalVisualTargetUci: string | null;
  finalVisualTargetSan: string | null;
  approvedRecipeMatched: boolean;
  approvedRecipeId: string | null;
  approvedRecipeTargetMoveUci: string | null;
  generatedRecipeRendered: boolean;
  fallbackSurfaceVisualsRendered: boolean;
  primitiveCount: number;
  sourceSquare: string | null;
  destinationSquare: string | null;
  targetMatchesInstruction: boolean | "not_applicable";
  targetMatchesCoachCard: boolean | "not_applicable";
  plainViewSuppressed: boolean;
  castlingNormalized: boolean | "not_applicable";
  sourceRuntimeMoveUci: string | null;
  missingReasons: string[];
  warnings: string[];
};

export type TrainerFrameVisualResolution = {
  authority: TrainerFrameVisualAuthority;
  approvedRecipeRendered: boolean;
  generatedRecipeRendered: boolean;
  fallbackCurrentSurfaceRendered: boolean;
  noVisualsRendered: boolean;
  renderedMoveUci: string | null;
  targetMoveUci: string | null;
  targetMatchesMoveUci: boolean | "unknown";
  renderedPrimitiveCount: number;
  surfacePrimitiveCount: number;
  renderedSource: string | null;
  surfaceSource: string | null;
  recipeId: string | null;
  patternId: string | null;
};

export type TrainerFrameCoachQualityResolution = {
  qualityScore: number | null;
  qualityScoreSource: string | null;
  lowQualityTriggered: boolean;
  lowQualityThreshold: number | null;
  lowQualityBasedOn: "final_rendered" | "fallback" | "none";
};

export type TrainerFramePromotionResolution = {
  pendingPromotion: PendingPromotion | null;
  promotionPickerRendered: boolean;
  promotionOptions: string[];
  selectedPromotionPiece: PromotionPiece | null;
  attemptedPromotionUci: string | null;
  acceptedPromotionUci: string | null;
  acceptedTargetUci: string | null;
  promotionAuthorityMatched: boolean | null;
  promotionAuthorityMismatchReason: string | null;
  promotionAuthorityTargetUci: string | null;
};

export type TrainerFrameApprovedContentResolution = {
  matched: boolean;
  packetKind: "approved_packet" | "safe_fallback" | "none";
  packetId: string | null;
  sourceBundle: string | null;
  sourceFile: string | null;
  sourceRuntimeMoveUci: string | null;
  packetStatus: string | null;
  approvalReadiness: string | null;
  missReason: string | null;
  fallbackReason: string | null;
  visualSource: string | null;
};

export type TrainerFrameResolution = {
  frameId: string | number | null;
  trainerPhase: string | null;
  trainerView: string | null;
  trainingMode: string | null;
  isUserTurn: boolean;
  instructionTargetUci: string | null;
  instructionTargetSan: string | null;
  instructionTargetPieceType: string | null;
  coachMoveUci: string | null;
  coachPieceType: string | null;
  acceptedTargetUci: string | null;
  coachCard: TrainerFrameCoachCardResolution;
  visual: TrainerFrameVisualResolution;
  visualResult: TrainerFrameVisualResult;
  coachQuality: TrainerFrameCoachQualityResolution;
  promotion: TrainerFramePromotionResolution;
  approvedContent: TrainerFrameApprovedContentResolution;
  providerWarnings?: Stage2ProviderWarning[];
  providerWarningSummary?: Stage2ProviderWarningSummary;
};
