import type { CandidateMoveProfile, CoachOpportunityScore, PositionEvidencePacket } from "./liveCoachTypes";

export function buildLiveCoachDebug(input: {
  evidence: PositionEvidencePacket;
  candidates: CandidateMoveProfile[];
  selected: CoachOpportunityScore | null;
  silenceReason?: string;
}) {
  return {
    positionEvidenceStatus: input.evidence.evidenceStatus,
    normalizedFen: input.evidence.normalizedFen,
    maiaStatus: input.evidence.maiaSignals?.status ?? "unavailable",
    maiaTopMoves: input.evidence.maiaSignals?.topMoves ?? [],
    maiaEntropy: input.evidence.maiaSignals?.entropy,
    humanConsensus: input.evidence.maiaSignals?.humanConsensus,
    skillGradientSummary: (input.evidence.maiaSignals?.skillGradients ?? []).slice(0, 5),
    engineSafetySummary: input.evidence.engineSignals?.candidates ?? [],
    candidateMoveClasses: input.candidates.map((c) => ({ moveUci: c.moveUci, moveClass: c.moveClass })),
    positionFeatureSummary: input.evidence.positionFeatures,
    connectedConcepts: input.evidence.patternSignals?.connectedConcepts ?? [],
    weakConceptMatches: input.evidence.patternSignals?.weakConceptMatches ?? [],
    selectedOpportunity: input.selected?.opportunity,
    selectedIntent: input.selected?.intent,
    selectedCommentScore: input.selected?.totalScore,
    exactMoveAllowed: input.selected?.exactMoveAllowed ?? false,
    silenceReason: input.silenceReason,
  };
}
