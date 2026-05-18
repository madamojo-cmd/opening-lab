import type { TeachingConceptId, VisualArrow, VisualLine, VisualSquareCue } from "./teachingCueTypes";

export type TeachingStoryKind =
  | "immediate_tactic"
  | "tactical_pressure"
  | "king_safety"
  | "center_decision"
  | "development"
  | "improve_piece"
  | "open_file"
  | "weak_square"
  | "pawn_break"
  | "coordination"
  | "prophylaxis"
  | "book_pattern"
  | "strong_alternative"
  | "move_unavailable_context"
  | "line_needs_review_context";

export type TeachingStoryScore = {
  tacticalUrgency: number;
  materialImpact: number;
  kingSafetyImpact: number;
  openingRelevance: number;
  strategicDepth: number;
  userClarity: number;
  visualTeachability: number;
  confidence: number;
  novelty: number;
  riskPenalty: number;
  overclaimPenalty: number;
  total: number;
};

export type TeachingStoryRejectionReason =
  | "low_confidence"
  | "overclaim_risk"
  | "reveal_risk_blocked"
  | "requires_untrusted_move"
  | "visual_clutter"
  | "inferior_score";

export type TeachingStoryCandidate = {
  id: string;
  kind: TeachingStoryKind;
  conceptId: TeachingConceptId;
  title: string;
  body: string;
  side: "w" | "b";
  relevantSquares: string[];
  relevantPieces: string[];
  candidateMoveUci?: string;
  isMoveRecommendation: boolean;
  revealRisk: "none" | "low" | "medium" | "high";
  claimSafety: "safe" | "cautious" | "speculative";
  visualPlan: {
    primaryArrow?: VisualArrow;
    relationshipLines: VisualLine[];
    keySquares: VisualSquareCue[];
    ghostSquares: VisualSquareCue[];
    dangerSquares: VisualSquareCue[];
  };
  evidenceRefs: string[];
  score: TeachingStoryScore;
  rejectionReasons: TeachingStoryRejectionReason[];
};

export type TeachingStorySelectionResult = {
  selected: TeachingStoryCandidate | null;
  rejectedTop: TeachingStoryCandidate[];
  explanation: string;
  scoreTable: Array<{ id: string; kind: TeachingStoryKind; conceptId: TeachingConceptId; total: number; reasons: TeachingStoryRejectionReason[] }>;
};
