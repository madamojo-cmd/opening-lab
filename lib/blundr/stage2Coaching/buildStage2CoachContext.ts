import type { Stage2CoachContext } from "./stage2CoachingTypes";

function cleanString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function buildStage2CoachContext(input: Stage2CoachContext): Stage2CoachContext {
  return {
    openingId: cleanString(input.openingId),
    playKeyBefore: cleanString(input.playKeyBefore),
    targetUci: cleanString(input.targetUci)?.toLowerCase(),
    targetSan: cleanString(input.targetSan),
    targetPieceType: cleanString(input.targetPieceType)?.toLowerCase(),
    surface: input.surface,
    runtimeBook: input.runtimeBook
      ? {
          status: cleanString(input.runtimeBook.status),
          candidateCount: Number.isFinite(Number(input.runtimeBook.candidateCount)) ? Number(input.runtimeBook.candidateCount) : undefined,
          topCandidateUci: cleanString(input.runtimeBook.topCandidateUci)?.toLowerCase(),
          topCandidateSan: cleanString(input.runtimeBook.topCandidateSan),
          topCandidateRank: Number.isFinite(Number(input.runtimeBook.topCandidateRank)) ? Number(input.runtimeBook.topCandidateRank) : undefined,
          topCandidateTotalGames: Number.isFinite(Number(input.runtimeBook.topCandidateTotalGames)) ? Number(input.runtimeBook.topCandidateTotalGames) : undefined,
          bookExhausted: Boolean(input.runtimeBook.bookExhausted),
        }
      : undefined,
    plainRevealState: input.plainRevealState,
  };
}
