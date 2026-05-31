/**
 * validateCandidateWithStockfish - Production Stockfish Validation (Step 5+)
 * Per Brain V2 Production Spec.
 * Leverages existing stockfishValidation during transition.
 */

import type { StockfishValidation } from "../types";
import { getStockfishTopMovesForValidation } from "../../engine/stockfishValidation";

export async function validateCandidateWithStockfish(
  fen: string,
  candidateUci: string,
  depth: number = 12
): Promise<StockfishValidation> {
  try {
    const engineLines = await getStockfishTopMovesForValidation({ fen }); // Use existing helper (simplified call for now)

    const selected = engineLines.find((l: any) => l.uci === candidateUci);
    const top = engineLines[0];

    let safety: StockfishValidation["safety"] = "uncertain";
    if (selected) {
      // Simplified safety logic until full MoveQualityEngineLine shape is aligned
      const evalDiff = 0; // Placeholder
      if (selected.uci === top?.uci) safety = "engine_best";
      else safety = "top_tier";
    }

    return {
      fen,
      depth,
      multiPv: 5,
      engineTopMoves: engineLines,
      selectedMove: selected,
      safety,
      validatedClaims: [],
      blockedClaims: [],
      validatedAt: new Date().toISOString(),
    };
  } catch (e) {
    return {
      fen,
      depth: 0,
      multiPv: 0,
      engineTopMoves: [],
      safety: "unknown",
      validatedClaims: [],
      blockedClaims: [],
      validatedAt: new Date().toISOString(),
    };
  }
}
