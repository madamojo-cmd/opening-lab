import { Chess } from "chess.js";

export type ContinuedCandidate = {
  uci: string;
  san?: string;
  source: "book" | "repertoire" | "lichess" | "engine" | "fallback";
  weight?: number;
  pct?: number;
  engineSafe?: boolean;
  supported?: boolean;
};

export type ContinuedPlayPolicyDecision = {
  selectedUci: string;
  selectedSan?: string;
  source: "book_supported" | "repertoire_supported" | "lichess_engine_validated" | "engine_top" | "human_continuation_unverified" | "emergency_legal_fallback";
  reason: string;
  debug: {
    candidates: Array<{
      moveUci: string;
      moveSan?: string;
      source: ContinuedCandidate["source"];
      safetyStatus: "safe" | "supported" | "unverified" | "engine_top" | "fallback";
      selectionScore: number;
      blockedReason?: string;
    }>;
    selectedMoveInCandidateList: boolean;
    selectionConsistency: "consistent" | "inconsistent";
    continuationMoveSafetySource: "engine_or_support" | "human_unverified" | "fallback";
  };
};

function deterministicPick(candidates: ContinuedCandidate[]): ContinuedCandidate | null {
  if (!candidates.length) return null;
  const sorted = candidates
    .slice()
    .sort((a, b) => {
      const aw = a.weight ?? 0;
      const bw = b.weight ?? 0;
      if (bw !== aw) return bw - aw;
      const ap = a.pct ?? 0;
      const bp = b.pct ?? 0;
      if (bp !== ap) return bp - ap;
      return a.uci.localeCompare(b.uci);
    });
  return sorted[0] ?? null;
}

function emergencyFallbackMove(fen: string): { uci: string; san: string } | null {
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
    const top = scored[0]?.mv;
    if (!top) return null;
    return { uci: `${top.from}${top.to}${top.promotion ?? ""}`, san: top.san };
  } catch {
    return null;
  }
}

export function selectContinuedPlayMove(input: {
  fen: string;
  bookCandidates?: ContinuedCandidate[];
  repertoireCandidates?: ContinuedCandidate[];
  lichessCandidates?: ContinuedCandidate[];
  engineTop?: ContinuedCandidate | null;
}): ContinuedPlayPolicyDecision | null {
  const book = (input.bookCandidates ?? []).filter((c) => c.uci && c.supported !== false);
  const rep = (input.repertoireCandidates ?? []).filter((c) => c.uci && c.supported !== false);
  const lichess = (input.lichessCandidates ?? []).filter((c) => c.uci);

  const debugCandidates: ContinuedPlayPolicyDecision["debug"]["candidates"] = [
    ...book.map((c) => ({ moveUci: c.uci, moveSan: c.san, source: c.source, safetyStatus: "supported" as const, selectionScore: (c.weight ?? 0) + 100 })),
    ...rep.map((c) => ({ moveUci: c.uci, moveSan: c.san, source: c.source, safetyStatus: "supported" as const, selectionScore: (c.weight ?? 0) + 80 })),
    ...lichess.map((c) => ({
      moveUci: c.uci,
      moveSan: c.san,
      source: c.source,
      safetyStatus: c.engineSafe || c.supported ? ("safe" as const) : ("unverified" as const),
      selectionScore: (c.weight ?? 0) + (c.engineSafe || c.supported ? 40 : 0),
      blockedReason: c.engineSafe || c.supported ? undefined : "missing_engine_or_support",
    })),
    ...(input.engineTop?.uci
      ? [{ moveUci: input.engineTop.uci, moveSan: input.engineTop.san, source: "engine" as const, safetyStatus: "engine_top" as const, selectionScore: 120 }]
      : []),
  ];

  const finalize = (
    selectedUci: string,
    selectedSan: string | undefined,
    source: ContinuedPlayPolicyDecision["source"],
    reason: string,
    safetySource: ContinuedPlayPolicyDecision["debug"]["continuationMoveSafetySource"],
  ): ContinuedPlayPolicyDecision => {
    const selectedMoveInCandidateList = debugCandidates.some((c) => c.moveUci === selectedUci);
    const selectionConsistency = selectedMoveInCandidateList ? "consistent" : "inconsistent";
    return {
      selectedUci,
      selectedSan,
      source,
      reason,
      debug: {
        candidates: selectedMoveInCandidateList
          ? debugCandidates
          : [...debugCandidates, { moveUci: selectedUci, moveSan: selectedSan, source: "fallback", safetyStatus: "fallback", selectionScore: -1, blockedReason: "selected_not_in_candidate_set" }],
        selectedMoveInCandidateList,
        selectionConsistency,
        continuationMoveSafetySource: safetySource,
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

  const emergency = emergencyFallbackMove(input.fen);
  if (!emergency) return null;
  return finalize(emergency.uci, emergency.san, "emergency_legal_fallback", "no_supported_moves_available", "fallback");
}
