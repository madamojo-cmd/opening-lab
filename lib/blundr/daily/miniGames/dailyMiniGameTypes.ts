import type { DailyBlundrAttemptOutcome, DailyBlundrCard, DailyBlundrDifficulty, DailyBlundrMasteryState } from "../dailyBlundrTypes";
import type { BlundrBoardPreferences } from "@/lib/blundr/board/boardThemeTypes";
import type { DailyValidationIssue } from "../validation/dailyValidationTypes";

export type DailyMiniGameId =
  | "king_race"
  | "knight_gymnasium"
  | "pawn_wars"
  | "tactic_shots"
  | "key_square_conquest"
  | "structure_builder"
  | "imbalance_arena"
  | "technique_lab";

export type DailyMiniGameSkillId =
  | "king_pathing"
  | "opposition"
  | "goal_zone"
  | "knight_geometry"
  | "shortest_path"
  | "pawn_race"
  | "promotion"
  | "passed_pawn"
  | "forks"
  | "pins"
  | "skewers"
  | "discovered_attack"
  | "back_rank"
  | "overloaded_piece"
  | "key_square_control"
  | "outpost"
  | "invasion_square"
  | "king_entry"
  | "blockade"
  | "pawn_structure"
  | "pawn_break"
  | "isolated_pawn"
  | "backward_pawn"
  | "pawn_chain"
  | "bishop_vs_knight"
  | "rook_activity"
  | "exchange_value"
  | "material_imbalance"
  | "color_complex"
  | "conversion"
  | "zugzwang"
  | "triangulation"
  | "rook_endgame"
  | "mating_net";

export type DailyMiniGameSource = "daily_deck" | "standalone_review";

export type DailyMiniGameScenarioValidation = {
  checkedAt: string;
  valid: boolean;
  attempts: number;
  issues: DailyValidationIssue[];
};

export type DailyMiniGameScenarioSolution = {
  uci: string;
  san: string | null;
};

export type DailyMiniGameScenarioScoring = {
  mode: "single_move" | "route" | "choice";
  maxAttempts: number;
  revealPenalty: number;
  canRetry: boolean;
  correctMoveReward: number;
};

export type DailyMiniGameScenarioRetryBehavior = {
  allowRetry: boolean;
  refreshSeedOnRetry: boolean;
  nextLabel: "Continue" | "Next";
};

export type DailyMiniGameScenarioRevealBehavior = {
  revealLabel: "Reveal";
  continueLabel: "Continue" | "Next";
  showAnswerLabel?: string | null;
  markReviewedLabel?: string | null;
};

export type DailyMiniGameScenarioNovelty = {
  scenarioKey: string;
  cooldownGroup: string;
  recentScenarioKeys: string[];
  avoidedRepeat: boolean;
};

export type DailyMiniGameScenario = {
  id: string;
  miniGameId: DailyMiniGameId;
  source: DailyMiniGameSource;
  seed: string;
  generatedAt: string;
  createdAt: string;
  fen: string;
  sideToMove: "w" | "b";
  prompt: string;
  instructions: string;
  goal: string;
  acceptedMoves: string[];
  solution: DailyMiniGameScenarioSolution;
  explanation: string;
  conceptTags: string[];
  difficulty: DailyBlundrDifficulty;
  estimatedTimeSeconds: number;
  validation: DailyMiniGameScenarioValidation;
  scoring: DailyMiniGameScenarioScoring;
  retryBehavior: DailyMiniGameScenarioRetryBehavior;
  revealBehavior: DailyMiniGameScenarioRevealBehavior;
  novelty: DailyMiniGameScenarioNovelty;
  theme: string;
  targetSquares?: string[];
  goalSquares?: string[];
  acceptedSquares?: string[];
  boardOrientationHint?: "white" | "black" | "auto";
  candidateMoves?: Array<{ uci: string; san: string | null; label: string; correct: boolean }>;
};

export type DailyMiniGameState = {
  miniGameId: DailyMiniGameId;
  scenarioId?: string;
  scenario?: DailyMiniGameScenario | null;
  skillIds: DailyMiniGameSkillId[];
  difficulty: DailyBlundrDifficulty;
  startFen: string;
  currentFen: string;
  sideToMove: "w" | "b";
  learnerSide: "white" | "black";
  goalSquares?: string[];
  targetSquares?: string[];
  flagSquares?: string[];
  moveLimit: number;
  plyCount: number;
  bestKnownScore?: number;
  completed: boolean;
  won?: boolean;
  capturedTargetSquares?: string[];
  visitedGoalSquares?: string[];
  formationHash: string;
  noveltyKey: string;
  lastMoveUci?: string | null;
  lastMoveSan?: string | null;
};

export type DailyBlundrMiniGameCard = DailyBlundrCard & {
  kind: "mini_game";
  miniGame: DailyMiniGameState;
};

export type DailyMiniGameGenerationContext = {
  dateKey: string;
  now: string;
  mastery: DailyBlundrMasteryState | null;
  difficulty: DailyBlundrDifficulty;
  currentMastery: number;
  confidence: number;
  dueReviewCount: number;
  selectedReviewCount: number;
  recentMiniGameIds: readonly DailyMiniGameId[];
  recentFenKeys: readonly string[];
  sessionMiniGameIds: readonly DailyMiniGameId[];
  source?: DailyMiniGameSource;
  seed?: string | null;
  userIdOrLocalId?: string | null;
  recentScenarioKeys?: readonly string[];
  boardPreferences?: Partial<BlundrBoardPreferences> | null;
  deckId?: string | null;
  miniGameId?: DailyMiniGameId | null;
};

export type DailyMiniGameScoreInput = {
  card?: DailyBlundrMiniGameCard | null;
  completed: boolean;
  won: boolean;
  moveCount: number;
  moveLimit: number;
  bestKnownMoves?: number | null;
  illegalMoveCount?: number;
  blocked?: boolean;
  perfectPath?: boolean;
  objectiveCount?: number;
  objectivesCompleted?: number;
  reason?: string;
};

export type DailyMiniGameScoreResult = {
  score: number;
  correct: boolean;
  partialCredit: number;
  usedReveal: boolean;
  outcome: DailyBlundrAttemptOutcome;
  reason: string;
  summary: string;
};

export type DailyMiniGameAdvanceResult = {
  state: DailyMiniGameState;
  completed: boolean;
  won: boolean;
  legal: boolean;
  reason: string;
  attemptedMoveUci: string | null;
  attemptedMoveSan: string | null;
  responseMoveUci?: string | null;
  responseMoveSan?: string | null;
  moveCount: number;
  illegalMoveCount: number;
  scoreInput: DailyMiniGameScoreInput;
};

export type DailyMiniGameAdvanceAttempt = {
  from: string;
  to: string;
  uci: string;
  san: string | null;
  legal: boolean;
};

export type DailyMiniGameDefinition = {
  id: DailyMiniGameId;
  title: string;
  summary: string;
  displayName?: string;
  shortDescription?: string;
  skillIds: DailyMiniGameSkillId[];
  recommendedFor: DailyBlundrDifficulty[];
  instructions?: string;
  estimatedSeconds?: number;
  tags?: string[];
  canAppearInDailyBlundr?: boolean;
  canAppearInStandalonePractice?: boolean;
  selectionPriority?: number;
  generate: (ctx: DailyMiniGameGenerationContext) => DailyBlundrMiniGameCard | null;
  scoreAttempt: (args: DailyMiniGameScoreInput) => DailyMiniGameScoreResult;
  advance?: (state: DailyMiniGameState, attempt: DailyMiniGameAdvanceAttempt) => DailyMiniGameAdvanceResult;
};

export type DailyMiniGameSelection = {
  definition: DailyMiniGameDefinition;
  card: DailyBlundrMiniGameCard;
  currentMastery: number;
  confidence: number;
  difficulty: DailyBlundrDifficulty;
  reason: string;
};
