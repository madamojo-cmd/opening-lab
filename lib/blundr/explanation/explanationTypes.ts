import type { CoachTeachingIntent, OpportunityLayer } from "../opportunity/opportunityTypes";

export type TemplateCategory =
  | "castling"
  | "king_safety"
  | "development"
  | "bishop_activity"
  | "knight_activity"
  | "center_control"
  | "italian_c3_d4"
  | "rook_activity"
  | "pawn_structure"
  | "piece_quality"
  | "imbalance"
  | "strategic_plan"
  | "continuation"
  | "plain_recall"
  | "reveal_answer"
  | "fallback";

export type CoachRatingBucket = "beginner" | "intermediate" | "advanced";

export type TemplateVariableName =
  | "moveSan"
  | "moveUci"
  | "pieceName"
  | "fromSquare"
  | "toSquare"
  | "targetSquare"
  | "targetPiece"
  | "centerBreakSquare"
  | "leverMove"
  | "fileName"
  | "diagonalName"
  | "kingSideOrQueenSide"
  | "rookFrom"
  | "rookTo"
  | "weakSquare"
  | "weakColorComplex"
  | "outpostSquare"
  | "pawnStructureType"
  | "planName"
  | "repertoireConcept"
  | "nextPlan"
  | "ratingDepth"
  | "sideToMove"
  | "featureSummary"
  | "opponentPlan"
  | "defensiveIdea";

export interface CoachTemplate {
  id: string;
  category: TemplateCategory;
  intent: CoachTeachingIntent;
  opportunityLayers: OpportunityLayer[];
  conceptIds: string[];
  planTypes?: string[];
  requiredClaimTypes?: string[];
  requiredFeatureClaimTypes?: string[];
  requiredPlanTypes?: string[];
  requiredVariables?: TemplateVariableName[];
  forbiddenIfMissing?: string[];
  forbiddenTermsUnlessClaimed?: string[];
  ratingBuckets: CoachRatingBucket[];
  tone: "plain" | "encouraging" | "deep" | "urgent" | "review";
  maxSentences: number;
  maxTokensApprox: number;
  titleTemplate?: string;
  bodyTemplate: string;
  variableNames: TemplateVariableName[];
  safety: {
    leaksAnswerInPlain: boolean;
    mentionsTactic: boolean;
    mentionsPermanentWeakness: boolean;
    mentionsForcedLine: boolean;
    mentionsEvaluation: boolean;
    mentionsHumanPopulation: boolean;
    mentionsExactMove: boolean;
  };
}

export interface RenderedCoachExplanation {
  title: string;
  body: string;
  templateId?: string;
  utteranceFamily: string;
  blockedReasons: string[];
  safetyStatus: "passed" | "blocked";
}
