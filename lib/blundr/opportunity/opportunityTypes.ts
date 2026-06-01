export type OpportunityLayer =
  | "expected_move"
  | "visual_recipe"
  | "tactical"
  | "strategic"
  | "educational"
  | "repertoire"
  | "engine_candidate"
  | "fallback";

export type CoachTeachingIntent =
  | "explain_visual_recipe"
  | "explain_training_move"
  | "recall_prompt"
  | "recall_hint"
  | "reveal_answer"
  | "show_continued_plan"
  | "analyze_candidate_idea"
  | "show_trusted_move"
  | "branch_transition"
  | "position_context"
  | "silent";

export interface TeachingOpportunity {
  id: string;
  layer: OpportunityLayer;
  intent: CoachTeachingIntent;
  titleKey?: string;
  moveUci?: string;
  moveSan?: string;
  conceptId?: string;
  patternId?: string;
  planId?: string;
  recipeId?: string;
  requiredClaimIds: string[];
  requiredFeatureClaimIds: string[];
  requiredPlanIds: string[];
  forbiddenIfMissing: string[];
  specificityScore: number;
  pedagogicalValue: number;
  urgencyScore: number;
  confidenceScore: number;
  repertoireRelevance: number;
  visualAlignmentScore: number;
  planCoherenceScore: number;
  ratingFitScore: number;
  repetitionPenalty: number;
  safetyPenalty: number;
  layerPrior: number;
  totalScore: number;
  canRender: boolean;
  blockedReason?: string;
  debug: Record<string, unknown>;
}
