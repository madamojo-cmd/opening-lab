import type { PunishmentSolution } from "./punishmentTypes";
export function scorePunishment(
  moves: readonly string[],
  solution: PunishmentSolution,
) {
  const expected = [
    ...solution.bestResponses.slice(0, 1),
    ...solution.continuation,
  ];
  return {
    correct:
      moves.length === expected.length &&
      moves.every((move, index) => move === expected[index]),
    sequenceLength: expected.length,
  };
}
