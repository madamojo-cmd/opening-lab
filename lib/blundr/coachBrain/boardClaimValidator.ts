import type { CoachEvidencePacket } from "./coachEvidenceTypes";

export function canClaimPieceDevelops(packet: CoachEvidencePacket): boolean {
  const move = packet.moveFacts;
  if (!move || !move.legal) return false;
  if (move.movedPiece.type !== "b" && move.movedPiece.type !== "n" && move.movedPiece.type !== "r") return false;
  const toRank = Number(move.movedPiece.to[1]);
  if (move.movedPiece.color === "w" && toRank > 2) return true;
  if (move.movedPiece.color === "b" && toRank < 7) return true;
  return false;
}

export function canClaimBishopPressuresSquare(packet: CoachEvidencePacket, square: "f7" | "f2"): boolean {
  const move = packet.moveFacts;
  if (!move || !move.legal) return false;
  if (move.movedPiece.type !== "b") return false;
  return move.movedPieceAttacksAfter.includes(square);
}

export function canClaimAttacksSquare(packet: CoachEvidencePacket, square: string): boolean {
  const move = packet.moveFacts;
  if (!move || !move.legal) return false;
  return move.movedPieceAttacksAfter.includes(square);
}

export function canClaimPreparesD4(packet: CoachEvidencePacket): boolean {
  const move = packet.moveFacts;
  if (!move || !move.legal) return false;
  if (move.uci === "c2c3") return true;
  if (packet.trainingFacts?.conceptId === "prepare_center_break") return true;
  if (packet.visualRecipeFacts?.conceptId === "prepare_center_break") return true;
  if (packet.boardFacts.plausiblePawnBreaks.includes("d4") && move.centerSquaresAffected.includes("d4")) return true;
  if (packet.boardFacts.plausiblePawnBreaks.includes("d4_supported_by_c3") && move.uci === "c2c3") return true;
  return false;
}

export function canClaimRookSupportsFile(packet: CoachEvidencePacket, file: "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h"): boolean {
  const move = packet.moveFacts;
  if (!move || !move.legal) return false;
  if (move.movedPiece.type !== "r") return false;
  if (!move.movedPiece.to.startsWith(file)) return false;
  return packet.boardFacts.openFiles.includes(file) || packet.boardFacts.semiOpenFilesWhite.includes(file) || packet.boardFacts.semiOpenFilesBlack.includes(file) || ["d", "e"].includes(file);
}

export function canClaimCenterTension(packet: CoachEvidencePacket): boolean {
  return packet.boardFacts.contestedCenterSquares.length > 0 || packet.boardFacts.occupiedCenterSquares.length >= 2;
}

export function canClaimKingSafety(packet: CoachEvidencePacket): boolean {
  const move = packet.moveFacts;
  if (move?.isCastle) return true;
  return packet.boardFacts.kingSafetyFacts.length > 0;
}

export function canMentionKingSafety(packet: CoachEvidencePacket): boolean {
  return canClaimKingSafety(packet);
}

export function canMakeKingSafetyDominant(packet: CoachEvidencePacket): boolean {
  const move = packet.moveFacts;
  if (move?.isCastle) return true;
  if (packet.visualRecipeFacts?.conceptId === "castle_for_safety" || packet.trainingFacts?.conceptId === "castle_for_safety") return true;
  return packet.boardFacts.kingSafetyFacts.length >= 2;
}

export function canMentionCenterTension(packet: CoachEvidencePacket): boolean {
  return canClaimCenterTension(packet);
}

export function canMakeCenterTensionDominant(packet: CoachEvidencePacket): boolean {
  const concept = packet.visualRecipeFacts?.conceptId ?? packet.trainingFacts?.conceptId;
  if (concept === "prepare_center_break" || concept === "center_tension") return canClaimCenterTension(packet) || canClaimPreparesD4(packet);
  return canClaimCenterTension(packet) && !packet.expectedMoveUci;
}

export function canClaimExactMove(packet: CoachEvidencePacket): boolean {
  if (packet.stale) return false;
  if (!packet.selectedCandidateMoveUci) return false;
  if (!packet.legalMoveUcis.includes(packet.selectedCandidateMoveUci)) return false;

  const support = packet.repertoireSupport.supported && packet.repertoireSupport.supportedMoveUcis.includes(packet.selectedCandidateMoveUci);
  const engineSafe =
    packet.engineSupport.status === "ready" &&
    (packet.engineSupport.safeMoveUcis.includes(packet.selectedCandidateMoveUci) || packet.engineSupport.playableMoveUcis.includes(packet.selectedCandidateMoveUci));

  return support || engineSafe;
}
