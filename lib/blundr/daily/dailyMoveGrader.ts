import { Chess } from "chess.js";
import { sanToUci } from "@/lib/blundr/geometry/legalMoveUtils";
import { normalizeRuntimeCastlingUci } from "@/lib/blundr/runtime/uciNormalization";
import type { DailyBlundrAttemptOutcome } from "./dailyBlundrTypes";

export type DailyBlundrMoveGradeInput = {
  fen: string;
  expectedMoveUci: string | null;
  expectedMoveSan: string | null;
  attemptedMove: string;
};

export type DailyBlundrMoveGradeResult = {
  outcome: DailyBlundrAttemptOutcome;
  attemptedMoveUci: string | null;
  attemptedMoveSan: string | null;
  expectedMoveUci: string | null;
  expectedMoveSan: string | null;
  reason: string;
};

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeAttemptText(value: string): string {
  return normalizeText(value).replace(/\s+/g, "");
}

function isUciLike(value: string): boolean {
  return /^[a-h][1-8][a-h][1-8][qrbn]?$/i.test(value);
}

function toCanonicalUci(value: string | null | undefined): string | null {
  const normalized = normalizeRuntimeCastlingUci(value);
  return normalized ? normalized.toLowerCase() : null;
}

function applyUciForSan(fen: string, uci: string): string | null {
  try {
    const chess = new Chess(fen);
    const move = chess.move({
      from: uci.slice(0, 2),
      to: uci.slice(2, 4),
      promotion: uci.length > 4 ? uci.slice(4, 5) : undefined,
    });
    return move ? move.san : null;
  } catch {
    return null;
  }
}

function resolveExpectedUci(fen: string, expectedMoveUci: string | null, expectedMoveSan: string | null): string | null {
  const direct = toCanonicalUci(expectedMoveUci);
  if (direct) return direct;
  const san = normalizeText(expectedMoveSan);
  if (!san) return null;
  const derived = sanToUci(fen, san);
  return derived ? toCanonicalUci(derived) : null;
}

export function gradeDailyBlundrMove(input: DailyBlundrMoveGradeInput): DailyBlundrMoveGradeResult {
  const attemptedMove = normalizeAttemptText(input.attemptedMove);
  const expectedMoveUci = resolveExpectedUci(input.fen, input.expectedMoveUci, input.expectedMoveSan);
  const expectedMoveSan = normalizeText(input.expectedMoveSan) || null;

  if (!attemptedMove) {
    return {
      outcome: "skip",
      attemptedMoveUci: null,
      attemptedMoveSan: null,
      expectedMoveUci,
      expectedMoveSan,
      reason: "empty_move",
    };
  }

  if (isUciLike(attemptedMove)) {
    const attemptedMoveUci = toCanonicalUci(attemptedMove);
    const attemptedMoveSan = attemptedMoveUci ? applyUciForSan(input.fen, attemptedMoveUci) : null;
    return {
      outcome: attemptedMoveUci && expectedMoveUci && attemptedMoveUci === expectedMoveUci ? "correct" : "incorrect",
      attemptedMoveUci,
      attemptedMoveSan,
      expectedMoveUci,
      expectedMoveSan,
      reason: attemptedMoveUci && expectedMoveUci && attemptedMoveUci === expectedMoveUci ? "matched_expected_move" : "uci_mismatch",
    };
  }

  const attemptedMoveUci = sanToUci(input.fen, attemptedMove);
  const attemptedMoveUciCanonical = toCanonicalUci(attemptedMoveUci);
  const attemptedMoveSan = attemptedMoveUciCanonical ? applyUciForSan(input.fen, attemptedMoveUciCanonical) : null;

  if (!attemptedMoveUciCanonical) {
    return {
      outcome: "incorrect",
      attemptedMoveUci: null,
      attemptedMoveSan: attemptedMove || null,
      expectedMoveUci,
      expectedMoveSan,
      reason: "unrecognized_move_input",
    };
  }

  return {
    outcome: expectedMoveUci && attemptedMoveUciCanonical === expectedMoveUci ? "correct" : "incorrect",
    attemptedMoveUci: attemptedMoveUciCanonical,
    attemptedMoveSan,
    expectedMoveUci,
    expectedMoveSan,
    reason: expectedMoveUci && attemptedMoveUciCanonical === expectedMoveUci ? "matched_expected_move" : "san_mismatch",
  };
}

