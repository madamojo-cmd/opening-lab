import type { WeaknessScoreInput } from "./weaknessTypes";

export function calculateWeaknessScore(input: WeaknessScoreInput): number {
  const severity =
    input.severity === "high" ? 1 : input.severity === "medium" ? 0.7 : 0.4;
  const recency = Math.max(0, Math.min(1, 1 - input.recencyDays / 30));
  return Math.max(
    0,
    Math.min(
      1,
      severity *
        input.confidence *
        (0.65 + recency * 0.35) *
        (1 - input.masteryConfidence * 0.4),
    ),
  );
}
