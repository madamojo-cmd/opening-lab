import type { CandidateChoiceSolution } from "./candidateChoiceTypes";
export function scoreCandidateChoice(
  selectedId: string | null,
  solution: CandidateChoiceSolution,
): { correct: boolean; feedback: string } {
  return {
    correct: Boolean(selectedId && solution.acceptedIds.includes(selectedId)),
    feedback: selectedId
      ? (solution.feedbackById[selectedId] ?? "Recorded.")
      : "No answer selected.",
  };
}
