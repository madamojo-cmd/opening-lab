import type { DailyBlundrAttemptOutcome, DailyBlundrCard, DailyBlundrDifficulty, DailyBlundrMasteryState } from "../dailyBlundrTypes";
import type { DailyBlundrReviewAttempt, DailyBlundrReviewCard } from "../dailyBlundrReviewTypes";

export type DailyTrainingTargetId =
  | "reply_radar"
  | "opening_branch_builder"
  | "opponent_reply_trainer"
  | "break_timing_drill"
  | "key_square_click";

export type DailyTrainingTargetSkillId =
  | "candidate_move_recognition"
  | "opponent_reply_recognition"
  | "branch_memory"
  | "move_order_precision"
  | "common_reply"
  | "break_timing"
  | "pawn_break"
  | "key_square_awareness"
  | "square_control";

export type DailyTrainingTargetInteractionKind = "move_input" | "multiple_choice" | "square_click" | "sequence";

export type DailyTrainingTargetCandidateMove = {
  uci: string;
  san?: string | null;
  label?: string | null;
  isCorrect: boolean;
  explanation?: string | null;
};

export type DailyTrainingTargetState = {
  trainingTargetId: DailyTrainingTargetId;
  skillIds: DailyTrainingTargetSkillId[];
  difficulty: DailyBlundrDifficulty;
  interactionKind: DailyTrainingTargetInteractionKind;
  startFen: string;
  currentFen: string;
  learnerSide: "white" | "black";
  sideToMove: "w" | "b";
  prompt: string;
  expectedMoveUci?: string | null;
  expectedMoveSan?: string | null;
  expectedSequenceUci?: string[];
  candidateMoves?: DailyTrainingTargetCandidateMove[];
  targetSquares?: string[];
  correctSquareKeys?: string[];
  selectedSquares?: string[];
  moveLimit?: number;
  plyCount: number;
  completed: boolean;
  won?: boolean;
  bestKnownScore?: number;
  formationHash: string;
  noveltyKey: string;
  sourceCardKey?: string | null;
  sourceLabel?: string | null;
  lastMoveUci?: string | null;
  lastMoveSan?: string | null;
};

export type DailyBlundrTrainingTargetCard = DailyBlundrCard & {
  kind: "training_target";
  trainingTarget: DailyTrainingTargetState;
};

export type DailyTrainingTargetGenerationContext = {
  dateKey: string;
  now: string;
  mastery: DailyBlundrMasteryState | null;
  difficulty: DailyBlundrDifficulty;
  currentMastery: number;
  confidence: number;
  dueReviewCount: number;
  selectedReviewCount: number;
  reviewCards: readonly DailyBlundrReviewCard[];
  reviewAttempts: readonly DailyBlundrReviewAttempt[];
  candidateDailyCards: readonly DailyBlundrCard[];
  recentTrainingTargetIds: readonly DailyTrainingTargetId[];
  recentFenKeys: readonly string[];
  sessionTrainingTargetIds: readonly DailyTrainingTargetId[];
};

export type DailyTrainingTargetAdvanceAttempt = {
  from?: string | null;
  to?: string | null;
  uci?: string | null;
  san?: string | null;
  legal?: boolean;
  square?: string | null;
  choiceUci?: string | null;
  usedReveal?: boolean;
};

export type DailyTrainingTargetScoreInput = {
  card?: DailyBlundrTrainingTargetCard | null;
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
  usedReveal?: boolean;
  reason?: string;
};

export type DailyTrainingTargetScoreResult = {
  score: number;
  correct: boolean;
  partialCredit: number;
  usedReveal: boolean;
  outcome: DailyBlundrAttemptOutcome;
  reason: string;
  summary: string;
};

export type DailyTrainingTargetAdvanceResult = {
  state: DailyTrainingTargetState;
  completed: boolean;
  won: boolean;
  legal: boolean;
  reason: string;
  attemptedMoveUci: string | null;
  attemptedMoveSan: string | null;
  selectedSquare?: string | null;
  selectedChoiceUci?: string | null;
  responseMoveUci?: string | null;
  responseMoveSan?: string | null;
  moveCount: number;
  illegalMoveCount: number;
  scoreInput: DailyTrainingTargetScoreInput;
};

export type DailyTrainingTargetDefinition = {
  id: DailyTrainingTargetId;
  title: string;
  summary: string;
  skillIds: DailyTrainingTargetSkillId[];
  recommendedFor: DailyBlundrDifficulty[];
  generate: (ctx: DailyTrainingTargetGenerationContext) => DailyBlundrTrainingTargetCard | null;
  scoreAttempt: (args: DailyTrainingTargetScoreInput) => DailyTrainingTargetScoreResult;
};

export type DailyTrainingTargetSelection = {
  definition: DailyTrainingTargetDefinition;
  card: DailyBlundrTrainingTargetCard;
  currentMastery: number;
  confidence: number;
  difficulty: DailyBlundrDifficulty;
  reason: string;
};
