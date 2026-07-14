import type { ContinuationObjective } from "./continuationChallengeTypes";
export const continuationObjectives: Readonly<
  Record<ContinuationObjective, string>
> = {
  complete_development: "Complete development",
  execute_pawn_break: "Execute the prepared pawn break",
  neutralize_threat: "Neutralize the known threat",
  improve_worst_piece: "Improve the worst-placed piece",
  control_key_square: "Control the key square",
  favorable_exchange: "Complete a favorable exchange",
};
export function isContinuationObjective(
  value: string,
): value is ContinuationObjective {
  return value in continuationObjectives;
}
