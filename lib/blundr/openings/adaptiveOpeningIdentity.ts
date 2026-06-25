import {
  getStage2RuntimeOpeningIdentityLines,
  type RuntimeOpeningIdentityLine,
} from "./runtimeTrainableRepertoires";
import { resolveStage2CanonicalOpeningId } from "./openingIdentity";
import { resolveLichessOpeningIdentity } from "./lichessOpeningIdentity";

export type AdaptiveOpeningIdentity = {
  selectedOpeningId: string;
  selectedOpeningName: string;
  currentOpeningId: string;
  currentOpeningName: string;
  matchedLineId: string;
  matchedPlayKey: string;
  lichessOpeningEco?: string;
  lichessOpeningName?: string;
  openingFamilyName?: string;
  opponentOpeningName?: string;
  transpositionDetected: boolean;
  transpositionLabel?: string;
  confidence: "exact" | "strong" | "partial";
  source: "runtime_play_key";
  ply: number;
  moveHistoryUci: string[];
};

export type ResolveAdaptiveOpeningIdentityInput = {
  selectedOpeningId: string | null | undefined;
  selectedOpeningName: string | null | undefined;
  moveHistoryUci: readonly string[];
  runtimeIdentityLines?: readonly RuntimeOpeningIdentityLine[];
};

function normalizeUci(move: string | null | undefined): string {
  return String(move ?? "").trim().toLowerCase();
}

function normalizeMoveHistory(moves: readonly string[]): string[] {
  return moves.map(normalizeUci).filter(Boolean);
}

function lineStartsWithHistory(lineMoves: readonly string[], history: readonly string[]): boolean {
  if (!history.length || history.length > lineMoves.length) return false;
  return history.every((move, index) => normalizeUci(lineMoves[index]) === move);
}

function opponentNameFromVariation(variationName: string | null | undefined): string | undefined {
  const text = String(variationName ?? "").trim();
  if (!text) return undefined;
  return text.split(",")[0]?.trim() || undefined;
}

export function resolveAdaptiveOpeningIdentity(
  input: ResolveAdaptiveOpeningIdentityInput,
): AdaptiveOpeningIdentity | null {
  const selectedOpeningId =
    resolveStage2CanonicalOpeningId(input.selectedOpeningId) ??
    normalizeUci(input.selectedOpeningId);

  if (!selectedOpeningId) return null;

  const moveHistoryUci = normalizeMoveHistory(input.moveHistoryUci);
  if (!moveHistoryUci.length) return null;

  const lichessIdentity = resolveLichessOpeningIdentity({ moveHistoryUci });

  const selectedOpeningName = String(input.selectedOpeningName ?? "").trim();
  const runtimeIdentityLines =
    input.runtimeIdentityLines ?? getStage2RuntimeOpeningIdentityLines(selectedOpeningId);

  const matches = runtimeIdentityLines
    .filter((line) => line.openingId === selectedOpeningId)
    .filter((line) => lineStartsWithHistory(line.playSequenceUci, moveHistoryUci))
    .sort((a, b) => {
      const exactA = a.playSequenceUci.length === moveHistoryUci.length ? 1 : 0;
      const exactB = b.playSequenceUci.length === moveHistoryUci.length ? 1 : 0;
      if (exactA !== exactB) return exactB - exactA;
      if (a.totalGames !== b.totalGames) return b.totalGames - a.totalGames;
      return b.moveCount - a.moveCount;
    });

  const best = matches[0];
  if (!best) return null;

  const exact = best.playSequenceUci.length === moveHistoryUci.length;
  const confidence: AdaptiveOpeningIdentity["confidence"] =
    exact ? "exact" : moveHistoryUci.length >= 4 ? "strong" : "partial";

  return {
    selectedOpeningId,
    selectedOpeningName: selectedOpeningName || best.openingName,
    currentOpeningId: best.openingId,
    currentOpeningName: best.openingName,
    matchedLineId: best.lineId,
    matchedPlayKey: best.playKey,
    lichessOpeningEco: lichessIdentity?.eco,
    lichessOpeningName: lichessIdentity?.name,
    openingFamilyName: lichessIdentity?.familyName,
    opponentOpeningName: opponentNameFromVariation(lichessIdentity?.variationName),
    transpositionDetected: false,
    confidence,
    source: "runtime_play_key",
    ply: moveHistoryUci.length,
    moveHistoryUci,
  };
}
