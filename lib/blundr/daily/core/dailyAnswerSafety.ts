import type { DailyBlundrCard } from "../dailyBlundrTypes";
import type { DailyMiniGameScenario } from "../miniGames/dailyMiniGameTypes";
import type {
  DailyTrainingTargetCandidateMove,
  DailyTrainingTargetState,
} from "../trainingTargets/dailyTrainingTargetTypes";

export type AnswerFreeTrainingTargetCandidate = Omit<
  DailyTrainingTargetCandidateMove,
  "isCorrect" | "explanation"
>;
export type AnswerFreeTrainingTarget = Omit<
  DailyTrainingTargetState,
  | "expectedMoveUci"
  | "expectedMoveSan"
  | "expectedSequenceUci"
  | "candidateMoves"
  | "targetSquares"
  | "correctSquareKeys"
> & {
  candidateMoves?: AnswerFreeTrainingTargetCandidate[];
};
export type AnswerFreeMiniGameScenario = Omit<
  DailyMiniGameScenario,
  | "acceptedMoves"
  | "solution"
  | "targetSquares"
  | "goalSquares"
  | "acceptedSquares"
  | "candidateMoves"
>;
export type DailyAnswerFreePresentation = Omit<
  DailyBlundrCard,
  | "expectedMoveUci"
  | "expectedMoveSan"
  | "playedMoveUci"
  | "playedMoveSan"
  | "miniGame"
  | "trainingTarget"
>;

export function toAnswerFreeTrainingTarget(
  state: DailyTrainingTargetState,
): AnswerFreeTrainingTarget {
  const {
    expectedMoveUci: _expectedMoveUci,
    expectedMoveSan: _expectedMoveSan,
    expectedSequenceUci: _expectedSequenceUci,
    targetSquares: _targetSquares,
    correctSquareKeys: _correctSquareKeys,
    candidateMoves,
    ...safe
  } = state;
  return {
    ...safe,
    candidateMoves: candidateMoves?.map(
      ({ isCorrect: _isCorrect, explanation: _explanation, ...candidate }) =>
        candidate,
    ),
  };
}

export function toAnswerFreeMiniGameScenario(
  scenario: DailyMiniGameScenario,
): AnswerFreeMiniGameScenario {
  const {
    acceptedMoves: _acceptedMoves,
    solution: _solution,
    targetSquares: _targetSquares,
    goalSquares: _goalSquares,
    acceptedSquares: _acceptedSquares,
    candidateMoves: _candidateMoves,
    ...safe
  } = scenario;
  return safe;
}

export function containsAnswerBearingPresentationKeys(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  if (Array.isArray(value))
    return value.some(containsAnswerBearingPresentationKeys);
  return Object.entries(value as Record<string, unknown>).some(
    ([key, child]) => {
      if (
        [
          "expectedMoveUci",
          "expectedMoveSan",
          "expectedSequenceUci",
          "correctSquareKeys",
          "targetSquares",
          "acceptedMoves",
          "solution",
          "isCorrect",
        ].includes(key)
      )
        return true;
      return containsAnswerBearingPresentationKeys(child);
    },
  );
}
