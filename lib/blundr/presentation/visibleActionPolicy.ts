/**
 * BLUNDR v2.7.40 Central Visible Coach Action Policy
 * Single source of truth for user-facing teaching actions in non-debug MVP UI.
 * 
 * Strict rules enforced here:
 * - Plain View active teaching frame: ONLY ["hint", "show_more"]
 * - Assisted teaching frames: []
 * - Branch transition: EXACTLY ["continue_from_here", "restart_line"]
 * - Terminal / opponent frames: []
 * - No forbidden labels ever emitted: "Reveal Next Move", "Reveal Move", "Show Answer", "Show Move", "Show Plan", "Analyze Idea", "Attack", "Defense", "Plan" etc.
 * - No raw UCI/SAN, "verified_top*", "Stockfish validated" in policy outputs for teaching frames.
 */

export type VisibleCoachAction =
  | "hint"
  | "show_more"
  | "continue_from_here"
  | "restart_line"
  | "review_pattern";

export interface VisibleActionInput {
  trainerView: "assisted" | "plain" | "freeplay";
  trainerPhase: string;
  isUserTurn: boolean;
  trainingMode: "restricted" | "continuation";
  bookStatus?: "in_book" | "book_complete" | "near_book" | "out_of_book";
  isBranchTransition?: boolean;
  isTerminal?: boolean;
  answerShown?: boolean;
  hasActiveTarget?: boolean; // for teaching frames with locked instruction target
  coachOwner?: string; // e.g. "branch_transition_surface" from presentation
}

export interface VisibleActionResult {
  actions: VisibleCoachAction[];
  frameKind: "assisted_teaching" | "plain_teaching" | "branch_transition" | "terminal" | "opponent" | "other";
  reason: string;
}

/**
 * Core policy: returns the EXACT allowed visible actions for the teaching frame.
 * This is the single source that CoachCard, page render, phase gating, and decision surfaces MUST consume for MVP teaching UI.
 */
export function getVisibleCoachActions(input: VisibleActionInput): VisibleActionResult {
  const {
    trainerView,
    trainerPhase,
    isUserTurn,
    trainingMode,
    bookStatus = "in_book",
    isBranchTransition = false,
    isTerminal = false,
    answerShown = false,
    hasActiveTarget = true,
    coachOwner,
  } = input;

  // Terminal / opponent / not user turn: no teaching actions
  if (
    isTerminal ||
    trainerPhase === "terminal" ||
    trainerPhase === "opponent_selecting" ||
    !isUserTurn ||
    trainerPhase === "opponent_replying"
  ) {
    return {
      actions: [],
      frameKind: "terminal",
      reason: "terminal_or_opponent_frame_no_stale_teaching_actions",
    };
  }

  // Explicit branch transition surface (from presentationFrame or book complete + user turn)
  const isBranchSurface =
    isBranchTransition ||
    coachOwner === "branch_transition_surface" ||
    bookStatus === "book_complete" ||
    (trainingMode === "continuation" && !hasActiveTarget);

  if (isBranchSurface) {
    return {
      actions: ["continue_from_here", "restart_line"],
      frameKind: "branch_transition",
      reason: "branch_transition_continue_or_restart",
    };
  }

  // Assisted View: active teaching frame shows NO buttons in CoachCard (visuals + title/body only; "why/replay/hide" are debug or removed per v2.7.40 clean rules)
  // Per strict: Plain View teaching ONLY hint/show_more; Assisted teaching frame: []
  if (trainerView === "assisted" && hasActiveTarget && trainerPhase === "ready_for_user") {
    return {
      actions: [],
      frameKind: "assisted_teaching",
      reason: "assisted_teaching_frame_empty_actions",
    };
  }

  // Plain View teaching frames (recall mode): ONLY hint + show_more pre-reveal
  if (trainerView === "plain" && hasActiveTarget && trainerPhase === "ready_for_user") {
    if (answerShown) {
      return {
        actions: [], // post-reveal or after show more may evolve; for now clean per pre-ShowMore spec
        frameKind: "plain_teaching",
        reason: "plain_post_answer_minimal",
      };
    }
    return {
      actions: ["hint", "show_more"],
      frameKind: "plain_teaching",
      reason: "plain_teaching_pre_showmore_only_hint_show_more",
    };
  }

  // Continuation out-of-book but not branch: treat as minimal or empty for teaching cleanliness (no legacy clutter)
  if (trainingMode === "continuation" && bookStatus === "out_of_book") {
    return {
      actions: ["continue_from_here", "restart_line"], // branch fallback
      frameKind: "branch_transition",
      reason: "out_of_book_continuation_fallback_to_branch",
    };
  }

  // Default safe: no actions for other teaching frames (forces policy-driven only)
  return {
    actions: [],
    frameKind: "other",
    reason: "default_no_teaching_actions_mvp_clean",
  };
}

/**
 * Human labels for the canonical VisibleCoachAction only. Used by CoachCard.
 * Never returns forbidden legacy labels.
 */
export function getVisibleActionLabel(action: VisibleCoachAction): string {
  switch (action) {
    case "hint":
      return "Hint";
    case "show_more":
      return "Show More";
    case "continue_from_here":
      return "Continue Line";
    case "restart_line":
      return "Train Again";
    case "review_pattern":
      return "Review pattern";
    default:
      // Exhaustive: never reach for allowed types
      return "Action";
  }
}

/**
 * Type guard / filter helper: returns only actions that are in the Visible set.
 * Use to quarantine legacy CoachButton arrays.
 */
export function filterToVisibleCoachActions(buttons: string[]): VisibleCoachAction[] {
  const allowed: VisibleCoachAction[] = ["hint", "show_more", "continue_from_here", "restart_line", "review_pattern"];
  return buttons.filter((b): b is VisibleCoachAction => allowed.includes(b as VisibleCoachAction));
}

/**
 * Legacy button quarantine map (for migration only; not for production render).
 * Old strings map to null (deleted) or closest visible if transitional.
 */
export const LEGACY_BUTTON_QUARANTINE: Record<string, VisibleCoachAction | null> = {
  answer: null, // removed from teaching UI; reveal is separate / debug
  "show_answer": null,
  show_move: null,
  show_plan: null,
  analyze_idea: null,
  why: null, // kept internal or debug-gated only in v2.7.40 clean
  replay: null,
  hide: null,
  try_again: null,
  // raw uci etc never here
};

export default {
  getVisibleCoachActions,
  getVisibleActionLabel,
  filterToVisibleCoachActions,
  LEGACY_BUTTON_QUARANTINE,
};
