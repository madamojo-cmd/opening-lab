/**
 * boardTruthProvider.ts
 * Thin, deterministic adapter over existing boardTruth module for EvidenceGraph.
 */

import { buildBoardTruth } from "../boardTruth/buildBoardTruth";

export function getBoardTruthForEvidence(fen: string) {
  return buildBoardTruth(fen);
}
