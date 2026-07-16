import type { RuntimeCandidateMove, RuntimeOpeningNode } from "./trainingRuntimeSchema";
import { TRAINER_MAX_PLY } from "./trainerBranchingContract";

export type TrainerTreeIndex = {
  nodesByKey: ReadonlyMap<string, RuntimeOpeningNode>;
  childMovesByParent: ReadonlyMap<string, readonly RuntimeCandidateMove[]>;
};

export type DailyEvidenceIndex = {
  candidatesByParent: ReadonlyMap<string, readonly RuntimeCandidateMove[]>;
};

export function createRuntimeEvidenceIndices(
  nodes: readonly RuntimeOpeningNode[],
  candidates: readonly RuntimeCandidateMove[],
): { trainer: TrainerTreeIndex; daily: DailyEvidenceIndex } {
  const nodesByKey = new Map(nodes.map((node) => [`${node.openingId}:${node.playKey}`, node]));
  const all = new Map<string, RuntimeCandidateMove[]>();
  const nodeBacked = new Map<string, RuntimeCandidateMove[]>();
  for (const candidate of candidates) {
    const key = `${candidate.openingId}:${candidate.playKeyBefore}`;
    all.set(key, [...(all.get(key) ?? []), candidate]);
    const parent = nodesByKey.get(key);
    const childKey = `${candidate.openingId}:${candidate.playKeyBefore},${candidate.moveUci}`;
    if (parent && parent.ply < TRAINER_MAX_PLY && nodesByKey.has(childKey))
      nodeBacked.set(key, [...(nodeBacked.get(key) ?? []), candidate]);
  }
  const sort = (moves: readonly RuntimeCandidateMove[]) =>
    [...moves].sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99) || a.moveUci.localeCompare(b.moveUci));
  return {
    trainer: {
      nodesByKey,
      childMovesByParent: new Map([...nodeBacked].map(([key, moves]) => [key, sort(moves)])),
    },
    daily: { candidatesByParent: new Map([...all].map(([key, moves]) => [key, sort(moves)])) },
  };
}
