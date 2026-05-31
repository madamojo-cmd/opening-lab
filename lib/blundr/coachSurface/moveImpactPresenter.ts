export type MoveImpactLabel =
  | "Useful"
  | "Safe"
  | "Study-line move"
  | "Plan move"
  | "Needs checking"
  | "Review-worthy"
  | "Not enough evidence"
  | "Checking";

export interface MoveImpactPresenterInput {
  exactMoveAllowed: boolean;
  engineStatus?: "ready" | "pending" | "unavailable" | "idle";
  isSafeMove?: boolean;
  isPlayableMove?: boolean;
  isStudyLineMove?: boolean;
  reviewWorthy?: boolean;
}

export interface MoveImpactPresenterResult {
  show: boolean;
  label: MoveImpactLabel;
  note: string;
  reason: string;
}

export function presentMoveImpact(input: MoveImpactPresenterInput): MoveImpactPresenterResult {
  if (input.reviewWorthy) {
    return { show: true, label: "Review-worthy", note: "This position is worth revisiting.", reason: "review_worthy" };
  }

  if (input.engineStatus === "pending") {
    return { show: true, label: "Checking", note: "Checking the position before recommending a move.", reason: "engine_pending" };
  }

  if (input.isStudyLineMove) {
    return {
      show: true,
      label: "Study-line move",
      note: input.exactMoveAllowed ? "This move follows your study line." : "Study-line context found, but exact recommendation is locked.",
      reason: "study_line",
    };
  }

  if (input.engineStatus === "ready" && input.exactMoveAllowed && input.isSafeMove) {
    return { show: true, label: "Safe", note: "This move is safe in the current position.", reason: "engine_safe" };
  }

  if (input.engineStatus === "ready" && input.exactMoveAllowed && input.isPlayableMove) {
    return { show: true, label: "Useful", note: "This move is a useful continuation.", reason: "engine_playable" };
  }

  if (!input.exactMoveAllowed) {
    return { show: false, label: "Not enough evidence", note: "Not enough evidence to recommend an exact move.", reason: "exact_move_not_allowed" };
  }

  if (input.engineStatus === "ready") {
    return { show: true, label: "Plan move", note: "Use this as a plan move, not a forced recommendation.", reason: "plan_move" };
  }

  return { show: true, label: "Not enough evidence", note: "Not enough evidence to grade this move yet.", reason: "insufficient_evidence" };
}
