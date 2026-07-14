import type {
  ActivityAttemptState,
  ActivityBuildResult,
  ActivityEvidence,
  AnswerSafeActivityPresentation,
} from "@/lib/blundr/daily/core/dailyActivityConformance";
export type CandidateChoiceCandidate = {
  id: string;
  label: string;
  uci: string;
  evidence: ActivityEvidence;
};
export type CandidateChoiceSolution = {
  acceptedIds: readonly string[];
  candidates: readonly CandidateChoiceCandidate[];
  feedbackById: Readonly<Record<string, string>>;
};
export type CandidateChoiceCard =
  ActivityBuildResult<CandidateChoiceSolution> & {
    positionFen?: string;
    prompt?: string;
  };
export type CandidateChoiceState = ActivityAttemptState & {
  selectedId: string | null;
  events: readonly string[];
};
export type CandidateChoicePresentation = AnswerSafeActivityPresentation;
