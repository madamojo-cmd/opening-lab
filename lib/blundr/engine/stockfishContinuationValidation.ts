import { Chess } from "chess.js";
import type {
  ContinuationSuggestionValidation,
  ContinuationUserMoveRatingResult,
  MoveRatingConfidence,
  MoveStrengthRating,
  StockfishTopMovesResult,
} from "./stockfishEvaluationTypes";

function normalizeUci(value: string | null | undefined): string {
  return String(value ?? "").trim().toLowerCase();
}

function cpLoss(best: number, current: number | null): number | null {
  if (current == null) return null;
  return Math.max(0, best - current);
}

export function validateContinuationSuggestionAgainstStockfish(input: {
  candidateUci: string;
  candidateSan: string;
  stockfish: StockfishTopMovesResult;
}): ContinuationSuggestionValidation {
  const candidateUci = normalizeUci(input.candidateUci);
  const best = input.stockfish.topMoves.find((move) => move.rank === 1) ?? input.stockfish.topMoves[0];
  const match = input.stockfish.topMoves.find((move) => normalizeUci(move.uci) === candidateUci);
  const rank = match?.rank ?? null;
  const top10 = typeof rank === "number" && rank >= 1 && rank <= 10;
  const top1 = rank === 1;
  const loss = best ? cpLoss(best.centipawnsFromSideToMove, match?.centipawnsFromSideToMove ?? null) : null;
  const providerReady = input.stockfish.providerStatus === "ready";
  const accepted = providerReady && top10;

  return {
    candidateUci,
    candidateSan: input.candidateSan,
    isTop10: top10,
    isTop1: top1,
    rank,
    centipawnLossFromBest: loss,
    accepted,
    rejectionReason: accepted ? null : (!providerReady ? "stockfish_provider_unavailable" : "suggested_move_not_in_stockfish_top10"),
    replacementUci: accepted ? undefined : best?.uci,
    replacementSan: accepted ? undefined : best?.san,
    providerStatus: input.stockfish.providerStatus,
  };
}

export function validateContinuationSuggestion(input: {
  candidateUci: string;
  candidateSan: string;
  stockfish: StockfishTopMovesResult;
}): ContinuationSuggestionValidation {
  return validateContinuationSuggestionAgainstStockfish(input);
}

function buildUngradedResult(input: {
  reason: string;
  providerStatus: StockfishTopMovesResult["providerStatus"];
  bestMoveUci: string | null;
  bestMoveSan: string | null;
  userMoveUci: string;
  suppression: ContinuationUserMoveRatingResult["badgeSuppressedReason"];
  userMoveFoundInTopMoves?: boolean;
  rank?: number | null;
  bestEvalCp?: number | null;
  userEvalCp?: number | null;
  depth?: number | null;
  legal?: boolean;
  stale?: boolean;
  confidence?: MoveRatingConfidence;
  ratingMethod?: ContinuationUserMoveRatingResult["ratingMethod"];
  mateBefore?: number | null;
  mateAfter?: number | null;
  normalizedForMoverColor?: boolean;
  extraDebug?: Record<string, unknown>;
}): ContinuationUserMoveRatingResult {
  return {
    label: "Ungraded",
    severity: "unknown",
    centipawnLoss: null,
    rank: input.rank ?? null,
    reason: input.reason,
    isUserFacing: false,
    visibleBadgeLabel: null,
    badgeVisible: false,
    badgeSuppressedReason: input.suppression,
    providerStatus: input.providerStatus,
    ratingMethod: input.ratingMethod ?? "unavailable",
    userMoveFoundInTopMoves: Boolean(input.userMoveFoundInTopMoves),
    userMoveRank: input.rank ?? null,
    bestMoveUci: input.bestMoveUci,
    bestMoveSan: input.bestMoveSan,
    bestEvalCp: input.bestEvalCp ?? null,
    userEvalCp: input.userEvalCp ?? null,
    depth: input.depth ?? null,
    mateBefore: input.mateBefore ?? null,
    mateAfter: input.mateAfter ?? null,
    normalizedForMoverColor: input.normalizedForMoverColor ?? true,
    legal: input.legal ?? true,
    stale: input.stale ?? false,
    confidence: input.confidence ?? "unavailable",
    debug: {
      providerStatus: input.providerStatus,
      bestMoveUci: input.bestMoveUci,
      bestMoveSan: input.bestMoveSan,
      ...input.extraDebug,
    },
  };
}

function confidenceFromDepth(depth: number | null, method: "multipv_exact_match" | "direct_after_move_eval"): MoveRatingConfidence {
  if (!depth || depth <= 0) return "low";
  if (depth >= 10) return "high";
  if (depth >= 8) return "medium";
  return method === "multipv_exact_match" ? "medium" : "low";
}

function labelForCpLoss(input: {
  cpLoss: number;
  rank: number | null;
  hasGeniusMotif: boolean;
  mateSwingBlunder: boolean;
  missedMateBlunder: boolean;
}): Pick<MoveStrengthRating, "label" | "severity" | "reason"> {
  const { cpLoss, rank, hasGeniusMotif, mateSwingBlunder, missedMateBlunder } = input;
  if ((rank !== null && rank <= 3 || cpLoss <= 25) && hasGeniusMotif) {
    return { label: "Genius", severity: "positive", reason: "genius_motif_verified" };
  }
  if (rank === 1 || cpLoss <= 15) return { label: "Best", severity: "positive", reason: "top_choice_or_near_top" };
  if (cpLoss <= 40) return { label: "Excellent", severity: "positive", reason: "close_to_best" };
  if (cpLoss <= 90) return { label: "Good", severity: "neutral", reason: "playable_continuation" };
  if (cpLoss <= 180) return { label: "Inaccuracy", severity: "warning", reason: "noticeable_drop" };
  if (cpLoss <= 350 && !mateSwingBlunder && !missedMateBlunder) return { label: "Mistake", severity: "danger", reason: "major_drop" };
  return { label: "Blunder", severity: "danger", reason: mateSwingBlunder || missedMateBlunder ? "mate_or_forcing_swing" : "severe_drop" };
}

export function rateContinuationUserMove(input: {
  userMoveUci: string;
  userMoveSan?: string;
  stockfish: StockfishTopMovesResult;
  legal?: boolean;
  stale?: boolean;
  allowUngradedBadgeForDebug?: boolean;
  directAfterMoveEvaluation?: {
    providerStatus: StockfishTopMovesResult["providerStatus"];
    centipawnsFromMoverPerspective?: number | null;
    centipawnsFromSideToMove?: number | null;
    mateIn?: number | null;
    depth?: number | null;
    stale?: boolean;
    timeout?: boolean;
  };
  geniusMotifs?: {
    givesCheckmate?: boolean;
    onlyMoveAvoidsMajorDrop?: boolean;
    tacticalSacrificeTopChoice?: boolean;
    createsForcedMate?: boolean;
    winsMajorMaterial?: boolean;
    allowsForcedMateAfterMove?: boolean;
    missesImmediateMate?: boolean;
  };
}): ContinuationUserMoveRatingResult {
  const moveUci = normalizeUci(input.userMoveUci);
  const best = input.stockfish.topMoves.find((move) => move.rank === 1) ?? input.stockfish.topMoves[0];
  const current = input.stockfish.topMoves.find((move) => normalizeUci(move.uci) === moveUci);
  const providerStatus = input.stockfish.providerStatus;
  const legal = input.legal !== false;
  const stale = Boolean(input.stale || input.directAfterMoveEvaluation?.stale);

  if (providerStatus !== "ready" || !best) {
    return buildUngradedResult({
      reason: providerStatus !== "ready" ? "stockfish_provider_unavailable" : "insufficient_evidence",
      providerStatus,
      bestMoveUci: best?.uci ?? null,
      bestMoveSan: best?.san ?? null,
      userMoveUci: moveUci,
      suppression: providerStatus !== "ready" ? "engine_unavailable" : "insufficient_evidence",
      userMoveFoundInTopMoves: Boolean(current),
      rank: current?.rank ?? null,
      bestEvalCp: best?.centipawnsFromSideToMove ?? null,
      legal,
      stale,
      confidence: "unavailable",
      depth: input.stockfish.depth ?? null,
    });
  }
  if (!legal) {
    return buildUngradedResult({
      reason: "illegal_or_inconsistent_move",
      providerStatus,
      bestMoveUci: best.uci,
      bestMoveSan: best.san,
      userMoveUci: moveUci,
      suppression: "insufficient_evidence",
      userMoveFoundInTopMoves: Boolean(current),
      rank: current?.rank ?? null,
      bestEvalCp: best.centipawnsFromSideToMove,
      legal: false,
      stale,
      confidence: "unavailable",
      depth: input.stockfish.depth ?? null,
    });
  }
  if (stale) {
    return buildUngradedResult({
      reason: "stale_position",
      providerStatus,
      bestMoveUci: best.uci,
      bestMoveSan: best.san,
      userMoveUci: moveUci,
      suppression: "stale_position",
      userMoveFoundInTopMoves: Boolean(current),
      rank: current?.rank ?? null,
      bestEvalCp: best.centipawnsFromSideToMove,
      legal,
      stale: true,
      confidence: "unavailable",
      depth: input.stockfish.depth ?? null,
    });
  }

  let userEvalCp: number | null = current?.centipawnsFromSideToMove ?? null;
  let mateAfter: number | null = current?.mateIn ?? null;
  let ratingMethod: ContinuationUserMoveRatingResult["ratingMethod"] = current ? "multipv_exact_match" : "unavailable";
  let depth: number | null = current?.depth ?? input.stockfish.depth ?? null;

  if (!current) {
    if (input.directAfterMoveEvaluation?.timeout) {
      return buildUngradedResult({
        reason: "evaluation_timeout",
        providerStatus,
        bestMoveUci: best.uci,
        bestMoveSan: best.san,
        userMoveUci: moveUci,
        suppression: "evaluation_timeout",
        userMoveFoundInTopMoves: false,
        rank: null,
        bestEvalCp: best.centipawnsFromSideToMove,
        legal,
        stale,
      confidence: "unavailable",
      extraDebug: { ratingMethod: "unavailable", userMoveSan: input.userMoveSan ?? null },
      depth,
    });
  }
    if (input.directAfterMoveEvaluation?.providerStatus === "ready") {
      const direct = input.directAfterMoveEvaluation;
      userEvalCp =
        direct.centipawnsFromMoverPerspective ??
        (typeof direct.centipawnsFromSideToMove === "number" ? -direct.centipawnsFromSideToMove : null);
      mateAfter = direct.mateIn ?? null;
      ratingMethod = "direct_after_move_eval";
      depth = direct.depth ?? depth;
    }
  }

  if (userEvalCp == null) {
    return buildUngradedResult({
      reason: "insufficient_evidence",
      providerStatus,
      bestMoveUci: best.uci,
      bestMoveSan: best.san,
      userMoveUci: moveUci,
      suppression: "insufficient_evidence",
      userMoveFoundInTopMoves: Boolean(current),
      rank: current?.rank ?? null,
      bestEvalCp: best.centipawnsFromSideToMove,
      legal,
      stale,
      confidence: "low",
      ratingMethod,
      extraDebug: { userMoveSan: input.userMoveSan ?? null },
      depth,
    });
  }
  const loss = Math.max(0, best.centipawnsFromSideToMove - userEvalCp);
  const motifs = input.geniusMotifs ?? {};
  const hasGeniusMotif = Boolean(
    motifs.givesCheckmate ||
    motifs.onlyMoveAvoidsMajorDrop ||
    motifs.tacticalSacrificeTopChoice ||
    motifs.createsForcedMate ||
    motifs.winsMajorMaterial,
  );
  const mateSwingBlunder = Boolean(motifs.allowsForcedMateAfterMove);
  const missedMateBlunder = Boolean(motifs.missesImmediateMate);
  const rated = labelForCpLoss({
    cpLoss: loss,
    rank: current?.rank ?? null,
    hasGeniusMotif,
    mateSwingBlunder,
    missedMateBlunder,
  });
  const confidence = confidenceFromDepth(depth, current ? "multipv_exact_match" : "direct_after_move_eval");
  const visibleBadgeLabel = rated.label === "Ungraded" ? null : rated.label;
  const badgeVisible = Boolean(
    providerStatus === "ready" &&
    visibleBadgeLabel &&
    !stale &&
    (confidence === "high" || confidence === "medium") &&
    !(rated.label === "Ungraded" && !input.allowUngradedBadgeForDebug),
  );

  return {
    label: rated.label,
    severity: rated.severity,
    centipawnLoss: loss,
    rank: current?.rank ?? null,
    reason: rated.reason,
    isUserFacing: rated.label !== "Ungraded",
    visibleBadgeLabel,
    badgeVisible,
    badgeSuppressedReason: badgeVisible ? "none" : "insufficient_evidence",
    providerStatus,
    ratingMethod,
    userMoveFoundInTopMoves: Boolean(current),
    userMoveRank: current?.rank ?? null,
    bestMoveUci: best.uci,
    bestMoveSan: best.san,
    bestEvalCp: best.centipawnsFromSideToMove,
    userEvalCp,
    depth,
    mateBefore: best.mateIn ?? null,
    mateAfter,
    normalizedForMoverColor: true,
    legal,
    stale,
    confidence,
    debug: {
      providerStatus,
      bestMoveUci: best.uci,
      bestMoveSan: best.san,
      userMoveUci: moveUci,
      userMoveSan: input.userMoveSan ?? null,
      userMoveFoundInTopMoves: Boolean(current),
      userMoveRank: current?.rank ?? null,
      ratingMethod,
      geniusMotifs: motifs,
      depth,
    },
  };
}

export function rateUserMoveStrength(input: {
  userMoveUci: string;
  stockfish: StockfishTopMovesResult;
  geniusMotifs?: {
    givesCheckmate?: boolean;
    onlyMoveAvoidsMajorDrop?: boolean;
    tacticalSacrificeTopChoice?: boolean;
    createsForcedMate?: boolean;
    winsMajorMaterial?: boolean;
  };
}): MoveStrengthRating {
  const rated = rateContinuationUserMove({
    userMoveUci: input.userMoveUci,
    stockfish: input.stockfish,
    geniusMotifs: input.geniusMotifs,
  });
  return {
    label: rated.label,
    severity: rated.severity,
    centipawnLoss: rated.centipawnLoss,
    rank: rated.rank,
    reason: rated.reason,
    isUserFacing: rated.isUserFacing,
    debug: rated.debug,
  };
}

export function mapEngineLinesToStockfishTopMoves(input: {
  fen: string;
  pvs: Array<{ uci: string; san?: string; cp?: number; depth?: number }>;
  depth?: number;
  multipv?: number;
  providerStatus: StockfishTopMovesResult["providerStatus"];
  errorReason?: string;
}): StockfishTopMovesResult {
  const sideToMove = (() => {
    try {
      return new Chess(input.fen).turn() as "w" | "b";
    } catch {
      return null;
    }
  })();
  const generatedAt = Date.now();
  const requestedMultipv = Math.max(1, Number(input.multipv ?? 10));
  const topMoves = input.pvs.slice(0, requestedMultipv).map((pv, index) => ({
    uci: normalizeUci(pv.uci),
    san: String(pv.san ?? pv.uci ?? ""),
    rank: index + 1,
    centipawnsFromSideToMove: Number(pv.cp ?? 0),
    mateIn: null,
    depth: Number(pv.depth ?? input.depth ?? 0),
    isLegal: true,
    source: "stockfish" as const,
    generatedAt,
  }));
  return {
    fen: input.fen,
    sideToMove,
    depth: Number(input.depth ?? topMoves[0]?.depth ?? 0),
    multipv: requestedMultipv,
    topMoves,
    bestMoveUci: topMoves[0]?.uci ?? null,
    bestMoveSan: topMoves[0]?.san ?? null,
    providerStatus: input.providerStatus,
    errorReason: input.errorReason,
  };
}
