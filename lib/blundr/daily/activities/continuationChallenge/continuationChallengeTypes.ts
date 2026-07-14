import type {
  ActivityAttemptState,
  ActivityBuildResult,
  ActivityEvidence,
  AnswerSafeActivityPresentation,
} from "@/lib/blundr/daily/core/dailyActivityConformance";
export type ContinuationObjective =
  | "complete_development"
  | "execute_pawn_break"
  | "neutralize_threat"
  | "improve_worst_piece"
  | "control_key_square"
  | "favorable_exchange";
export type ContinuationSolution = {
  objective: ContinuationObjective;
  userMoves: readonly string[];
  opponentReplies: readonly string[];
  explanation: string;
  maxUserMoves: 3;
};
export type ContinuationPresentation = AnswerSafeActivityPresentation;
export type ContinuationState = ActivityAttemptState & {
  userMoveCount: number;
  objectiveScore: number;
  moveQualityScore: number;
  pendingReply: boolean;
  terminal: boolean;
};
export type ContinuationBuild = ActivityBuildResult<ContinuationSolution>;
