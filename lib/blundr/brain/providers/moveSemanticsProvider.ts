/**
 * moveSemanticsProvider.ts
 * Pure, deterministic move classification helpers for EvidenceGraph.
 * No engines, no LLM.
 */

import type { CurrentInstructionTarget } from "../../runtime/currentInstructionFrame";

export function isDevelopmentMove(target: CurrentInstructionTarget, fen: string) {
  const piece = target.pieceType?.toLowerCase();
  const fromRank = parseInt(target.from?.[1] || "0");
  const toRank = parseInt(target.to?.[1] || "0");

  let developsPiece = false;
  let improvesActivity = false;

  if (["n", "b"].includes(piece)) {
    // Minor pieces moving off back rank in opening/middlegame
    if (fromRank <= 2 && toRank >= 3) developsPiece = true;
    if (fromRank <= 1) developsPiece = true;
  }

  if (piece === "p") {
    // Pawn advances that gain space or open lines
    if (toRank - fromRank >= 1) improvesActivity = true;
  }

  if (target.isCastle) {
    improvesActivity = true; // castling improves rook activity + king safety
  }

  return {
    isDevelopmentMove: developsPiece || improvesActivity || target.isCastle,
    developsPiece,
    improvesActivity,
  };
}

export function isCentralControl(target: CurrentInstructionTarget) {
  const toFile = target.to?.[0];
  const centralFiles = ["d", "e"];
  const centralRanks = [4, 5];

  const toRank = parseInt(target.to?.[1] || "0");
  const isCentralPawnAdvance = target.pieceType === "p" &&
    centralFiles.includes(toFile || "") &&
    centralRanks.includes(toRank);

  const controlsCenter = centralFiles.includes(toFile || "") || centralRanks.includes(toRank);

  return {
    isCentralPawnAdvance,
    controlsCenter,
  };
}

export function isKingSafetyRelevant(target: CurrentInstructionTarget, fen: string) {
  const isCastling = target.isCastle;
  const improvesKingSafety = isCastling || target.isKingSafetyMove || false;

  return {
    improvesKingSafety,
    isCastling,
  };
}
