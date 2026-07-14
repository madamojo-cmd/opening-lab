import { legalMoves } from "../activityUtils";
import type { CandidateChoiceSolution } from "./candidateChoiceTypes";
export function validateCandidateSet(
  positionFen: string,
  solution: CandidateChoiceSolution,
): string[] {
  const moves = legalMoves(positionFen);
  if (!Array.isArray(moves)) return [moves.reason];
  const legal = new Set(moves.map((move) => move.uci));
  const errors: string[] = [];
  if (solution.candidates.length < 3) errors.push("candidate_count");
  if (!solution.acceptedIds.length) errors.push("missing_accepted_move");
  if (solution.candidates.some((candidate) => !legal.has(candidate.uci)))
    errors.push("illegal_candidate");
  if (
    new Set(solution.candidates.map((candidate) => candidate.uci)).size !==
    solution.candidates.length
  )
    errors.push("duplicate_candidate");
  return errors;
}
