import type { DailyBlundrAttemptOutcome, DailyBlundrCard, DailyBlundrDifficulty, DailyBlundrMasteryState } from "../dailyBlundrTypes";

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

export type DailyMiniGameState = {
  miniGameId: DailyMiniGameId;
  scenarioId?: string;
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
