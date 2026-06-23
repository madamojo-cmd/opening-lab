export type Stage2RestrictedMoveAuthorityKind =
  | "runtime_exact"
  | "selected_line"
  | "runtime_transposition"
  | "opening_family_fallback"
  | "safe_local_fallback"
  | "terminal";

export type Stage2RestrictedMoveAuthority = {
  targetAuthority: {
    kind: Stage2RestrictedMoveAuthorityKind;
    moveUci: string | null;
    moveSan: string | null;
    sideToMove: "white" | "black" | null;
    isTerminal: boolean;
    terminalReason: string | null;
  };
  branchCompleteAllowed: boolean;
  continueFromHereAllowed: boolean;
};

export interface ResolveStage2RestrictedMoveAuthorityInput {
  trainingMode: "restricted" | "continuation";
  isUserTurn: boolean;
  userExplicitlyEnteredContinuation: boolean;
  currentPly: number;
  minimumGuidedDepthPly: number;
  runtimeBookMatchesFrame: boolean;
  runtimeBookStatus: string | null | undefined;
  runtimeBookBookExhausted: boolean;
  runtimeBookCandidateCount: number;
  explicitCuratedTerminalNode: boolean;
  selectedLineCompleteConfirmed: boolean;
  expectedMoveSource?: string | null | undefined;
  expectedMoveReason?: string | null | undefined;
  expectedMoveUci?: string | null | undefined;
  expectedMoveSan?: string | null | undefined;
  sideToMove: "white" | "black" | null;
}

function normalize(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

function classifyMoveAuthorityKind(input: ResolveStage2RestrictedMoveAuthorityInput): Stage2RestrictedMoveAuthorityKind {
  if (input.trainingMode !== "restricted") return "safe_local_fallback";
  if (input.userExplicitlyEnteredContinuation) return "safe_local_fallback";
  if (input.explicitCuratedTerminalNode || input.selectedLineCompleteConfirmed) return "terminal";

  const source = normalize(input.expectedMoveSource);
  const reason = normalize(input.expectedMoveReason);

  if (source === "opening_branch" || source === "lesson_line" || source === "guided_branch_needs_continuation") {
    return "selected_line";
  }

  if (source === "opening_family_plan") {
    return "opening_family_fallback";
  }

  if (source === "continuation_candidate") {
    return "runtime_transposition";
  }

  if (input.runtimeBookMatchesFrame && input.runtimeBookStatus === "ready" && input.runtimeBookCandidateCount > 0) {
    return "runtime_exact";
  }

  if (source === "none" || reason === "no_trusted_instruction_target") {
    return "safe_local_fallback";
  }

  return input.runtimeBookBookExhausted ? "selected_line" : "safe_local_fallback";
}

export function resolveStage2RestrictedMoveAuthority(
  input: ResolveStage2RestrictedMoveAuthorityInput,
): Stage2RestrictedMoveAuthority {
  const kind = classifyMoveAuthorityKind(input);
  const moveUci = normalize(input.expectedMoveUci) || null;
  const moveSan = String(input.expectedMoveSan ?? "").trim() || null;
  const terminalReason = kind === "terminal"
    ? (input.explicitCuratedTerminalNode
      ? "explicit_curated_terminal_node"
      : input.selectedLineCompleteConfirmed
        ? "selected_line_complete"
        : "terminal_position")
    : null;

  return {
    targetAuthority: {
      kind,
      moveUci,
      moveSan,
      sideToMove: input.sideToMove,
      isTerminal: kind === "terminal",
      terminalReason,
    },
    branchCompleteAllowed: kind === "terminal",
    continueFromHereAllowed: kind === "terminal",
  };
}
