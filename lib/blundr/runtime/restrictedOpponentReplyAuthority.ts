import type { Stage2RuntimeBookCandidate } from "../runtimeBook/runtimeBookTypes";
import { normalizeRuntimeCastlingUci } from "./uciNormalization";

export type RestrictedOpponentReplyAuthorityKind = "runtime_reply" | "terminal" | "blocked";

export type RestrictedOpponentReplyAuthoritySource =
  | "opening_branch"
  | "runtime_book_exact"
  | "runtime_book_transposition"
  | "runtime_book_opening_family"
  | "blocked";

export type RestrictedOpponentReplyAuthorityCandidate = Pick<
  Stage2RuntimeBookCandidate,
  "uci" | "san" | "totalGames" | "playPct"
> & {
  rank?: number | null;
  sourceDetail?: string | null;
  sources?: string | null;
};

export type RestrictedOpponentReplyAuthorityResolution = {
  kind: RestrictedOpponentReplyAuthorityKind;
  reason: string;
  blockedReason: string | null;
  legalMoveCount: number;
  currentOpponentBookOptionCount: number;
  runtimeBookCandidateCount: number;
  runtimeBookMatchesFrame: boolean;
  opponentReplyAuthoritySource: RestrictedOpponentReplyAuthoritySource;
  opponentReplyAuthorityCandidateUci: string | null;
  opponentReplyAuthorityCandidateSan: string | null;
  opponentReplyAuthorityCandidateGames: number | null;
  opponentReplyAuthorityCandidatePlayPct: number | null;
  opponentReplyAuthorityRejectedReason: string | null;
};

export function resolveRestrictedOpponentReplyAuthority(input: {
  trainingMode: "restricted" | "continuation";
  currentOpponentBookOptionCount: number;
  legalMoveCount: number;
  legalMoveUcis?: string[] | null;
  runtimeBookMatchesFrame?: boolean;
  runtimeBookStatus?: string | null | undefined;
  runtimeBookBookExhausted?: boolean;
  runtimeBookCandidateCount?: number;
  runtimeBookOpeningId?: string | null | undefined;
  runtimeBookPlayKeyBefore?: string | null | undefined;
  currentOpeningId?: string | null | undefined;
  currentPlayKeyBefore?: string | null | undefined;
  runtimeBookCandidates?: RestrictedOpponentReplyAuthorityCandidate[] | null;
  runtimeBookTopCandidate?: RestrictedOpponentReplyAuthorityCandidate | null;
}): RestrictedOpponentReplyAuthorityResolution {
  const legalMoveUcis = new Set(
    (input.legalMoveUcis ?? [])
      .map((uci) => normalizeRuntimeCastlingUci(uci))
      .filter((uci): uci is string => Boolean(uci)),
  );
  const runtimeBookCandidates = Array.isArray(input.runtimeBookCandidates) ? input.runtimeBookCandidates : [];
  const runtimeBookTopCandidate = input.runtimeBookTopCandidate ?? runtimeBookCandidates[0] ?? null;
  const runtimeBookStatus = String(input.runtimeBookStatus ?? "").trim().toLowerCase();
  const runtimeBookMatchesFrame = Boolean(input.runtimeBookMatchesFrame);
  const runtimeBookCandidateCount = Number(input.runtimeBookCandidateCount ?? runtimeBookCandidates.length ?? 0);
  const runtimeBookOpeningId = String(input.runtimeBookOpeningId ?? "").trim().toLowerCase();
  const runtimeBookPlayKeyBefore = String(input.runtimeBookPlayKeyBefore ?? "").trim().toLowerCase();
  const currentOpeningId = String(input.currentOpeningId ?? "").trim().toLowerCase();
  const currentPlayKeyBefore = String(input.currentPlayKeyBefore ?? "").trim().toLowerCase();
  const selectedRuntimeBookCandidate =
    runtimeBookCandidates.find((candidate) => legalMoveUcis.has(normalizeRuntimeCastlingUci(candidate.uci) ?? ""))
    ?? (runtimeBookTopCandidate && legalMoveUcis.has(normalizeRuntimeCastlingUci(runtimeBookTopCandidate.uci) ?? "") ? runtimeBookTopCandidate : null);
  const runtimeBookSource: RestrictedOpponentReplyAuthoritySource =
    runtimeBookStatus === "ready" && runtimeBookCandidateCount > 0
      ? runtimeBookOpeningId && currentOpeningId && runtimeBookOpeningId === currentOpeningId && runtimeBookPlayKeyBefore && currentPlayKeyBefore && runtimeBookPlayKeyBefore === currentPlayKeyBefore
        ? "runtime_book_exact"
        : runtimeBookOpeningId && currentOpeningId && runtimeBookOpeningId === currentOpeningId
          ? "runtime_book_transposition"
          : "runtime_book_opening_family"
      : "blocked";
  const runtimeBookCandidateIsLegal = Boolean(selectedRuntimeBookCandidate);
  const selectedCandidate = runtimeBookCandidateIsLegal ? selectedRuntimeBookCandidate : null;

  if (input.legalMoveCount <= 0) {
    return {
      kind: "terminal",
      reason: "terminal_position",
      blockedReason: null,
      legalMoveCount: input.legalMoveCount,
      currentOpponentBookOptionCount: input.currentOpponentBookOptionCount,
      runtimeBookCandidateCount,
      runtimeBookMatchesFrame,
      opponentReplyAuthoritySource: "blocked",
      opponentReplyAuthorityCandidateUci: null,
      opponentReplyAuthorityCandidateSan: null,
      opponentReplyAuthorityCandidateGames: null,
      opponentReplyAuthorityCandidatePlayPct: null,
      opponentReplyAuthorityRejectedReason: null,
    };
  }

  if (input.trainingMode !== "restricted") {
    return {
      kind: "blocked",
      reason: "restricted_mode_required",
      blockedReason: "restricted_mode_required",
      legalMoveCount: input.legalMoveCount,
      currentOpponentBookOptionCount: input.currentOpponentBookOptionCount,
      runtimeBookCandidateCount,
      runtimeBookMatchesFrame,
      opponentReplyAuthoritySource: "blocked",
      opponentReplyAuthorityCandidateUci: normalizeRuntimeCastlingUci(runtimeBookTopCandidate?.uci) ?? null,
      opponentReplyAuthorityCandidateSan: runtimeBookTopCandidate?.san ?? null,
      opponentReplyAuthorityCandidateGames: runtimeBookTopCandidate?.totalGames ?? null,
      opponentReplyAuthorityCandidatePlayPct: runtimeBookTopCandidate?.playPct ?? null,
      opponentReplyAuthorityRejectedReason: "restricted_mode_required",
    };
  }

  if (input.currentOpponentBookOptionCount <= 0 && !selectedCandidate) {
    const rejectedReason =
      runtimeBookStatus !== "ready"
        ? "runtime_book_not_ready"
        : runtimeBookCandidateCount <= 0
            ? "missing_runtime_backed_opponent_reply"
            : runtimeBookCandidates.length > 0 && !runtimeBookCandidateIsLegal
              ? "runtime_book_candidate_illegal"
              : "missing_runtime_backed_opponent_reply";
    return {
      kind: "blocked",
      reason: "no_runtime_backed_opponent_reply_available",
      blockedReason: rejectedReason,
      legalMoveCount: input.legalMoveCount,
      currentOpponentBookOptionCount: input.currentOpponentBookOptionCount,
      runtimeBookCandidateCount,
      runtimeBookMatchesFrame,
      opponentReplyAuthoritySource: "blocked",
      opponentReplyAuthorityCandidateUci: normalizeRuntimeCastlingUci(runtimeBookTopCandidate?.uci) ?? null,
      opponentReplyAuthorityCandidateSan: runtimeBookTopCandidate?.san ?? null,
      opponentReplyAuthorityCandidateGames: runtimeBookTopCandidate?.totalGames ?? null,
      opponentReplyAuthorityCandidatePlayPct: runtimeBookTopCandidate?.playPct ?? null,
      opponentReplyAuthorityRejectedReason: rejectedReason,
    };
  }

  return {
    kind: "runtime_reply",
    reason: runtimeBookSource === "runtime_book_exact"
      ? "runtime_backed_opponent_reply_available"
      : runtimeBookSource === "runtime_book_transposition"
        ? "runtime_backed_opponent_reply_transposition"
        : "runtime_backed_opponent_reply_opening_family",
    blockedReason: null,
    legalMoveCount: input.legalMoveCount,
    currentOpponentBookOptionCount: input.currentOpponentBookOptionCount,
    runtimeBookCandidateCount,
    runtimeBookMatchesFrame,
    opponentReplyAuthoritySource: runtimeBookSource,
    opponentReplyAuthorityCandidateUci: normalizeRuntimeCastlingUci(selectedCandidate?.uci) ?? normalizeRuntimeCastlingUci(runtimeBookTopCandidate?.uci) ?? null,
    opponentReplyAuthorityCandidateSan: selectedCandidate?.san ?? runtimeBookTopCandidate?.san ?? null,
    opponentReplyAuthorityCandidateGames: selectedCandidate?.totalGames ?? runtimeBookTopCandidate?.totalGames ?? null,
    opponentReplyAuthorityCandidatePlayPct: selectedCandidate?.playPct ?? runtimeBookTopCandidate?.playPct ?? null,
    opponentReplyAuthorityRejectedReason: null,
  };
}
