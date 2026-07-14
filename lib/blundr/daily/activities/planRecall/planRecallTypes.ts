import type {
  ActivityAttemptState,
  ActivityBuildResult,
  ActivityEvidence,
  AnswerSafeActivityPresentation,
} from "@/lib/blundr/daily/core/dailyActivityConformance";
export type PlanQuestionType =
  | "pawn_break"
  | "key_square"
  | "piece_improvement"
  | "opponent_threat"
  | "favorable_exchange"
  | "next_plan";
export type PlanQuestion = {
  type: PlanQuestionType;
  prompt: string;
  choices: readonly { id: string; label: string }[];
  acceptedIds: readonly string[];
  validForFen: boolean;
  evidence: ActivityEvidence;
  explanation: string;
};
export type PlanRecallSolution = { question: PlanQuestion };
export type PlanRecallPresentation = AnswerSafeActivityPresentation;
export type PlanRecallState = ActivityAttemptState & {
  selectedId: string | null;
};
