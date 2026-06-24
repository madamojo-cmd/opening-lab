export type RestrictedOpponentReplyAuthorityKind = "runtime_reply" | "terminal" | "blocked";

export type RestrictedOpponentReplyAuthorityResolution = {
  kind: RestrictedOpponentReplyAuthorityKind;
  reason: string;
  blockedReason: string | null;
  legalMoveCount: number;
  currentOpponentBookOptionCount: number;
};

export function resolveRestrictedOpponentReplyAuthority(input: {
  currentOpponentBookOptionCount: number;
  legalMoveCount: number;
}): RestrictedOpponentReplyAuthorityResolution {
  if (input.legalMoveCount <= 0) {
    return {
      kind: "terminal",
      reason: "terminal_position",
      blockedReason: null,
      legalMoveCount: input.legalMoveCount,
      currentOpponentBookOptionCount: input.currentOpponentBookOptionCount,
    };
  }

  if (input.currentOpponentBookOptionCount <= 0) {
    return {
      kind: "blocked",
      reason: "no_runtime_backed_opponent_reply_available",
      blockedReason: "missing_runtime_backed_opponent_reply",
      legalMoveCount: input.legalMoveCount,
      currentOpponentBookOptionCount: input.currentOpponentBookOptionCount,
    };
  }

  return {
    kind: "runtime_reply",
    reason: "runtime_backed_opponent_reply_available",
    blockedReason: null,
    legalMoveCount: input.legalMoveCount,
    currentOpponentBookOptionCount: input.currentOpponentBookOptionCount,
  };
}
