import type {
  ActivityAttemptState,
  ActivityBuildResult,
  ActivityEvidence,
  AnswerSafeActivityPresentation,
} from "@/lib/blundr/daily/core/dailyActivityConformance";
export type LegalRoute = { moves: readonly string[]; finalFen: string };
export type TranspositionSolution = {
  standardRoute: readonly string[];
  alternateRoute: readonly string[];
  expectedMoves: readonly string[];
  sharedFen: string;
};
export type TranspositionPresentation = AnswerSafeActivityPresentation;
export type TranspositionState = ActivityAttemptState & {
  userMove: string | null;
  routeRecognition: "unattempted" | "recognized" | "missed";
};
export type TranspositionBuild = ActivityBuildResult<TranspositionSolution>;
