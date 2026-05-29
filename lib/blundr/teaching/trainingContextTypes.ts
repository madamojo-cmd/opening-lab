import type { MoveQualityResult } from "./moveQualityGate";
import type { TeachingConceptId, TeachingCue, VisualLine, VisualSquareCue } from "./teachingCueTypes";

export type MoveRecommendationTrust =
  | "engine_verified"
  | "book_supported"
  | "repertoire_supported"
  | "engine_close"
  | "reveal_only_unverified"
  | "strong_alternative"
  | "untrusted"
  | "unavailable";

export type TeachingContextTrust =
  | "rich_context"
  | "safe_context"
  | "minimal_context"
  | "no_safe_context";

export type TrainingContextMode =
  | "move_teaching"
  | "assisted_context"
  | "alternative_feedback"
  | "honest_unavailable"
  | "line_needs_review";

export type GroundedTeachingClaim = {
  id: string;
  text: string;
  grounding: GroundingContract;
};

export type GroundingContract = {
  pieces: string[];
  squares: string[];
  relation?: string;
  beforeAfterDelta?: string;
  whyThisMatters: string;
  evidenceType:
    | "board_geometry"
    | "move_delta"
    | "engine_comparison"
    | "book_support"
    | "repertoire"
    | "safety";
  claimSafety: "safe" | "cautious" | "speculative";
  revealRisk: "none" | "low" | "medium" | "high";
};

export type VisualIntent = {
  category:
    | "answer_move"
    | "castle_move"
    | "piece_activity"
    | "active_square"
    | "center"
    | "loose_piece"
    | "king_safety"
    | "open_file"
    | "weak_square"
    | "endgame_activity"
    | "minimal";
  primarySquare?: string;
  secondarySquare?: string;
  primaryPiece?: string;
  line?: VisualLine;
  squares: VisualSquareCue[];
  allowAnswerArrow: boolean;
  reason: string;
};

export type MoveSemanticEffect = {
  type:
    | "develops_piece"
    | "develops_with_pressure"
    | "improves_piece_activity"
    | "attacks_target"
    | "attacks_loose_piece"
    | "wins_loose_piece"
    | "defends_weakness"
    | "adds_king_safety"
    | "increases_king_pressure"
    | "controls_center"
    | "resolves_center_tension"
    | "prepares_pawn_break"
    | "opens_file"
    | "occupies_outpost"
    | "improves_worst_piece"
    | "coordinates_pieces"
    | "stops_opponent_idea"
    | "passive_development"
    | "misses_more_active_square"
    | "ignores_tactical_urgency";
  conceptId: TeachingConceptId;
  confidence: number;
  relevantSquares: string[];
  relevantPieces: string[];
  targetSquare?: string;
  targetPiece?: string;
  before: string;
  after: string;
  whyItMatters: string;
  claimSafety: "safe" | "cautious" | "speculative";
  revealRisk: "none" | "low" | "medium" | "high";
  requiresMoveRecommendation: boolean;
  allowedInContextOnly: boolean;
  visualIntent: VisualIntent;
  evidenceReason: string;
};

export type MoveSemanticAnalysis = {
  moveUci: string;
  moveSan?: string;
  movingPiece?: string;
  fromSquare: string;
  toSquare: string;
  isCapture: boolean;
  capturedPiece?: string;
  promotion?: string;
  pieceRoleBefore?: string;
  pieceRoleAfter?: string;
  newAttacks: string[];
  newDefenses: string[];
  lostAttacks: string[];
  lostDefenses: string[];
  newlyAttackedTargets: Array<{ square: string; piece: string; loose: boolean; hanging: boolean }>;
  newlyDefendedWeaknesses: string[];
  centerControlChange: number;
  kingZonePressureChange: number;
  developmentChange: number;
  mobilityChange: number;
  fileOrDiagonalChange: string[];
  pawnStructureChange: string[];
  tacticalPressureChange: number;
  prophylacticEffect?: string;
  tradeoffs: string[];
  effects: MoveSemanticEffect[];
  summary: string[];
};

export type FeatureGraphSummary = {
  phase: "opening" | "middlegame" | "endgame" | "unclear";
  loosePieces: string[];
  hangingPieces: string[];
  openFiles: string[];
  halfOpenFilesWhite: string[];
  halfOpenFilesBlack: string[];
  centerTensionSquares: string[];
  exposedKings: string[];
  strongestContext?: string;
};

export type TopMoveComparison = {
  topMoveUci: string;
  topMoveSan?: string;
  relationship:
    | "same_piece_more_active"
    | "same_target_more_direct"
    | "same_plan_different_route"
    | "different_plan"
    | "tactical_urgency"
    | "unclear";
  alternativeTheme: string;
  expectedMoveTheme: string;
  comparisonConfidence: number;
  safeUserFacingSummary: string;
  debugReason: string;
};

export type TrainingContextStoryScore = {
  moveSpecificity: number;
  concreteGrounding: number;
  beforeAfterClarity: number;
  tacticalUrgency: number;
  strategicDepth: number;
  phaseFit: number;
  alternativeComparisonValue: number;
  visualTeachability: number;
  userClarity: number;
  confidence: number;
  genericnessPenalty: number;
  revealRiskPenalty: number;
  overclaimPenalty: number;
  contradictionPenalty: number;
  total: number;
};

export type TrainingContextStory = {
  id: string;
  kind:
    | "move_specific_effect"
    | "same_piece_active_square"
    | "active_square_comparison"
    | "immediate_tactic"
    | "tactical_pressure"
    | "king_safety"
    | "center_decision"
    | "development_with_purpose"
    | "improve_piece"
    | "open_file"
    | "weak_square"
    | "pawn_break"
    | "coordination"
    | "prophylaxis"
    | "endgame_activity"
    | "book_pattern"
    | "strong_alternative"
    | "context_safe_contrast"
    | "honest_unavailable";
  conceptId: TeachingConceptId;
  title: string;
  body: string;
  mode: TrainingContextMode;
  moveUci?: string;
  moveSan?: string;
  isMoveRecommendation: boolean;
  canBeShownWithoutMoveTrust: boolean;
  grounding: GroundingContract;
  semanticEffects: MoveSemanticEffect[];
  topMoveComparison?: TopMoveComparison;
  visualIntent: VisualIntent;
  score: TrainingContextStoryScore;
  rejectionReasons: string[];
};

export type TrainingContextDebug = {
  evidenceSummary: string[];
  selectedStoryGrounding?: GroundingContract;
  moveSemanticSummary: string[];
  topMoveComparisons: TopMoveComparison[];
  storyScores: Array<{ id: string; kind: string; total: number; reasons: string[] }>;
  rejectedStories: Array<{ id: string; kind: string; total: number; reasons: string[] }>;
  moveTrustReason: string;
  validationFailureReason?: string;
  expectedMoveCp?: number;
  bestMoveCp?: number;
  deltaCp?: number;
  repertoireEvidence?: string;
  openingSourceEvidence?: string;
  revealModeActive: boolean;
  contextTrustReason: string;
  permissionFlags: Record<string, boolean | string>;
  suppressionReasons: string[];
  visualConceptAlignment: string;
  savedMoveNotValidated: boolean;
  nextPlaySuppressionReason?: string;
  warnings: string[];
};

export type TrainingContextInput = {
  fenBefore: string;
  fenAfter?: string;
  expectedMoveUci?: string;
  expectedMoveSan?: string;
  userMoveUci?: string;
  userMoveSan?: string;
  topMoves?: Array<{ uci: string; san?: string; rank?: number; scoreCp?: number; mate?: number; pv?: string[] }>;
  moveQuality?: (Omit<Partial<MoveQualityResult>, "status"> & { status?: string }) | null;
  moveQualityUserStatus?: "idle" | "checking" | "verified" | "needs_review" | "not_verified";
  bookSupport?: {
    hasBookSupport?: boolean;
    confidence?: number;
    userLabel?: string;
    reason?: string;
    totalGames?: number;
    moveGames?: number;
    moveShare?: number;
  };
  repertoireSupport?: boolean;
  trainerView: "assisted" | "plain";
  trainingMode: "restricted" | "continuation";
  isUserTurn: boolean;
  showAnswer: boolean;
};

export type TrainingContextPermission = {
  canRecommendMove: boolean;
  canShowMoveArrow: boolean;
  canShowPatternCue: boolean;
  canShowContextCue: boolean;
  canShowAnswerOverlays: boolean;
  canShowContextOverlays: boolean;
  canShowPlanIndicators: boolean;
  canShowAlternatives: boolean;
  canShowDebugEvidence: boolean;
  userLabel: string;
};

export type TrainingContextVisualDecision = {
  visualLines: Array<{ from: string; to: string; kind: "plan" | "attack" | "defense" | "opponent"; label?: string }>;
  visualSquares: Array<{ square: string; kind: "target" | "support" | "danger" | "origin" | "opponent"; role?: string }>;
  answerVisualsShown: boolean;
  contextVisualsShown: boolean;
  planVisualsShown: boolean;
  suppressedReasons: string[];
  visualBudgetUsed: { primaryIdea: number; supportingHighlights: number; lines: number };
  selectedVisualStory?: string;
  revealLevel: "answer" | "context" | "plan";
  emphasis: "subtle" | "normal" | "strong";
  visualConceptAlignment: "aligned" | "visual_concept_mismatch" | "minimal";
};

export type TrainingContextResult = {
  mode: TrainingContextMode;
  moveTrust: MoveRecommendationTrust;
  contextTrust: TeachingContextTrust;
  selectedStory: TrainingContextStory | null;
  cue: TeachingCue;
  visualDecision: TrainingContextVisualDecision;
  permission: TrainingContextPermission;
  userLabel: string;
  moveImpact: { label: string; pct: number; tone: string; note: string };
  nextPlay: { allowed: boolean; san?: string; suppressionReason?: string };
  debug: TrainingContextDebug;
  learningMetadata: Record<string, string | number | boolean | null | undefined>;
};
