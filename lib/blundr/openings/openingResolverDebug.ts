import type { ResolvedExpectedMove } from "./openingTypes";

export function buildOpeningResolverDebug(resolution: ResolvedExpectedMove): Record<string, unknown> {
  return {
    expectedMoveSource: resolution.source,
    expectedMoveCoverageTier: resolution.coverageTier,
    expectedMoveResolutionReason: resolution.reason,
    expectedMoveLineCursor: resolution.lineCursor,
    expectedMoveLineLength: resolution.lineLength,
    expectedMoveCandidateCount: resolution.candidateMoves.length,
    expectedMoveShouldTransitionToContinuation: resolution.shouldTransitionToContinuation,
    exactFenNodeFound: Boolean(resolution.debug.exactFenNodeFound),
    transpositionNodeFound: Boolean(resolution.debug.transpositionNodeFound),
    openingFamilyPlanFallbackUsed: Boolean(resolution.debug.openingFamilyPlanFallbackUsed),
    legacyRecoverableCandidateUsed: Boolean(resolution.debug.legacyRecoverableCandidateUsed),
    resolverCriticalIssue: resolution.source === "none" ? resolution.reason : null,
  };
}
