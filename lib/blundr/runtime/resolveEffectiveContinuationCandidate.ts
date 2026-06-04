import { Chess } from "chess.js";

export type EffectiveContinuationCandidate = {
  uci: string;
  san: string;
  from: string;
  to: string;
  pieceTypeCode: string;
  pieceTypeCanonical: string;
  source: string;
  label: string;
  fen4: string;
  reason: string;
};

export type ResolveEffectiveContinuationCandidateInput = {
  trainingMode: string;
  isUserTurn: boolean;
  trainerPhase: string;
  boardFen: string;
  boardFen4: string;
  legalMoveUcis: string[];
  lockedCandidate?: {
    uci?: string | null;
    san?: string | null;
    source?: string | null;
    label?: string | null;
  } | null;
  continuationResolvedTargetUci?: string | null;
  continuationResolvedTargetSan?: string | null;
  continuationResolvedTargetSource?: string | null;
  continuationResolvedTargetLabel?: string | null;
  continuationResolvedTargetFen4?: string | null;
};

export type EffectiveContinuationGuard = {
  resolvedTargetUci: string | null;
  effectiveContinuationCandidateUci: string | null;
  effectiveContinuationCandidateSan: string | null;
  effectiveContinuationCandidateSource: string | null;
  effectiveContinuationCandidateBlockedReason: string | null;
  blockedReason: string | null;
  stockfishPromotionGuardTrainingMode: string | null;
  stockfishPromotionGuardIsUserTurn: boolean;
  stockfishPromotionGuardTrainerPhase: string | null;
  stockfishPromotionGuardFenMatches: boolean;
  stockfishPromotionGuardLegal: boolean;
  stockfishPromotionGuardSourceAllowed: boolean;
};

export type ResolveEffectiveContinuationCandidateOutput = {
  candidate: EffectiveContinuationCandidate | null;
  guard: EffectiveContinuationGuard;
};

const ALLOWED_STOCKFISH_SOURCES = new Set(["stockfish_top_move", "stockfish_safe_move", "engine_best"]);
const PIECE_NAME_BY_CODE: Record<string, string> = {
  p: "pawn",
  n: "knight",
  b: "bishop",
  r: "rook",
  q: "queen",
  k: "king",
};

function normalizeFen4(fen: string | null | undefined): string {
  return String(fen ?? "").split(" ").slice(0, 4).join(" ");
}

function normalizeUci(uci: string | null | undefined): string | null {
  const value = String(uci ?? "").trim().toLowerCase();
  return /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(value) ? value : null;
}

function buildCandidateFromUci(input: {
  boardFen: string;
  boardFen4: string;
  uci: string;
  source: string;
  label: string;
  reason: string;
  fallbackSan?: string | null;
}): EffectiveContinuationCandidate | null {
  try {
    const game = new Chess(input.boardFen);
    const move = game.move({
      from: input.uci.slice(0, 2),
      to: input.uci.slice(2, 4),
      promotion: input.uci.length > 4 ? input.uci.slice(4, 5) : "q",
    });
    if (!move) return null;

    const pieceTypeCode = String(move.piece ?? "").toLowerCase();
    const pieceTypeCanonical = PIECE_NAME_BY_CODE[pieceTypeCode] ?? "unknown";
    const appliedUci = `${move.from}${move.to}${move.promotion ?? ""}`.toLowerCase();
    const san = String(move.san ?? input.fallbackSan ?? appliedUci);
    if (!san || pieceTypeCanonical === "unknown") return null;

    return {
      uci: appliedUci,
      san,
      from: String(move.from),
      to: String(move.to),
      pieceTypeCode,
      pieceTypeCanonical,
      source: input.source,
      label: input.label,
      fen4: input.boardFen4,
      reason: input.reason,
    };
  } catch {
    return null;
  }
}

export function resolveEffectiveContinuationCandidate(
  input: ResolveEffectiveContinuationCandidateInput,
): ResolveEffectiveContinuationCandidateOutput {
  const legalSet = new Set(input.legalMoveUcis.map((uci) => String(uci).toLowerCase()));
  const resolvedTargetUci = normalizeUci(input.continuationResolvedTargetUci);
  const resolvedTargetSource = String(input.continuationResolvedTargetSource ?? "").trim();
  const sourceAllowed = resolvedTargetSource.length > 0 && ALLOWED_STOCKFISH_SOURCES.has(resolvedTargetSource);
  const fenMatches =
    resolvedTargetUci != null &&
    normalizeFen4(input.continuationResolvedTargetFen4 ?? input.boardFen4) === normalizeFen4(input.boardFen4);
  const legal = resolvedTargetUci != null && legalSet.has(resolvedTargetUci);

  const blockedByMode = input.trainingMode !== "continuation";
  const blockedByTurn = !input.isUserTurn;
  const blockedByPhase = input.trainerPhase !== "ready_for_user";

  const lockUci = normalizeUci(input.lockedCandidate?.uci);
  const lockLegal = lockUci != null && legalSet.has(lockUci);
  const lockCandidate =
    lockLegal && lockUci
      ? buildCandidateFromUci({
          boardFen: input.boardFen,
          boardFen4: normalizeFen4(input.boardFen4),
          uci: lockUci,
          source: String(input.lockedCandidate?.source ?? "continuation_policy"),
          label: String(input.lockedCandidate?.label ?? "Best"),
          reason: "locked_candidate",
          fallbackSan: input.lockedCandidate?.san,
        })
      : null;

  let blockedReason: string | null = null;
  let candidate = lockCandidate;

  if (!candidate) {
    if (blockedByMode) blockedReason = "not_continuation_mode";
    else if (blockedByTurn) blockedReason = "not_user_turn";
    else if (blockedByPhase) blockedReason = "trainer_phase_not_ready_for_user";
    else if (!resolvedTargetUci) blockedReason = "missing_resolved_target";
    else if (!sourceAllowed) blockedReason = "source_not_allowed";
    else if (!fenMatches) blockedReason = "fen_mismatch";
    else if (!legal) blockedReason = "illegal_move";
    else {
      candidate = buildCandidateFromUci({
        boardFen: input.boardFen,
        boardFen4: normalizeFen4(input.boardFen4),
        uci: resolvedTargetUci,
        source: resolvedTargetSource,
        label: String(input.continuationResolvedTargetLabel ?? "Best"),
        reason: "stockfish_resolved_target_promoted",
        fallbackSan: input.continuationResolvedTargetSan,
      });
      if (!candidate) blockedReason = "missing_san_or_piece";
    }
  }

  if (!candidate && !blockedReason) blockedReason = "unknown";

  const guard: EffectiveContinuationGuard = {
    resolvedTargetUci,
    effectiveContinuationCandidateUci: candidate?.uci ?? null,
    effectiveContinuationCandidateSan: candidate?.san ?? null,
    effectiveContinuationCandidateSource: candidate?.source ?? null,
    effectiveContinuationCandidateBlockedReason: candidate ? null : blockedReason,
    blockedReason: candidate ? null : blockedReason,
    stockfishPromotionGuardTrainingMode: input.trainingMode ?? null,
    stockfishPromotionGuardIsUserTurn: Boolean(input.isUserTurn),
    stockfishPromotionGuardTrainerPhase: input.trainerPhase ?? null,
    stockfishPromotionGuardFenMatches: fenMatches,
    stockfishPromotionGuardLegal: legal,
    stockfishPromotionGuardSourceAllowed: sourceAllowed,
  };

  return { candidate, guard };
}
