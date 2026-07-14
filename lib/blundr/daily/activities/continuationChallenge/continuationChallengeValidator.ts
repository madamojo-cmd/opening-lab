import { isContinuationObjective } from "./continuationObjectiveRegistry";
import type { ContinuationSolution } from "./continuationChallengeTypes";
export function validateContinuationChallenge(
  solution: ContinuationSolution,
): string[] {
  return [
    ...(isContinuationObjective(solution.objective)
      ? []
      : ["unsupported_objective"]),
    ...(solution.userMoves.length > 0 && solution.userMoves.length <= 3
      ? []
      : ["invalid_user_move_bound"]),
    ...(solution.opponentReplies.length >= solution.userMoves.length
      ? []
      : ["missing_reply"]),
  ];
}
