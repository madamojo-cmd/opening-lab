export type TrainerEvaluationDisplay = {
  whitePercent: number;
  blackPercent: number;
  label: string;
};

export type TrainerEvaluationBarState = "ready" | "pending" | "unavailable";

export type TrainerEvaluationBarDisplay = {
  state: TrainerEvaluationBarState;
  label: string;
  whitePercent?: number;
  blackPercent?: number;
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

function normalizeFen(value: string | null | undefined): string {
  return String(value ?? "").trim();
}

export function resolveTrainerEvaluationBarDisplay(input: {
  enabled: boolean;
  currentFen: string;
  evaluationFen: string | null | undefined;
  evaluation: TrainerEvaluationDisplay | null;
  state: TrainerEvaluationBarState;
}): TrainerEvaluationBarDisplay | null {
  if (!input.enabled) return null;

  const currentFen = normalizeFen(input.currentFen);
  const evaluationFen = normalizeFen(input.evaluationFen);
  if (
    input.evaluation &&
    input.state === "ready" &&
    currentFen.length > 0 &&
    currentFen === evaluationFen
  ) {
    return {
      state: "ready",
      label: input.evaluation.label,
      whitePercent: input.evaluation.whitePercent,
      blackPercent: input.evaluation.blackPercent,
    };
  }

  if (input.state === "unavailable") {
    return {
      state: "unavailable",
      label: "Unavailable",
    };
  }

  return {
    state: "pending",
    label: "Analyzing",
  };
}
