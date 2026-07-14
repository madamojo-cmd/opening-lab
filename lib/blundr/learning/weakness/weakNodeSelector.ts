import type { WeaknessProjection } from "@/lib/blundr/contracts";

export function selectWeakNodes(
  projections: readonly WeaknessProjection[],
  limit = 5,
): WeaknessProjection[] {
  return projections
    .filter(
      (projection) => projection.access === "active" && projection.score > 0,
    )
    .slice(0, Math.max(0, limit));
}
