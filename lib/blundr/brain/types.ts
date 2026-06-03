/**
 * Blundr Brain Production Types (v2.7.39+ → Production)
 * Per strict Brain V2 Production Spec.
 */

import type { CurrentInstructionTarget, CurrentInstructionFrame } from "../runtime/currentInstructionFrame";

export type EvidenceClaimStrength =
  | "verified"
  | "probable"
  | "template_safe"
  | "blocked";

export type EvidenceProvenanceSource =
  | "board_truth"
  | "move_semantics"
  | "tactical_motif"
  | "strategic_feature"
  | "opening_context"
  | "visual_evidence"
  | "stockfish"
  | "maia"
  | "opening_knowledge"
  | "grounded_phrasing"
  | "safety_gate";

export interface EvidenceProvenance {
  source: EvidenceProvenanceSource;
  sourceId?: string;
  confidence: "high" | "medium" | "low";
  note?: string;
}

export type CoachEvidenceClaimType =
  | "development"
  | "center_control"
  | "king_safety"
  | "castling"
  | "pressure"
  | "capture"
  | "check"
  | "checkmate"
  | "pawn_break"
  | "piece_activity"
  | "tactical_motif"
  | "strategic_feature"
  | "opening_plan"
  | "candidate_comparison"
  | "opponent_resource"
  | "human_mistake"
  | "safe_fallback";

export interface CoachEvidenceClaim {
  id: string;
  frameKey: string;
  type: CoachEvidenceClaimType;
  strength: EvidenceClaimStrength;
  targetUci: string;
  subjectSquare?: string;
  objectSquare?: string;
  pieceType?: string;
  textSafeSummary: string;
  machineFacts: Record<string, unknown>;
  provenance: EvidenceProvenance[];
}

export interface EvidenceGraph {
  frameKey: string;
  targetUci: string | null;
  claims: CoachEvidenceClaim[];
  deterministicClaims: CoachEvidenceClaim[];
  tacticClaims: CoachEvidenceClaim[];
  strategicClaims: CoachEvidenceClaim[];
  visualEvidence: CoachEvidenceClaim[];
  blockedClaims: CoachEvidenceClaim[];
  contradictions: Array<{
    id: string;
    severity: "warning" | "critical";
    message: string;
    claimIds: string[];
  }>;
  providerStatus: Record<string, "not_applicable" | "available" | "unavailable" | "timeout" | "error">;
  debug: Record<string, unknown>;
}

// Core contracts from production spec
export type BlundrBrainInput = {
  fen: string;
  legalMoves: any[]; // LegalMove[] - will be properly typed in implementation
  currentInstructionFrame: CurrentInstructionFrame | null;
  trainingMode: "guided" | "continuation" | "review" | "plain" | "assisted";
  userColor: "white" | "black";
  lessonContext?: any | null;
  openingContext?: any | null;
  previousAttempts?: any[];
  engineContext?: any | null;
};

export type BoardTruth = any; // Will be expanded in boardTruth/ submodules
export type MoveDeltaAnalysis = any;
export type TacticalMotif = any;
export type StrategicFeature = any;
export type OpeningPlanMatch = any;
export type PedagogicalFocus = any;
export type StockfishValidation = any;
export type ExplanationPlan = any;
export type CoachClaim = any;
export type CoachClaimSafetyResult = any;
export type MistakeDiagnosis = any;
export type BrainEvidence = any;
export type BrainDebugPacket = any;

export type CandidateEvaluation = {
  uci: string;
  san: string;
  pieceType: string;
  from: string;
  to: string;
  legal: boolean;
  score: number;
  engineSafety: "engine_best" | "top_tier" | "acceptable_teaching_move" | "book_safe" | "uncertain" | "unsafe" | "blunder" | "unknown";
  engineRank?: number | null;
  evalDelta?: number | null;
  pedagogicalScore: number;
  tacticalScore: number;
  strategicScore: number;
  planFitScore: number;
  riskScore: number;
  explanationPotential: number;
  moveDelta: MoveDeltaAnalysis;
  tacticalMotifs: TacticalMotif[];
  strategicFeatures: StrategicFeature[];
  planFit: any[];
  rejected: boolean;
  rejectionReasons: string[];
  evidence: BrainEvidence[];
};

export type BlundrBrainAnalysis = {
  version: string;
  fen: string;
  sideToMove: "white" | "black";

  boardTruth: BoardTruth;

  legalCandidates: CandidateEvaluation[];
  selectedTeachingCandidate: CandidateEvaluation | null;
  selectedContinuationCandidate: CandidateEvaluation | null;

  currentTarget: {
    uci: string;
    san: string;
    pieceType: string;
    from: string;
    to: string;
    source: "lesson" | "branch" | "continuation" | "review" | "engine" | "brain";
  } | null;

  moveDelta: MoveDeltaAnalysis | null;
  tacticalMotifs: TacticalMotif[];
  strategicFeatures: StrategicFeature[];
  openingPlan: OpeningPlanMatch | null;
  pedagogicalFocus: PedagogicalFocus | null;

  // v2.7.40 Agent 5: minimal Brain foundation for coach intelligence chain
  // CurrentInstructionFrame.target is source; these derive strictly from it + basic facts (no halluc)
  conceptClassification: string | null; // e.g. "development" | "king_safety" | "central_control" | "improvement"
  evidenceClaims: string[]; // e.g. ["target_development", "piece_knight", "is_central"]
  safeFallbackCopy: {
    title: string;
    body: string;
    hint?: string;
    pieceType: string; // ALWAYS matches currentTarget.pieceType or null
    targetUci: string | null;
    targetSan: string | null;
    evidenceClaims: string[];
    isSafe: boolean; // piece match + no banned + evidence backed
  } | null;

  stockfishValidation: StockfishValidation | null;

  explanationPlan: ExplanationPlan | null;
  coachClaims: CoachClaim[];
  safetyLinterResult: CoachClaimSafetyResult;

  mistakeDiagnosis?: MistakeDiagnosis | null;

  debug: BrainDebugPacket;
};
