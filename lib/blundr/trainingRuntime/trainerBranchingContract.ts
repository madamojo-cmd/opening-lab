import type {
  RuntimeCandidateMove,
  RuntimeOpeningNode,
} from "./trainingRuntimeSchema";

export const TRAINER_BRANCHING_CAP_BY_CHILD_PLY = [
  0, 8, 8, 4, 4, 3, 3, 2, 2, 2, 2, 2, 2,
] as const;
export const TRAINER_MAX_PLY = 12;
export const TRAINER_MIN_TOTAL_GAMES = 500;
export const TRAINER_PROFILE = "all_blitz_rapid_classical_1200_plus";

export function trainerBranchingCap(childPly: number): number {
  return TRAINER_BRANCHING_CAP_BY_CHILD_PLY[childPly] ?? 0;
}

export type TrainerBranchingValidation = {
  roots: number;
  nodes: number;
  edges: number;
  terminalOpenings: number;
  issues: string[];
};

export function validateTrainerBranchingContract(
  nodes: readonly RuntimeOpeningNode[],
  candidates: readonly RuntimeCandidateMove[],
): TrainerBranchingValidation {
  const byKey = new Map(
    nodes.map((node) => [`${node.openingId}:${node.playKey}`, node]),
  );
  const candidateByKey = new Map(
    candidates.map((candidate) => [
      `${candidate.openingId}:${candidate.playKeyBefore}:${candidate.moveUci}`,
      candidate,
    ]),
  );
  const childCounts = new Map<string, number>();
  const openings = new Set(nodes.map((node) => node.openingId));
  const terminals = new Set(
    nodes
      .filter((node) => node.ply === TRAINER_MAX_PLY)
      .map((node) => node.openingId),
  );
  const issues: string[] = [];
  const rootsByOpening = new Map<string, number>();
  let edges = 0;
  for (const node of nodes) {
    if (node.ply > TRAINER_MAX_PLY)
      issues.push(`depth:${node.openingId}:${node.playKey}`);
    if (node.profileId && node.profileId !== TRAINER_PROFILE)
      issues.push(`profile:${node.openingId}:${node.playKey}`);
    if (
      typeof node.totalGames === "number" &&
      node.totalGames < TRAINER_MIN_TOTAL_GAMES
    )
      issues.push(`frequency:${node.openingId}:${node.playKey}`);
    const moves = node.playKey.split(",").filter(Boolean);
    if (moves.length <= 1) {
      rootsByOpening.set(
        node.openingId,
        (rootsByOpening.get(node.openingId) ?? 0) + 1,
      );
      continue;
    }
    const parentKey = moves.slice(0, -1).join(",");
    const parent = byKey.get(`${node.openingId}:${parentKey}`);
    if (!parent) {
      // Runtime roots are seeded per opening and can start after ply one.
      rootsByOpening.set(
        node.openingId,
        (rootsByOpening.get(node.openingId) ?? 0) + 1,
      );
      continue;
    }
    edges += 1;
    const move = moves.at(-1)!;
    const evidence = candidateByKey.get(
      `${node.openingId}:${parentKey}:${move}`,
    );
    if (!evidence || typeof evidence.rank !== "number")
      issues.push(`evidence:${node.openingId}:${node.playKey}`);
    else if (evidence.rank > trainerBranchingCap(node.ply))
      issues.push(`rank:${node.openingId}:${node.playKey}`);
    const countKey = `${node.openingId}:${parentKey}`;
    childCounts.set(countKey, (childCounts.get(countKey) ?? 0) + 1);
  }
  for (const [parent, count] of childCounts) {
    const childPly = (byKey.get(parent)?.ply ?? TRAINER_MAX_PLY) + 1;
    if (count > trainerBranchingCap(childPly)) issues.push(`breadth:${parent}`);
  }
  if (
    rootsByOpening.size !== openings.size ||
    [...rootsByOpening.values()].some((count) => count !== 1)
  )
    issues.push("opening_roots");
  if (terminals.size !== openings.size) issues.push("terminal_openings");
  return {
    roots: rootsByOpening.size,
    nodes: nodes.length,
    edges,
    terminalOpenings: terminals.size,
    issues: issues.sort(),
  };
}
