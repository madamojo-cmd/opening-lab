export interface LegalMoveSummary {
  moveUci: string;
  moveSan: string;
  from: string;
  to: string;
  piece: string;
  isCapture: boolean;
  isCheck: boolean;
  promotion?: string;
}

export interface MaiaMoveDistribution {
  elo: number;
  moveProbabilities: Record<string, number>;
  topMoves: Array<{ moveUci: string; probability: number; rank: number }>;
}

export interface MaiaSkillGradient {
  moveUci: string;
  probabilityBelow?: number;
  probabilityCurrent?: number;
  probabilityAbove?: number;
  probabilityAdvanced?: number;
  deltaCurrentToAbove?: number;
  deltaBelowToAdvanced?: number;
  trend: "beginner_instinct" | "stable_human_move" | "improver_move" | "advanced_move" | "declines_with_skill" | "unclear";
}

export interface MaiaSignalSet {
  status: "available" | "unavailable" | "error";
  source: "maia2" | "mock" | "none";
  userElo: number;
  opponentElo: number;
  topMoves: Array<{ moveUci: string; moveSan?: string; probability: number; rank: number }>;
  moveProbabilities: Record<string, number>;
  winProbability?: number;
  entropy: number;
  topMoveProbability: number;
  humanConsensus: "high" | "medium" | "low";
  multiElo?: {
    below: MaiaMoveDistribution;
    current: MaiaMoveDistribution;
    above: MaiaMoveDistribution;
    advanced: MaiaMoveDistribution;
  };
  skillGradients: MaiaSkillGradient[];
}

export interface EngineSignalSet {
  status: "available" | "pending" | "unavailable" | "error";
  evalBeforeCp?: number;
  bestMoveUci?: string;
  bestMoveSan?: string;
  candidates: Array<{
    moveUci: string;
    moveSan?: string;
    evalAfterCp?: number;
    evalDeltaCp?: number;
    rank?: number;
    safety: "best" | "safe" | "playable" | "inaccuracy" | "mistake" | "blunder" | "severe_warning" | "unknown";
    isTopEngineMove: boolean;
  }>;
}

export interface PositionFeatureSet {
  centerState: "closed" | "tense" | "open" | "fluid" | "unknown";
  kingSafety: "safe" | "watch_center" | "exposed" | "in_check" | "unknown";
  developmentStatus: "behind" | "normal" | "ahead" | "unknown";
  leastActivePieces: string[];
  openFiles: string[];
  semiOpenFiles: string[];
  plausiblePawnBreaks: string[];
  castlingStatus: {
    white: "castled" | "uncastled" | "lost_rights" | "unknown";
    black: "castled" | "uncastled" | "lost_rights" | "unknown";
  };
  materialTension: "none" | "low" | "medium" | "high" | "unknown";
  pieceCoordinationTags: string[];
  tacticalAlert: "none" | "possible" | "confirmed_simple_check" | "unknown";
}

export interface PatternSignalSet {
  connectedConcepts: Array<{ conceptId: string; strength: number; reason: string }>;
  weakConceptMatches: string[];
  transferOpportunity: boolean;
  reviewRelevance: number;
}

export interface UserMemorySignalSet {
  recentPatternIds: string[];
  weakConcepts: string[];
  priorMissesInSimilarPositions: number;
  hintsUsedRecently: number;
  answerRevealsRecently: number;
}

export interface PositionEvidencePacket {
  frameId: string;
  fen: string;
  normalizedFen: string;
  sideToMove: "w" | "b";
  moveHistorySan: string[];
  phase: "opening" | "early_middlegame" | "middlegame" | "endgame";
  bookStatus: "in_book" | "book_complete" | "near_book" | "out_of_book";
  legalMoves: LegalMoveSummary[];
  positionFeatures: PositionFeatureSet;
  maiaSignals?: MaiaSignalSet;
  engineSignals?: EngineSignalSet;
  patternSignals?: PatternSignalSet;
  userMemorySignals?: UserMemorySignalSet;
  focusMove?: {
    moveUci: string;
    moveSan: string;
    from: string;
    to: string;
    piece: string;
    isCapture: boolean;
    isCheck: boolean;
    isMate: boolean;
  } | null;
  stale: boolean;
  evidenceStatus: "ready" | "partial" | "pending" | "unavailable" | "stale";
}

export type CandidateMoveClass =
  | "natural_good"
  | "predictable_human_mistake"
  | "hard_to_find_good_move"
  | "quiet_improvement"
  | "premature_attack"
  | "pattern_transfer_move"
  | "human_playable_not_best"
  | "irrelevant_bad_move"
  | "book_pattern"
  | "unknown";

export interface CandidateMoveProfile {
  moveUci: string;
  moveSan: string;
  maiaProbability?: number;
  maiaRank?: number;
  skillTrend?: MaiaSkillGradient["trend"];
  engineSafety?: EngineSignalSet["candidates"][number]["safety"];
  engineDeltaCp?: number;
  bookSupport: boolean;
  repertoireSupport: boolean;
  patternSupport: boolean;
  featureSupport: string[];
  moveClass: CandidateMoveClass;
  exactRecommendationAllowed: boolean;
  explanationConfidence: number;
  reviewValue: number;
}

export type HumanEngineDivergence =
  | "aligned_natural_good"
  | "human_temptation_bad"
  | "engine_move_hard_for_humans"
  | "human_move_playable_not_best"
  | "no_clear_signal";

export type CoachOpportunity =
  | "predictable_human_mistake"
  | "hard_to_find_good_move"
  | "natural_good_move"
  | "pattern_transfer"
  | "plan_transition"
  | "center_decision"
  | "king_safety_urgent"
  | "least_active_piece"
  | "premature_attack_warning"
  | "opponent_human_response"
  | "review_reinforcement"
  | "supported_continuation"
  | "silence";

export type LiveCoachIntent = "ask_question" | "warn" | "reinforce" | "explain_plan" | "compare_instincts" | "connect_pattern" | "nudge" | "reveal" | "stay_silent";

export type LiveCoachConfidence = "high_move_specific" | "medium_plan_specific" | "safe_principle" | "low_say_nothing";

export interface CoachOpportunityScore {
  opportunity: CoachOpportunity;
  intent: LiveCoachIntent;
  confidenceScore: number;
  pedagogicalValue: number;
  userRelevance: number;
  novelty: number;
  revealRisk: number;
  exactMoveAllowed: boolean;
  evidenceSources: Array<"maia" | "engine" | "book" | "repertoire" | "position_features" | "pattern_memory" | "user_memory">;
  candidateMoveUci?: string;
  candidateMoveSan?: string;
  reason: string;
  totalScore?: number;
}
