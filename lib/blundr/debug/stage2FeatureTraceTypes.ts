export type Stage2FeatureTraceStatus = "complete" | "partial" | "missing";

export type Stage2FeatureTraceFrameKind =
  | "instructional_user_turn"
  | "continuation_user_turn"
  | "branch_complete"
  | "terminal"
  | "opponent_replying"
  | "system";

export type Stage2FeatureTraceReviewEventResult = "not_attempted" | "correct" | "miss" | "revealed" | "skipped";

export interface Stage2FeatureTraceReviewCandidateEventPreview {
  openingId: string | null;
  lineId: string | null;
  fen4: string | null;
  targetUci: string | null;
  targetSan: string | null;
  conceptIds: string[];
  selectedTheme: string | null;
  selectedOpportunityId: string | null;
  viewMode: "assisted" | "plain";
  usedHint: boolean;
  usedShowMore: boolean;
  result: Stage2FeatureTraceReviewEventResult;
  coachCardSource: "approved" | "live" | "safe_fallback";
  visualRecipeId: string | null;
}

export type Stage2FeatureTraceMissingReason =
  | "no_detected_features"
  | "no_selected_concept"
  | "no_ranked_opportunities"
  | "approved_content_disabled"
  | "approved_content_not_matched"
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

export interface Stage2FeatureTracePromotionResult {
  pendingPromotion: Record<string, unknown> | null;
  promotionPickerRendered: boolean;
  promotionOptions: string[];
  selectedPromotionPiece: string | null;
  attemptedPromotionUci: string | null;
  acceptedPromotionUci: string | null;
  acceptedTargetUci: string | null;
  promotionAuthorityMatched: boolean | null;
  promotionAuthorityMismatchReason: string | null;
  promotionAuthorityTargetUci: string | null;
}

export interface Stage2FeatureTraceTimelineEntry {
  stage: "detected" | "ranked" | "rendered";
  frameId: string | number | null;
  details: Record<string, unknown>;
}

export interface Stage2FeatureTrace {
  frameId: string | number | null;
  frameKind: Stage2FeatureTraceFrameKind;
  fen4: string;
  openingId: string | null;
  lineId: string | null;
  playKeyBefore: string | null;
  playKey: string | null;
  moveUci: string | null;
  moveSan: string | null;
  targetUci: string | null;
  targetSan: string | null;
  targetSource: string | null;
  acceptedTargetUci: string | null;
  approvedPacket: {
    matched: boolean;
    packetKind: "approved_packet" | "safe_fallback" | "none";
    packetId: string | null;
    sourceBundle: string | null;
    sourceFile: string | null;
    packetStatus: string | null;
    approvalReadiness: string | null;
    missReason: string | null;
    fallbackReason: string | null;
    visualSource: string | null;
  };
  boardFacts: Record<string, unknown>;
  detectedFeatures: Stage2FeatureTraceDetectedFeature[];
  detectedConcepts: Stage2FeatureTraceDetectedConcept[];
  featureDetectorContributed: boolean;
  selectedFeatureIds: string[];
  selectedConceptId: string | null;
  selectedTheme: string | null;
  rankedOpportunities: Stage2FeatureTraceRankedOpportunity[];
  selectedOpportunity: Stage2FeatureTraceRankedOpportunity | null;
  coachCardResult: Stage2FeatureTraceCoachCardResult;
  approvedContentMatched: boolean;
  approvedPacketId: string | null;
  approvedPacketKind: "approved_packet" | "safe_fallback" | "none";
  approvedPacketSourceBundle: string | null;
  approvedPacketMissReason: string | null;
  approvedPacketFallbackReason: string | null;
  coachCardSource: "approved" | "live" | "safe_fallback";
  copyAuthority: string | null;
  visualRecipeResult: Stage2FeatureTraceVisualRecipeResult;
  visualSource: "approved_recipe" | "generated_recipe" | "fallback_current_surface" | "none";
  visualRecipeId: string | null;
  visualTargetUci: string | null;
  visualFallbackUsed: boolean;
  targetMatchesCoachCard: boolean | "unknown";
  targetMatchesVisual: boolean | "unknown";
  plainViewLeakSafe: boolean;
  promotion: Stage2FeatureTracePromotionResult;
  finalRenderedTitle: string | null;
  finalRenderedBody: string | null;
  traceStatus: Stage2FeatureTraceStatus;
  missingReasons: Stage2FeatureTraceMissingReason[];
  reviewCandidateEventEligible: boolean;
  reviewCandidateEventPreview: Stage2FeatureTraceReviewCandidateEventPreview | null;
  warnings: string[];
  criticalIssues: string[];
}

export interface Stage2FeatureTraceBundle {
  featureTrace: Stage2FeatureTrace;
  featureTraceTimeline: Stage2FeatureTraceTimelineEntry[];
}
