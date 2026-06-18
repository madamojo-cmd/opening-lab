export interface ResolveSelectedLineExhaustionInput {
  trainingMode: "restricted" | "continuation";
  selectedLineId: string | null;
  fen4: string;
  lastUserMoveUci: string | null;
  lastUserMoveSan: string | null;
  userExplicitlyEnteredContinuation: boolean;
  afterFinalUserMove: boolean;
  explicitCuratedTerminalNode: boolean;
  exactNodeHasChildren: boolean | "unknown";
  hasNextOpponentMove: boolean | "unknown";
  hasNextUserMove: boolean | "unknown";
  validBranchCompleteLatch: boolean;
}

export interface SelectedLineExhaustionResolution {
  exhausted: boolean;
  reason: string | null;
  blockedReason: string | null;
  hasNextOpponentMove: boolean | "unknown";
  hasNextUserMove: boolean | "unknown";
  exactNodeHasChildren: boolean | "unknown";
  knownFinalFenMatched: boolean;
  knownFinalMoveMatched: boolean;
}

const SELECTED_LINE_TERMINAL_GUARDS: Record<string, { finalFen4: string; finalUserMoveUci: string; finalUserMoveSan: string }> = {
  "italian-white": {
    finalFen4: "r1bq1rk1/bpp2ppp/p1np1n2/4p3/4P3/1BPP1N2/PP1N1PPP/R1BQR1K1 b - -",
    finalUserMoveUci: "b1d2",
    finalUserMoveSan: "Nbd2",
  },
};

function normalize(value: string | null | undefined): string {
  return String(value ?? "").trim().toLowerCase();
}

export function resolveSelectedLineExhaustion(input: ResolveSelectedLineExhaustionInput): SelectedLineExhaustionResolution {
  const guard = input.selectedLineId ? SELECTED_LINE_TERMINAL_GUARDS[input.selectedLineId] : undefined;
  const knownFinalFenMatched = Boolean(guard && normalize(input.fen4) === normalize(guard.finalFen4));
  const knownFinalMoveMatched = Boolean(
    guard &&
      (
        normalize(input.lastUserMoveUci) === normalize(guard.finalUserMoveUci) ||
        normalize(input.lastUserMoveSan) === normalize(guard.finalUserMoveSan)
      ),
  );

  if (input.trainingMode !== "restricted") {
    return {
      exhausted: false,
      reason: null,
      blockedReason: "not_restricted_mode",
      hasNextOpponentMove: input.hasNextOpponentMove,
      hasNextUserMove: input.hasNextUserMove,
      exactNodeHasChildren: input.exactNodeHasChildren,
      knownFinalFenMatched,
      knownFinalMoveMatched,
    };
  }
  if (input.userExplicitlyEnteredContinuation) {
    return {
      exhausted: false,
      reason: null,
      blockedReason: "already_in_continuation",
      hasNextOpponentMove: input.hasNextOpponentMove,
      hasNextUserMove: input.hasNextUserMove,
      exactNodeHasChildren: input.exactNodeHasChildren,
      knownFinalFenMatched,
      knownFinalMoveMatched,
    };
  }
  if (input.explicitCuratedTerminalNode) {
    return {
      exhausted: true,
      reason: "explicit_curated_terminal_node",
      blockedReason: null,
      hasNextOpponentMove: input.hasNextOpponentMove,
      hasNextUserMove: input.hasNextUserMove,
      exactNodeHasChildren: input.exactNodeHasChildren,
      knownFinalFenMatched,
      knownFinalMoveMatched,
    };
  }
  if (knownFinalFenMatched && knownFinalMoveMatched) {
    return {
      exhausted: true,
      reason: "restricted_line_exhausted_after_final_known_move",
      blockedReason: null,
      hasNextOpponentMove: input.hasNextOpponentMove,
      hasNextUserMove: input.hasNextUserMove,
      exactNodeHasChildren: input.exactNodeHasChildren,
      knownFinalFenMatched,
      knownFinalMoveMatched,
    };
  }
  if (input.exactNodeHasChildren === false) {
    return {
      exhausted: true,
      reason: "selected_line_exhausted",
      blockedReason: null,
      hasNextOpponentMove: input.hasNextOpponentMove,
      hasNextUserMove: input.hasNextUserMove,
      exactNodeHasChildren: input.exactNodeHasChildren,
      knownFinalFenMatched,
      knownFinalMoveMatched,
    };
  }
  if (input.validBranchCompleteLatch && input.exactNodeHasChildren !== true && input.hasNextUserMove !== true) {
    return {
      exhausted: true,
      reason: "valid_branch_complete_latch",
      blockedReason: null,
      hasNextOpponentMove: input.hasNextOpponentMove,
      hasNextUserMove: input.hasNextUserMove,
      exactNodeHasChildren: input.exactNodeHasChildren,
      knownFinalFenMatched,
      knownFinalMoveMatched,
    };
  }
  if (input.afterFinalUserMove && input.hasNextOpponentMove === false) {
    return {
      exhausted: true,
      reason: "restricted_line_exhausted_after_final_known_move",
      blockedReason: null,
      hasNextOpponentMove: input.hasNextOpponentMove,
      hasNextUserMove: input.hasNextUserMove,
      exactNodeHasChildren: input.exactNodeHasChildren,
      knownFinalFenMatched,
      knownFinalMoveMatched,
    };
  }
  if (input.exactNodeHasChildren === true) {
    return {
      exhausted: false,
      reason: null,
      blockedReason: input.hasNextOpponentMove === true ? "opponent_reply_expected" : "exact_node_has_children",
      hasNextOpponentMove: input.hasNextOpponentMove,
      hasNextUserMove: input.hasNextUserMove,
      exactNodeHasChildren: input.exactNodeHasChildren,
      knownFinalFenMatched,
      knownFinalMoveMatched,
    };
  }
  if (input.afterFinalUserMove && input.hasNextOpponentMove === true) {
    return {
      exhausted: false,
      reason: null,
      blockedReason: "opponent_reply_expected",
      hasNextOpponentMove: input.hasNextOpponentMove,
      hasNextUserMove: input.hasNextUserMove,
      exactNodeHasChildren: input.exactNodeHasChildren,
      knownFinalFenMatched,
      knownFinalMoveMatched,
    };
  }

  return {
    exhausted: false,
    reason: null,
    blockedReason: "selected_line_not_exhausted",
    hasNextOpponentMove: input.hasNextOpponentMove,
    hasNextUserMove: input.hasNextUserMove,
    exactNodeHasChildren: input.exactNodeHasChildren,
    knownFinalFenMatched,
    knownFinalMoveMatched,
  };
}
