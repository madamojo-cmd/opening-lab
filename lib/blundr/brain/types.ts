/**
 * Blundr Brain Production Types (v2.7.39+ → Production)
 * Per strict Brain V2 Production Spec.
 */

import type { CurrentInstructionTarget, CurrentInstructionFrame } from "../runtime/currentInstructionFrame";

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

  stockfishValidation: StockfishValidation | null;

  explanationPlan: ExplanationPlan | null;
  coachClaims: CoachClaim[];
  safetyLinterResult: CoachClaimSafetyResult;

  mistakeDiagnosis?: MistakeDiagnosis | null;

  debug: BrainDebugPacket;
};
