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
  coachCard: TrainerFrameCoachCardResolution;
  visual: TrainerFrameVisualResolution;
  coachQuality: TrainerFrameCoachQualityResolution;
};
