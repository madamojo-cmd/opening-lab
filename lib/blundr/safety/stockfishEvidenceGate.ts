/**
 * stockfishEvidenceGate.ts
 * v2.7.42 - Consumes StockfishTop10GateResult and enforces claim restrictions.
 */

import type { StockfishTop10GateResult } from "../engine/stockfishTop10Gate";

export function applyStockfishEvidenceRestrictions(
  result: StockfishTop10GateResult | null
): {
  claimPermissions: StockfishTop10GateResult["claimPermissions"];
  blockedClaims: string[];
} {
  if (!result || !result.available) {
    return {
      claimPermissions: {
        maySayBest: false,
        maySayStrong: false,
        maySayEngineBacked: false,
        maySayTactical: false,
        maySayWinsMaterial: false,
        maySayForced: false,
        maySayMate: false,
      },
      blockedClaims: ["best", "strongest", "engine_backed", "winning", "forced", "only_move", "mate"],
    };
  }

  return {
    claimPermissions: result.claimPermissions,
    blockedClaims: result.blockedCoachClaims,
  };
}
