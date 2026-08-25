import type { ReviewSeed } from "./reviewSeedFactory.ts";
export function dedupeReviewSeeds(seeds: readonly ReviewSeed[]): ReviewSeed[] {
  const map = new Map<string, ReviewSeed>();
  for (const seed of seeds) {
    const existing = map.get(seed.reviewCardId);
    map.set(
      seed.reviewCardId,
      existing
        ? {
            ...existing,
            evidenceIds: [
              ...new Set([...existing.evidenceIds, ...seed.evidenceIds]),
            ].sort(),
          }
        : seed,
    );
  }
  return [...map.values()].sort((a, b) =>
    a.reviewCardId.localeCompare(b.reviewCardId),
  );
}
