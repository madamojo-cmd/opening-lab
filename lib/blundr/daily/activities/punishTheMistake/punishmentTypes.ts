import type {
  ActivityAttemptState,
  ActivityBuildResult,
  ActivityEvidence,
  AnswerSafeActivityPresentation,
} from "@/lib/blundr/daily/core/dailyActivityConformance";
export type PunishmentSolution = {
  bestResponses: readonly string[];
  continuation: readonly string[];
  explanation: string;
  mistakeMove: string;
};
export type PunishmentPresentation = AnswerSafeActivityPresentation;
export type PunishmentState = ActivityAttemptState & {
  sequence: readonly string[];
  moveIndex: number;
  resetCount: number;
};
export type PunishmentBuild = ActivityBuildResult<PunishmentSolution>;
