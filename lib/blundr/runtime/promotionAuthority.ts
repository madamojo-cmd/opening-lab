import { Chess } from "chess.js";

export type PromotionPiece = "q" | "r" | "b" | "n";

export type PendingPromotion = {
  from: string;
  to: string;
  color: "w" | "b";
  legalPromotionUcis: string[];
  source: "user_attempt";
};

export type PromotionAuthorityResult = {
  selectedPromotionPiece: PromotionPiece | null;
  attemptedPromotionUci: string | null;
  acceptedPromotionUci: string | null;
  promotionAuthorityMatched: boolean | null;
  promotionAuthorityMismatchReason: string | null;
};

function normalizePromotionPiece(value: string | null | undefined): PromotionPiece | null {
  const piece = String(value ?? "").trim().toLowerCase();
  return piece === "q" || piece === "r" || piece === "b" || piece === "n" ? piece : null;
}

function moveToUci(move: { from: string; to: string; promotion?: string | null | undefined }): string {
  return `${move.from}${move.to}${move.promotion ?? ""}`.toLowerCase();
}

export function getPendingPromotionFromAttempt(input: {
  fen: string;
  from: string;
  to: string;
  color: "w" | "b";
}): PendingPromotion | null {
  try {
    const game = new Chess(input.fen);
    const legalMoves = (game.moves({ square: input.from as any, verbose: true }) as Array<{ from: string; to: string; promotion?: string | null }>)
      .filter((move) => move.from === input.from && move.to === input.to && Boolean(move.promotion));
    if (!legalMoves.length) return null;
    const legalPromotionUcis = Array.from(new Set(legalMoves.map((move) => moveToUci(move)).filter(Boolean))).sort();
    if (!legalPromotionUcis.length) return null;
    return {
      from: input.from,
      to: input.to,
      color: input.color,
      legalPromotionUcis,
      source: "user_attempt",
    };
  } catch {
    return null;
  }
}

export function resolvePromotionAuthority(input: {
  attemptedPromotionUci: string | null | undefined;
  acceptedPromotionUci?: string | null | undefined;
  authorityPromotionUci: string | null | undefined;
}): PromotionAuthorityResult {
  const attemptedPromotionUci = String(input.attemptedPromotionUci ?? "").trim().toLowerCase() || null;
  const acceptedPromotionUci = String(input.acceptedPromotionUci ?? "").trim().toLowerCase() || null;
  const authorityPromotionUci = String(input.authorityPromotionUci ?? "").trim().toLowerCase() || null;
  const selectedPromotionPiece = attemptedPromotionUci?.length === 5 ? normalizePromotionPiece(attemptedPromotionUci.slice(4, 5)) : null;

  if (!authorityPromotionUci) {
    return {
      selectedPromotionPiece,
      attemptedPromotionUci,
      acceptedPromotionUci,
      promotionAuthorityMatched: null,
      promotionAuthorityMismatchReason: null,
    };
  }

  if (attemptedPromotionUci === authorityPromotionUci) {
    return {
      selectedPromotionPiece,
      attemptedPromotionUci,
      acceptedPromotionUci,
      promotionAuthorityMatched: true,
      promotionAuthorityMismatchReason: null,
    };
  }

  const attemptedBase = attemptedPromotionUci?.slice(0, 4) ?? null;
  const authorityBase = authorityPromotionUci.slice(0, 4);
  return {
    selectedPromotionPiece,
    attemptedPromotionUci,
    acceptedPromotionUci,
    promotionAuthorityMatched: false,
    promotionAuthorityMismatchReason:
      attemptedBase && attemptedBase === authorityBase
        ? "promotion_suffix_mismatch"
        : "promotion_uci_mismatch",
  };
}

