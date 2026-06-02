import { Chess } from "chess.js";

export type ContinuedCandidate = {
  uci: string;
  san?: string;
  source: "book" | "repertoire" | "lichess" | "engine" | "fallback";
  weight?: number;
  pct?: number;
  games?: number;
  playRate?: number;
  engineSafe?: boolean;
  supported?: boolean;
  stockfishLegal?: boolean;
  stockfishInTop10?: boolean;
  stockfishRank?: number;
};

export type ContinuedPlayPolicyDecision = {
  selectedUci: string;
  selectedSan?: string;
  source:
    | "book_supported"
    | "repertoire_supported"
    | "lichess_engine_validated"
    | "engine_top"
    | "engine_best"
    | "human_continuation_unverified"
    | "emergency_legal_fallback"
    | "no_reliable_continuation"
    | "freeplay_continuation";
  reason: string;
  debug: {
    candidates: Array<{
      moveUci: string;
      moveSan?: string;
      source: ContinuedCandidate["source"];
      safetyStatus: "safe" | "supported" | "unverified" | "engine_top" | "fallback" | "rejected";
      selectionScore: number;
      blockedReason?: string;
      games?: number;
      playRate?: number;
      passes500?: boolean;
      passes18?: boolean;
      stockfishLegal?: boolean;
      stockfishInTop10?: boolean;
      stockfishRank?: number;
      accepted?: boolean;
      rejectionReason?: string;
    }>;
    selectedMoveInCandidateList: boolean;
    selectionConsistency: "consistent" | "inconsistent";
    continuationMoveSafetySource: "engine_or_support" | "human_unverified" | "fallback";
    selectedCandidateSource?: "book" | "repertoire" | "database" | "engine_best" | "engine_top" | "human_unverified" | "fallback" | "none";
    engineFallbackUsed?: boolean;
    engineFallbackReason?: string | null;
    databaseCandidatesRejected?: boolean;
    rejectionReasons?: string[];
  };
};

export type ContinuationPauseReason = "line_complete" | "branch_exhausted" | "move_11_hard_stop" | null;

export type ContinuationPauseDecision = {
  pauseRequired: boolean;
  pauseReason: ContinuationPauseReason;
  hardStopMoveNumber: 11;
  hardStopPlyLimit: 22;
  currentPlyCount: number;
};

const MIN_CONTINUATION_GAMES = 500;
const MIN_CONTINUATION_PLAY_RATE = 0.18;

function candidateGames(candidate: ContinuedCandidate): number {
  return Number(candidate.games ?? candidate.weight ?? 0) || 0;
}

function candidatePlayRate(candidate: ContinuedCandidate): number {
  const raw = Number(candidate.playRate ?? candidate.pct ?? 0) || 0;
  return raw > 1 ? raw / 100 : raw;
}

export function isSupportedContinuationCandidate(candidate: ContinuedCandidate): boolean {
  return candidateGames(candidate) >= MIN_CONTINUATION_GAMES && candidatePlayRate(candidate) >= MIN_CONTINUATION_PLAY_RATE;
}

function stockfishValidated(candidate: ContinuedCandidate): boolean {
  if (candidate.stockfishLegal === false) return false;
  if (candidate.stockfishInTop10 === true) return true;
  if (typeof candidate.stockfishRank === "number" && candidate.stockfishRank >= 1 && candidate.stockfishRank <= 10) return true;
  return candidate.engineSafe === true;
}

function rejectionReason(candidate: ContinuedCandidate, requireDatabaseAndEngine: boolean): string | undefined {
  const passes500 = candidateGames(candidate) >= MIN_CONTINUATION_GAMES;
  const passes18 = candidatePlayRate(candidate) >= MIN_CONTINUATION_PLAY_RATE;
  const inTop10 = stockfishValidated(candidate);
  if (!passes500) return "below_500_games";
  if (!passes18) return "below_18_percent";
  if (requireDatabaseAndEngine && !inTop10) return "not_stockfish_top10";
  if (!candidate.engineSafe && !candidate.supported && !inTop10) return "missing_engine_or_support";
  return undefined;
}

function deterministicPick(candidates: ContinuedCandidate[], preferStockfishRank = false): ContinuedCandidate | null {
  if (!candidates.length) return null;
  const sorted = candidates
    .slice()
    .sort((a, b) => {
      if (preferStockfishRank) {
        const ar = typeof a.stockfishRank === "number" ? a.stockfishRank : 999;
        const br = typeof b.stockfishRank === "number" ? b.stockfishRank : 999;
        if (ar !== br) return ar - br;
      }
      const ap = candidatePlayRate(a);
      const bp = candidatePlayRate(b);
      if (bp !== ap) return bp - ap;
      const aw = candidateGames(a);
      const bw = candidateGames(b);
      if (bw !== aw) return bw - aw;
      return a.uci.localeCompare(b.uci);
    });
  return sorted[0] ?? null;
}

function isImmediateReverse(prevUci: string | null | undefined, candidateUci: string): boolean {
  // v2.7.40 guard: detect simple back-and-forth (Ra1<->Ra2 etc) that creates A-B-A-B loop in emergency
  if (!prevUci || prevUci.length < 4 || candidateUci.length < 4) return false;
  const pFrom = prevUci.slice(0, 2), pTo = prevUci.slice(2, 4);
  const cFrom = candidateUci.slice(0, 2), cTo = candidateUci.slice(2, 4);
  return cFrom === pTo && cTo === pFrom;
}

function emergencyFallbackMove(fen: string, lastMoveUci?: string | null): { uci: string; san: string } | null {
  try {
    const chess = new Chess(fen);
    const legal = chess.moves({ verbose: true }) as any[];
    if (!legal.length) return null;

    const scored = legal.map((mv) => {
      let score = 0;
      if (mv.flags?.includes("k") || mv.flags?.includes("q")) score += 50;
      if (mv.captured) score += 25;
      if ((mv.piece === "n" || mv.piece === "b") && ["b1", "g1", "c1", "f1", "b8", "g8", "c8", "f8"].includes(mv.from)) score += 20;
      if ((mv.to === "d4" || mv.to === "e4" || mv.to === "d5" || mv.to === "e5") && mv.piece !== "k") score += 10;
      if (mv.piece === "k" && !mv.flags?.includes("k") && !mv.flags?.includes("q")) score -= 20;
      return { mv, score };
    });

    scored.sort((a, b) => b.score - a.score || a.mv.from.localeCompare(b.mv.from) || a.mv.to.localeCompare(b.mv.to));
    let top = scored[0]?.mv;
    if (top && lastMoveUci) {
      const topUci = `${top.from}${top.to}${top.promotion ?? ""}`;
      if (isImmediateReverse(lastMoveUci, topUci) && scored.length > 1) {
        // Prefer non-reverse to break Ra1/Ra2 etc ping-pong; only if another exists
        top = scored[1].mv;
      }
    }
    if (!top) return null;
    return { uci: `${top.from}${top.to}${top.promotion ?? ""}`, san: top.san };
  } catch {
    return null;
  }
}

function buildDebugCandidate(candidate: ContinuedCandidate, requireDatabaseAndEngine: boolean, acceptedOverride?: boolean): ContinuedPlayPolicyDecision["debug"]["candidates"][number] {
  const games = candidateGames(candidate);
  const playRate = candidatePlayRate(candidate);
  const passes500 = games >= MIN_CONTINUATION_GAMES;
  const passes18 = playRate >= MIN_CONTINUATION_PLAY_RATE;
  const inTop10 = stockfishValidated(candidate);
  const rejected = rejectionReason(candidate, requireDatabaseAndEngine);
  const accepted = acceptedOverride ?? !rejected;
  const rankScore = typeof candidate.stockfishRank === "number" ? 1000 - candidate.stockfishRank : 0;
  return {
    moveUci: candidate.uci,
    moveSan: candidate.san,
    source: candidate.source,
    safetyStatus: accepted ? (inTop10 ? "safe" : candidate.supported ? "supported" : candidate.engineSafe ? "engine_top" : "unverified") : "rejected",
    selectionScore: rankScore + games + Math.round(playRate * 1000),
    blockedReason: rejected,
    games,
    playRate,
    passes500,
    passes18,
    stockfishLegal: candidate.stockfishLegal !== false,
    stockfishInTop10: inTop10,
    stockfishRank: candidate.stockfishRank,
    accepted,
    rejectionReason: rejected,
  };
}

export function selectContinuedPlayMove(input: {
  fen: string;
  bookCandidates?: ContinuedCandidate[];
  repertoireCandidates?: ContinuedCandidate[];
  lichessCandidates?: ContinuedCandidate[];
  engineTop?: ContinuedCandidate | null;
  engineTopMoves?: ContinuedCandidate[];
  lastMoveUci?: string | null; // v2.7.40 P1: for emergency reverse-shuffle guard (prevent Ra1<->Ra2 A-B-A-B)
  requireReliableDatabaseMove?: boolean;
}): ContinuedPlayPolicyDecision | null {
  const requireReliableDatabaseMove = input.requireReliableDatabaseMove === true;
  const book = (input.bookCandidates ?? []).filter((c) => c.uci && c.supported !== false);
  const rep = (input.repertoireCandidates ?? []).filter((c) => c.uci && c.supported !== false);
  const lichess = (input.lichessCandidates ?? []).filter((c) => c.uci);
  const engineMoves = (input.engineTopMoves ?? (input.engineTop ? [input.engineTop] : [])).filter((c) => c.uci);

  const debugCandidates: ContinuedPlayPolicyDecision["debug"]["candidates"] = [
    ...book.map((c) => buildDebugCandidate(c, false, true)),
    ...rep.map((c) => buildDebugCandidate(c, false, true)),
    ...lichess.map((c) => buildDebugCandidate(c, requireReliableDatabaseMove)),
    ...engineMoves.map((c, idx) => buildDebugCandidate({ ...c, source: "engine", stockfishRank: c.stockfishRank ?? idx + 1, stockfishInTop10: true, engineSafe: true, supported: true }, false, true)),
  ];

  const finalize = (
    selectedUci: string,
    selectedSan: string | undefined,
    source: ContinuedPlayPolicyDecision["source"],
    reason: string,
    safetySource: ContinuedPlayPolicyDecision["debug"]["continuationMoveSafetySource"],
    extraDebug?: Partial<ContinuedPlayPolicyDecision["debug"]>,
  ): ContinuedPlayPolicyDecision => {
    const selectedMoveInCandidateList = selectedUci ? debugCandidates.some((c) => c.moveUci === selectedUci) : false;
    const selectionConsistency = selectedMoveInCandidateList ? "consistent" : "inconsistent";
    const rejectedDatabase = debugCandidates.filter((candidate) => candidate.source === "lichess" && !candidate.accepted);
    const rejectionReasons = Array.from(new Set(rejectedDatabase.map((candidate) => candidate.rejectionReason).filter(Boolean) as string[]));
    const selectedCandidateSource: NonNullable<ContinuedPlayPolicyDecision["debug"]["selectedCandidateSource"]> =
      source === "book_supported"
        ? "book"
        : source === "repertoire_supported"
          ? "repertoire"
          : source === "lichess_engine_validated"
            ? "database"
            : source === "engine_best"
              ? "engine_best"
              : source === "engine_top"
                ? "engine_top"
                : source === "human_continuation_unverified"
                  ? "human_unverified"
                  : source === "no_reliable_continuation" || source === "freeplay_continuation"
                    ? "none"
                    : "fallback";
    return {
      selectedUci,
      selectedSan,
      source,
      reason,
      debug: {
        candidates: selectedUci && !selectedMoveInCandidateList
          ? [...debugCandidates, { moveUci: selectedUci, moveSan: selectedSan, source: "fallback", safetyStatus: "fallback", selectionScore: -1, blockedReason: "selected_not_in_candidate_set", accepted: false, rejectionReason: "selected_not_in_candidate_set" }]
          : debugCandidates,
        selectedMoveInCandidateList,
        selectionConsistency,
        continuationMoveSafetySource: safetySource,
        selectedCandidateSource,
        engineFallbackUsed: source === "engine_best",
        engineFallbackReason: source === "engine_best" ? "no_database_candidate_passed_reliability_gate" : null,
        databaseCandidatesRejected: rejectedDatabase.length > 0,
        rejectionReasons,
        ...extraDebug,
      },
    };
  };

  const topBook = deterministicPick(book);
  if (topBook) {
    return finalize(topBook.uci, topBook.san, "book_supported", "book_or_line_support", "engine_or_support");
  }

  const topRep = deterministicPick(rep);
  if (topRep) {
    return finalize(topRep.uci, topRep.san, "repertoire_supported", "repertoire_support", "engine_or_support");
  }

  if (requireReliableDatabaseMove) {
    const reliable = lichess.filter((candidate) => isSupportedContinuationCandidate(candidate) && stockfishValidated(candidate));
    const selected = deterministicPick(reliable, true);
    if (selected) {
      return finalize(selected.uci, selected.san, "lichess_engine_validated", "database_500_18_stockfish_top10", "engine_or_support");
    }
    const engineBest = deterministicPick(engineMoves, true) ?? input.engineTop ?? null;
    if (engineBest?.uci) {
      return finalize(
        engineBest.uci,
        engineBest.san,
        "engine_best",
        "no_database_candidate_passed_reliability_gate",
        "engine_or_support",
        {
          engineFallbackUsed: true,
          engineFallbackReason: "no_database_candidate_passed_reliability_gate",
        },
      );
    }
    return finalize("", undefined, "freeplay_continuation", "engine_unavailable_enter_freeplay", "fallback", {
      engineFallbackUsed: false,
      engineFallbackReason: "engine_unavailable_or_no_legal_engine_move",
    });
  }

  const validatedLichess = lichess.filter((c) => c.engineSafe || c.supported);
  const topValidated = deterministicPick(validatedLichess);
  if (topValidated) {
    return finalize(topValidated.uci, topValidated.san, "lichess_engine_validated", "human_continuation_with_safety", "engine_or_support");
  }

  if (input.engineTop?.uci) {
    return finalize(input.engineTop.uci, input.engineTop.san, "engine_top", "engine_top_available", "engine_or_support");
  }

  const unvalidated = deterministicPick(lichess);
  if (unvalidated) {
    return finalize(unvalidated.uci, unvalidated.san, "human_continuation_unverified", "no_engine_or_supported_alternative", "human_unverified");
  }

  const emergency = emergencyFallbackMove(input.fen, input.lastMoveUci);
  if (!emergency) return null;
  // Post-guard: if even after avoid, it still reverses (only legal was reverse), prefer to return null so caller can terminal cleanly
  if (input.lastMoveUci && isImmediateReverse(input.lastMoveUci, emergency.uci)) {
    // No safe non-reverse emergency; let caller stop continuation instead of looping
    return null;
  }
  return finalize(emergency.uci, emergency.san, "emergency_legal_fallback", "no_supported_moves_available", "fallback");
}

/**
 * Centralized hard-stop helper for mandatory continuation pause.
 * Returns true (force pause) on line/branch exhaust OR when plyCount >= hardStopPlyLimit (22 = move 11 complete).
 * Used to gate continuation candidate evaluation and target setting before explicit "Continue from here" click.
 */
export function shouldForceContinuationPause(input: {
  plyCount: number;
  lineExhausted?: boolean;
  branchExhausted?: boolean;
  continuationPauseClicked?: boolean;
}): ContinuationPauseDecision {
  const hardStopMoveNumber = 11 as const;
  const hardStopPlyLimit = 22 as const;
  const currentPlyCount = Math.max(0, Number(input.plyCount) || 0);
  const lineExhausted = Boolean(input.lineExhausted);
  const branchExhausted = Boolean(input.branchExhausted);
  const continuationPauseClicked = Boolean(input.continuationPauseClicked);
  const hardStopReached = currentPlyCount >= hardStopPlyLimit;
  const pauseReason: ContinuationPauseReason = lineExhausted
    ? "line_complete"
    : branchExhausted
      ? "branch_exhausted"
      : hardStopReached
        ? "move_11_hard_stop"
        : null;
  const pauseRequired = pauseReason !== null && !continuationPauseClicked;
  return {
    pauseRequired,
    pauseReason,
    hardStopMoveNumber,
    hardStopPlyLimit,
    currentPlyCount,
  };
}
