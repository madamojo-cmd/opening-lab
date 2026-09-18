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

export function resolveTrainerEvaluationBarDisplay(input: {
  enabled: boolean;
  confirmedEvaluation: TrainerEvaluationDisplay | null;
  state: TrainerEvaluationBarState;
}): TrainerEvaluationBarDisplay | null {
  if (!input.enabled) return null;

  const confirmed = input.confirmedEvaluation;
  if (input.state === "ready" && confirmed) {
    return {
      state: "ready",
      label: confirmed.label,
      whitePercent: confirmed.whitePercent,
      blackPercent: confirmed.blackPercent,
    };
  }

  if (input.state === "pending") {
    if (confirmed) {
      return {
        state: "pending",
        label: "Updating",
        whitePercent: confirmed.whitePercent,
        blackPercent: confirmed.blackPercent,
      };
    }
    return {
      state: "pending",
      label: "—",
    };
  }

  if (input.state === "unavailable") {
    if (confirmed) {
      return {
        state: "unavailable",
        label: "Unavailable",
        whitePercent: confirmed.whitePercent,
        blackPercent: confirmed.blackPercent,
      };
    }
    return {
      state: "unavailable",
      label: "Unavailable",
    };
  }

  return {
    state: "pending",
    label: confirmed ? "Updating" : "—",
    ...(confirmed
      ? {
          whitePercent: confirmed.whitePercent,
          blackPercent: confirmed.blackPercent,
        }
      : {}),
  };
}
