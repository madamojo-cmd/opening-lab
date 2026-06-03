export interface StockfishMoveEvaluation {
  uci: string;
  san: string;
  rank: number;
  centipawnsFromSideToMove: number;
  mateIn: number | null;
  depth: number;
  nodes?: number;
  isLegal: boolean;
  source: "stockfish";
  generatedAt: number;
}

export interface StockfishTopMovesResult {
  fen: string;
  sideToMove: "w" | "b" | null;
  depth: number;
  multipv: number;
  topMoves: StockfishMoveEvaluation[];
  bestMoveUci: string | null;
  bestMoveSan: string | null;
  providerStatus: "ready" | "loading" | "unavailable" | "error";
  errorReason?: string;
}

export interface MoveStrengthRating {
  label: "Genius" | "Best" | "Excellent" | "Good" | "Inaccuracy" | "Mistake" | "Blunder" | "Ungraded";
  severity: "positive" | "neutral" | "warning" | "danger" | "unknown";
  centipawnLoss: number | null;
  rank: number | null;
  reason: string;
  isUserFacing: boolean;
  debug: Record<string, unknown>;
}

export type MoveRatingMethod =
  | "multipv_exact_match"
  | "direct_after_move_eval"
  | "mate_swing"
  | "unavailable";

export type MoveRatingConfidence = "high" | "medium" | "low" | "unavailable";

export interface ContinuationUserMoveRatingResult extends MoveStrengthRating {
  visibleBadgeLabel: Exclude<MoveStrengthRating["label"], "Ungraded"> | null;
  badgeVisible: boolean;
  badgeSuppressedReason: "none" | "engine_unavailable" | "evaluation_timeout" | "stale_position" | "insufficient_evidence";
  providerStatus: StockfishTopMovesResult["providerStatus"];
  ratingMethod: MoveRatingMethod;
  userMoveFoundInTopMoves: boolean;
  userMoveRank: number | null;
  bestMoveUci: string | null;
  bestMoveSan: string | null;
  bestEvalCp: number | null;
  userEvalCp: number | null;
  depth: number | null;
  mateBefore: number | null;
  mateAfter: number | null;
  normalizedForMoverColor: boolean;
  legal: boolean;
  stale: boolean;
  confidence: MoveRatingConfidence;
}

export interface ContinuationSuggestionValidation {
  candidateUci: string;
  candidateSan: string;
  isTop10: boolean;
  isTop1: boolean;
  rank: number | null;
  centipawnLossFromBest: number | null;
  accepted: boolean;
  rejectionReason: string | null;
  replacementUci?: string;
  replacementSan?: string;
  providerStatus: StockfishTopMovesResult["providerStatus"];
}
