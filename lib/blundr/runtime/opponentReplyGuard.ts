export type PendingOpponentRequestGuard = {
  requestId: number;
  baseFen: string;
};

export type OpponentReplyCommitGuardInput = {
  request: PendingOpponentRequestGuard;
  currentPendingRequest: PendingOpponentRequestGuard | null;
  liveFen: string;
};

export function normalizeFen4(fen: string): string {
  return String(fen).trim().split(/\s+/).slice(0, 4).join(" ");
}

export function shouldFlagStaleOpponentReplyCommit(input: OpponentReplyCommitGuardInput): boolean {
  const liveFen4 = normalizeFen4(input.liveFen);
  const current = input.currentPendingRequest;
  if (!current) {
    return liveFen4 !== input.request.baseFen;
  }
  if (current.requestId !== input.request.requestId) {
    return current.requestId > input.request.requestId || current.baseFen !== input.request.baseFen;
  }
  return liveFen4 !== input.request.baseFen;
}
