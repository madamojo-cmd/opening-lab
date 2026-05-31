import type { CoachEvidencePacket } from "./coachEvidenceTypes";

export function buildCoachBrainDebug(packet: CoachEvidencePacket): Record<string, unknown> {
  return {
    coachEvidenceStatus: packet.evidenceStatus,
    coachEvidenceStale: packet.stale,
    coachSelectedCandidateMove: packet.selectedCandidateMoveSan ?? packet.selectedCandidateMoveUci,
    coachExactMoveAllowed: packet.exactMoveAllowed,
    coachAllowedClaims: packet.allowedClaims,
    coachBlockedClaims: packet.blockedClaims,
    coachMoveFacts: packet.moveFacts,
    coachBoardFactsSummary: {
      centerState: packet.boardFacts.centerState,
      contestedCenterSquares: packet.boardFacts.contestedCenterSquares,
      kingSafetyFacts: packet.boardFacts.kingSafetyFacts,
      plausiblePawnBreaks: packet.boardFacts.plausiblePawnBreaks,
      leastActivePieces: packet.boardFacts.leastActivePieces,
    },
    coachEngineStatus: packet.engineSupport.status,
    coachEngineBestMove: packet.engineSupport.bestMoveSan ?? packet.engineSupport.bestMoveUci,
    coachEngineSafeMoves: packet.engineSupport.safeMoveUcis,
    coachMaiaStatus: packet.maiaSupport.status,
    coachRepertoireSupport: packet.repertoireSupport,
  };
}
