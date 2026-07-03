import type { DailyBlundrAttemptOutcome, DailyBlundrCard, DailyBlundrDifficulty, DailyBlundrMasteryState } from "../dailyBlundrTypes";

export type DailyMiniGameId = "king_race" | "knight_gymnasium" | "pawn_wars";

export type DailyMiniGameSkillId =
  | "king_pathing"
  | "opposition"
  | "goal_zone"
  | "knight_geometry"
  | "shortest_path"
  | "pawn_race"
  | "promotion"
  | "passed_pawn";

export type DailyMiniGameState = {
  miniGameId: DailyMiniGameId;
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

export type DailyMiniGameDefinition = {
  id: DailyMiniGameId;
  title: string;
  summary: string;
  skillIds: DailyMiniGameSkillId[];
  recommendedFor: DailyBlundrDifficulty[];
  generate: (ctx: DailyMiniGameGenerationContext) => DailyBlundrMiniGameCard | null;
  scoreAttempt: (args: DailyMiniGameScoreInput) => DailyMiniGameScoreResult;
};

export type DailyMiniGameSelection = {
  definition: DailyMiniGameDefinition;
  card: DailyBlundrMiniGameCard;
  currentMastery: number;
  confidence: number;
  difficulty: DailyBlundrDifficulty;
  reason: string;
};
