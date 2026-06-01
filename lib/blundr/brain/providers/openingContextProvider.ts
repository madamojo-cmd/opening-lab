/**
 * openingContextProvider.ts
 * Deterministic, lightweight opening context for EvidenceGraph.
 * Uses only the opening tree / known repertoire lines. No external engines.
 */

import type { CurrentInstructionTarget } from "../../runtime/currentInstructionFrame";

export function getBasicOpeningContext(target: CurrentInstructionTarget, fen: string) {
  // In a real implementation this would consult the openingTree for the current repertoire.
  // For the deterministic lock we keep it lightweight and honest.

  const isBookMove = target.source === "lesson_line" ||
                     target.source === "opening_branch" ||
                     target.trust === "book_verified" ||
                     (target as any).source?.includes("curated");

  const conceptTags: string[] = [];

  if (target.isDevelopment) conceptTags.push("development");
  if (target.isCentralPawnAdvance) conceptTags.push("central_control");
  if (target.isCastle) conceptTags.push("king_safety");
  if (target.isCapture) conceptTags.push("capture");

  return {
    isBookMove: !!isBookMove,
    conceptTags,
  };
}
