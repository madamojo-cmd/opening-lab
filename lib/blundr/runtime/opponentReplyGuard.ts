export type PendingOpponentRequestGuard = {
  requestId: number;
  baseFen: string;
};

export type OpponentReplyCommitGuardInput = {
  request: PendingOpponentRequestGuard;
  currentPendingRequest: PendingOpponentRequestGuard | null;
  liveFen: string;
};

export type OpponentReplyRequestAuthority = {
  continuationAuthorized: boolean;
  branchCompleteActive: boolean;
  hasUserContinuationMove: boolean;
};

export function normalizeFen4(fen: string): string {
  return String(fen).trim().split(/\s+/).slice(0, 4).join(" ");
}

export function shouldFlagStaleOpponentReplyCommit(
  input: OpponentReplyCommitGuardInput,
): boolean {
  const liveFen4 = normalizeFen4(input.liveFen);
  const current = input.currentPendingRequest;
  if (!current) {
    return liveFen4 !== input.request.baseFen;
  }
  if (current.requestId !== input.request.requestId) {
    return (
      current.requestId > input.request.requestId ||
      current.baseFen !== input.request.baseFen
    );
  }
  return liveFen4 !== input.request.baseFen;
}

export function captureOpponentReplyRequestAuthority(input: {
  mode: "restricted" | "continuation";
  userExplicitlyEnteredContinuation: boolean;
  branchCompleteActive: boolean;
  hasUserContinuationMove: boolean;
}): OpponentReplyRequestAuthority {
  if (input.mode === "continuation") {
    return {
      continuationAuthorized: input.userExplicitlyEnteredContinuation,
      branchCompleteActive: false,
      hasUserContinuationMove: input.hasUserContinuationMove,
    };
  }
  return {
    continuationAuthorized: false,
    branchCompleteActive: input.branchCompleteActive,
    hasUserContinuationMove: false,
  };
}

export function shouldBlockRestrictedOpponentReplySchedule(input: {
  mode: "restricted" | "continuation";
  branchCompleteActive: boolean;
  terminalProofProven: boolean;
  initialRestrictedOpponentHandoff: boolean;
}): boolean {
  return Boolean(
    input.mode === "restricted" &&
      (input.branchCompleteActive || input.terminalProofProven) &&
      !input.initialRestrictedOpponentHandoff,
  );
}
