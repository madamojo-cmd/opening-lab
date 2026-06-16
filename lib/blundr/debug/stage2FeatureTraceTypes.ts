export type Stage2FeatureTraceStatus = "complete" | "partial" | "missing";

export type Stage2FeatureTraceMissingReason =
  | "no_detected_features"
  | "no_selected_concept"
  | "no_ranked_opportunities"
  | "approved_content_disabled"
  | "visual_recipe_not_connected"
  | "coachcard_fallback_used"
  | "legacy_surface_used"
  | "not_instructional_frame"
  | "move_fact_unavailable"
  | "stage2_resolution_unavailable";

export interface Stage2FeatureTraceDetectedFeature {
  id: string;
  label: string;
  source: "board_feature" | "move_fact" | "plan" | "evidence_graph";
  confidence?: string | null;
  conceptId?: string | null;
  evidence: string[];
  canMention: boolean;
  canDominate: boolean;
}

export interface Stage2FeatureTraceDetectedConcept {
  id: string;
  label: string;
  source: "board_feature" | "move_fact" | "plan" | "selected_opportunity";
  featureIds: string[];
  evidence: string[];
}

export interface Stage2FeatureTraceRankedOpportunity {
  rank: number;
  id: string;
  layer: string;
  intent: string;
  totalScore: number;
  canRender: boolean;
  selected: boolean;
  rejectedReason: string | null;
  moveUci: string | null;
  moveSan: string | null;
  conceptId: string | null;
  planId: string | null;
  recipeId: string | null;
}

export interface Stage2FeatureTraceCoachCardResult {
  preAuthority: {
    title: string | null;
    body: string | null;
    buttons: string[];
    source: string | null;
    authority: string;
  };
  pipeline: {
    title: string | null;
    body: string | null;
    buttons: string[];
    source: string | null;
    authority: string;
  };
  finalRendered: {
    title: string | null;
    body: string | null;
    buttons: string[];
    source: string | null;
    authority: string;
  };
  renderedCopyAuthority: "pipeline_coach_decision" | "visible_surface_v28" | "unknown";
  pipelineCopyRejected: boolean;
  pipelineCopyRejectedReason: string | null;
  fallbackUsed: boolean;
  fallbackReason: string | null;
  visibleCoachOwner: string | null;
  visibleTitle: string | null;
  visibleBody: string | null;
  visibleButtons: string[];
  moveUci: string | null;
  moveSan: string | null;
  targetMatchesMoveUci: boolean | "unknown";
  targetMatchesMoveSan: boolean | "unknown";
  finalRenderedTitle: string | null;
  finalRenderedBody: string | null;
}

export interface Stage2FeatureTraceVisualRecipeResult {
  authority: "approved_recipe" | "generated_recipe" | "fallback_current_surface" | "none";
  approvedRecipeRendered: boolean;
  generatedRecipeRendered: boolean;
  fallbackCurrentSurfaceRendered: boolean;
  noVisualsRendered: boolean;
  rendered: boolean;
  recipeId: string | null;
  patternId: string | null;
  moveUci: string | null;
  moveSan: string | null;
  targetMatchesMoveUci: boolean | "unknown";
  blockedByTargetMismatch: boolean;
  adapterAllowed: boolean | null;
  adapterSuppressedReason: string | null;
  primitiveIds: string[];
  source: string | null;
}

export interface Stage2FeatureTraceTimelineEntry {
  stage: "detected" | "ranked" | "rendered";
  frameId: string | number | null;
  details: Record<string, unknown>;
}

export interface Stage2FeatureTrace {
  frameId: string | number | null;
  fen4: string;
  openingId: string | null;
  lineId: string | null;
  moveUci: string | null;
  moveSan: string | null;
  boardFacts: Record<string, unknown>;
  detectedFeatures: Stage2FeatureTraceDetectedFeature[];
  detectedConcepts: Stage2FeatureTraceDetectedConcept[];
  rankedOpportunities: Stage2FeatureTraceRankedOpportunity[];
  selectedOpportunity: Stage2FeatureTraceRankedOpportunity | null;
  coachCardResult: Stage2FeatureTraceCoachCardResult;
  visualRecipeResult: Stage2FeatureTraceVisualRecipeResult;
  finalRenderedTitle: string | null;
  finalRenderedBody: string | null;
  traceStatus: Stage2FeatureTraceStatus;
  missingReasons: Stage2FeatureTraceMissingReason[];
}

export interface Stage2FeatureTraceBundle {
  featureTrace: Stage2FeatureTrace;
  featureTraceTimeline: Stage2FeatureTraceTimelineEntry[];
}
