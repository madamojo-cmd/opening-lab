import type { RuntimeCandidateMove } from "./trainingRuntimeSchema";

export function buildCandidateIndex(
  candidates: readonly RuntimeCandidateMove[],
): Map<string, RuntimeCandidateMove[]> {
  const index = new Map<string, RuntimeCandidateMove[]>();
  for (const candidate of candidates) {
    const key = `${candidate.openingId}:${candidate.playKeyBefore}`;
    index.set(
      key,
      [...(index.get(key) ?? []), candidate].sort(
        (a, b) =>
          (a.rank ?? 0) - (b.rank ?? 0) || a.moveUci.localeCompare(b.moveUci),
      ),
    );
  }
  return index;
}
