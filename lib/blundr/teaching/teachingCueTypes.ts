export type TeachingConceptId =
  | "development_with_pressure"
  | "quiet_development"
  | "center_control"
  | "center_break"
  | "space_gain"
  | "castle_for_safety"
  | "king_safety_escape"
  | "threat_prevention"
  | "defensive_resource"
  | "recapture"
  | "win_loose_piece"
  | "loose_piece_warning"
  | "pin_pressure"
  | "skewer_pressure"
  | "fork_creation"
  | "discovered_attack"
  | "remove_defender"
  | "overload_defender"
  | "deflection"
  | "clearance"
  | "open_file_pressure"
  | "rook_activation"
  | "piece_coordination"
  | "improve_worst_piece"
  | "outpost_control"
  | "queen_danger_warning"
  | "trade_into_better_position"
  | "avoid_bad_trade"
  | "passed_pawn_push"
  | "promotion_race"
  | "king_activity_endgame"
  | "opposition"
  | "zugzwang_pressure"
  | "checkmate_threat"
  | "forcing_check"
  | "safe_capture"
  | "default_pattern";

export type TeachingCueInput = {
  fenBefore: string;
  fenAfter?: string;
  move: {
    san: string;
    uci: string;
    from: string;
    to: string;
    promotion?: string;
    piece?: string;
    captured?: string;
  };
  sideToMove: "w" | "b";
  userColor?: "w" | "b";
  trainerView: "assisted" | "plain";
  trainingMode: "restricted" | "continuation";
  validation: {
    required: boolean;
    userStatus: "idle" | "checking" | "verified" | "needs_review" | "not_verified";
    internalStatus?: string;
  };
  context?: {
    openingName?: string;
    moveNumber?: number;
    isUserTurn?: boolean;
    previousMoveSan?: string;
    reviewMode?: boolean;
  };
  userMemory?: {
    patternSeenCount?: number;
    patternMissedCount?: number;
    patternSuccessCount?: number;
    averageTimeToMoveMs?: number;
  };
};

export type VisualArrow = {
  from: string;
  to: string;
  kind: "move" | "attack" | "defense" | "pressure" | "danger";
};

export type VisualLine = {
  from: string;
  to: string;
  kind: "pressure" | "attack" | "defense" | "pin" | "xray";
};

export type VisualSquareCue = {
  square: string;
  kind: "target" | "center" | "danger" | "support" | "ghost" | "king_safety";
};

export type ConceptScore = {
  conceptId: TeachingConceptId;
  finalScore: number;
  confidence: number;
  deltaStrength: number;
  visualClarity: number;
  pedagogicalValue: number;
  simplicity: number;
  userNeed: number;
  phaseFit: number;
  tacticalUrgency: number;
  penalties: number;
  evidence: string[];
};

export type TeachingCue = {
  id: string;
  conceptId: TeachingConceptId;
  userFacing: {
    badge?: string;
    title: string;
    snippet: string;
    next?: string;
  };
  visual: {
    primaryArrow?: VisualArrow;
    relationshipLines: VisualLine[];
    keySquares: VisualSquareCue[];
    ghostSquares: VisualSquareCue[];
    dangerSquares: VisualSquareCue[];
  };
  debug: {
    confidence: number;
    selectedReason: string;
    candidateCount: number;
    suppressedReasons: string[];
    deltaSummary: string[];
    detectorScores: ConceptScore[];
  };
  metadata: {
    fenBefore: string;
    fenAfter?: string;
    moveSan: string;
    moveUci: string;
    createdAt: string;
    compilerVersion: string;
  };
};

export const TEACHING_CUE_COMPILER_VERSION = "2.7.34";

export type BoardPiece = {
  square: string;
  color: "w" | "b";
  type: "p" | "n" | "b" | "r" | "q" | "k";
};

export type MaterialSummary = {
  w: number;
  b: number;
};

export type BoardAnalysis = {
  fen: string;
  sideToMove: "w" | "b";
  pieces: BoardPiece[];
  kingSquares: Record<"w" | "b", string | undefined>;
  attacksBySquare: Record<string, string[]>;
  defendersBySquare: Record<string, string[]>;
  pieceMobility: Record<string, number>;
  centerControl: Record<"w" | "b", number>;
  extendedCenterControl: Record<"w" | "b", number>;
  kingZoneControl: Record<"w" | "b", number>;
  pinnedPieces: string[];
  loosePieces: string[];
  hangingPieces: string[];
  openFiles: string[];
  halfOpenFiles: Record<"w" | "b", string[]>;
  pawnStructure: {
    doubledPawns: Record<"w" | "b", number>;
    isolatedPawns: Record<"w" | "b", number>;
    passedPawns: Record<"w" | "b", string[]>;
  };
  kingSafety: Record<"w" | "b", number>;
  material: MaterialSummary;
};

export type MoveDelta = {
  movedPiece?: string;
  from: string;
  to: string;
  isCapture: boolean;
  isCheck: boolean;
  isCheckmate: boolean;
  isCastle: boolean;
  isPromotion: boolean;
  isPawnMove: boolean;
  newlyAttackedSquares: string[];
  newlyDefendedSquares: string[];
  newlyAttackedPieces: string[];
  newlyDefendedPieces: string[];
  centerControlDelta: number;
  kingZonePressureDelta: number;
  mobilityDelta: number;
  developmentDelta: number;
  kingSafetyDelta: number;
  fileChange: string[];
  pawnStructureDelta: string[];
  tacticalCandidates: string[];
};

export type ConceptCandidate = {
  conceptId: TeachingConceptId;
  templateContext: Record<string, string | number | undefined>;
  visual: {
    primaryArrow?: VisualArrow;
    relationshipLines: VisualLine[];
    keySquares: VisualSquareCue[];
    ghostSquares: VisualSquareCue[];
    dangerSquares: VisualSquareCue[];
  };
  evidence: string[];
  confidence: number;
  deltaStrength: number;
  visualClarity: number;
  pedagogicalValue: number;
  simplicity: number;
  userNeed: number;
  phaseFit: number;
  tacticalUrgency: number;
  penalties: number;
  suppressedReason?: string;
};
