import type {
  WeaknessExplanation,
  WeaknessProjection,
} from "@/lib/blundr/contracts";

export function explainWeakness(
  projection: WeaknessProjection,
): WeaknessExplanation {
  return {
    positionKey: projection.positionKey,
    explanation:
      projection.explanation || "This position needs another verified review.",
    recommendedDailyIntervention: projection.recommendedDailyIntervention,
  };
}
