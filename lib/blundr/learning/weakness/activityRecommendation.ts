import type { WeaknessProjection } from "@/lib/blundr/contracts";

export function recommendDailyIntervention(
  projection: WeaknessProjection,
): WeaknessProjection["recommendedDailyIntervention"] {
  return projection.confidence >= 0.55 && projection.score >= 0.45
    ? "recall_move"
    : "review_position";
}
