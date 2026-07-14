import type { WeaknessConfidenceInput } from "./weaknessTypes";

export function calculateWeaknessConfidence(
  input: WeaknessConfidenceInput,
): number {
  const independent = Math.max(0, Math.min(5, input.independentMisses)) * 0.15;
  const sourceBonus = Math.max(0, Math.min(3, input.sourceCount - 1)) * 0.08;
  const ambiguityPenalty =
    Math.max(0, Math.min(3, input.ambiguousEvidence)) * 0.12;
  return Math.max(
    0,
    Math.min(1, 0.2 + independent + sourceBonus - ambiguityPenalty),
  );
}
