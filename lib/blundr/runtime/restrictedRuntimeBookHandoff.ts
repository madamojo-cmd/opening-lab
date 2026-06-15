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

  const eligibleForBranchComplete = Boolean(
    exhaustedOnOpponentTurnAfterUserMove &&
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
