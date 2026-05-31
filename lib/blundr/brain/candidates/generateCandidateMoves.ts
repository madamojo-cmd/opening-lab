/**
 * generateCandidateMoves - Production Candidate Generator (Step 3+)
 * Per Brain V2 Production Spec.
 * Collects legal moves + known good candidates from existing sources during transition.
 */

import type { CandidateEvaluation } from "../types";
import { getLegalMoves } from "../../geometry/legalMoveUtils";
import { parseFenBoard } from "../../geometry/fenBoardParser";
import type { ParsedBoard } from "../../geometry/boardTypes";

export function generateCandidateMoves(fen: string, currentTargetUci?: string): any[] { // Return type will be refined
  try {
    const board: ParsedBoard = parseFenBoard(fen);
    const legal = getLegalMoves(fen);

    const candidates = legal.map((move: any) => ({
      uci: `${move.from}${move.to}${move.promotion || ''}`,
      san: move.san,
      pieceType: move.piece,
      from: move.from,
      to: move.to,
      legal: true,
      // TODO: Full scoring will happen in later steps
      score: 0,
    }));

    // Ensure the current target is always in the pool if provided
    if (currentTargetUci && !candidates.some(c => c.uci === currentTargetUci)) {
      // This shouldn't normally happen if target is legal, but defensive
      candidates.push({
        uci: currentTargetUci,
        san: currentTargetUci,
        pieceType: 'unknown',
        from: currentTargetUci.slice(0,2),
        to: currentTargetUci.slice(2,4),
        legal: true,
        score: 100, // high because it's the instructed target
      });
    }

    return candidates;
  } catch (e) {
    return [];
  }
}
