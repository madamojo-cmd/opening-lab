export type TrainerEvaluationDisplay = {
  whitePercent: number;
  blackPercent: number;
  label: string;
};

export function resolveTrainerEvaluationDisplay(
  cpWhite: number | null | undefined,
): TrainerEvaluationDisplay | null {
  if (typeof cpWhite !== "number" || !Number.isFinite(cpWhite)) return null;
  const bounded = Math.max(-1200, Math.min(1200, cpWhite));
  const whitePercent = Math.round(
    Math.max(8, Math.min(92, 50 + (bounded / 1200) * 42)),
  );
  const label =
    Math.abs(cpWhite) > 90000
      ? cpWhite > 0
        ? "White mate"
        : "Black mate"
      : Math.abs(cpWhite) < 18
        ? "Equal"
        : `${cpWhite > 0 ? "White" : "Black"} +${(Math.abs(cpWhite) / 100).toFixed(1)}`;
  return {
    whitePercent,
    blackPercent: 100 - whitePercent,
    label,
  };
}
