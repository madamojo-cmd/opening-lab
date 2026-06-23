export interface RestrictedRuntimeBookHandoffInput {
  trainingMode: "restricted" | "continuation";
  isUserTurn: boolean;
  userExplicitlyEnteredContinuation: boolean;
  lastUserMoveUci: string | null | undefined;
  currentPly: number;
  minimumGuidedDepthPly: number;
  runtimeBookMatchesFrame: boolean;
  runtimeBookStatus: string | null | undefined;
  runtimeBookBookExhausted: boolean;
  runtimeBookCandidateCount: number;
  explicitCuratedTerminalNode: boolean;
  selectedLineCompleteConfirmed: boolean;
}

export interface RestrictedRuntimeBookHandoffResult {
  restrictedRuntimeBookExhaustedOnOpponentTurnAfterUserMove: boolean;
  restrictedRuntimeBookExhaustedEligibleForBranchComplete: boolean;
}

function normalize(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

export function resolveRestrictedRuntimeBookHandoff(
  input: RestrictedRuntimeBookHandoffInput,
): RestrictedRuntimeBookHandoffResult {
  const exhaustedOnOpponentTurnAfterUserMove = Boolean(
    input.trainingMode === "restricted" &&
    !input.isUserTurn &&
    !input.userExplicitlyEnteredContinuation &&
    Boolean(input.lastUserMoveUci) &&
    input.runtimeBookMatchesFrame &&
    input.runtimeBookStatus === "ready" &&
    input.runtimeBookBookExhausted &&
    input.runtimeBookCandidateCount === 0,
  );

  const moveAuthorityKind =
    input.trainingMode !== "restricted"
      ? "safe_local_fallback"
      : input.explicitCuratedTerminalNode || input.selectedLineCompleteConfirmed
        ? "terminal"
        : normalize(input.runtimeBookStatus) === "ready" && input.runtimeBookMatchesFrame && input.runtimeBookCandidateCount > 0
          ? "runtime_exact"
          : input.runtimeBookMatchesFrame && input.runtimeBookBookExhausted
            ? "selected_line"
            : "safe_local_fallback";

  const eligibleForBranchComplete = Boolean(
    moveAuthorityKind === "terminal" &&
      (
        input.explicitCuratedTerminalNode ||
        input.selectedLineCompleteConfirmed ||
        input.currentPly >= input.minimumGuidedDepthPly
      ),
  );

  return {
    restrictedRuntimeBookExhaustedOnOpponentTurnAfterUserMove: exhaustedOnOpponentTurnAfterUserMove,
    restrictedRuntimeBookExhaustedEligibleForBranchComplete: eligibleForBranchComplete,
  };
}
