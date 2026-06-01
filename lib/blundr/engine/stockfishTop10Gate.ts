/**
 * stockfishTop10Gate.ts
 * v2.7.42 Stockfish Top-10 Evidence Gate (Stabilization Checkpoint)
 *
 * Provides evidence only. Never overrides CurrentInstructionFrame.target.
 * Used strictly for claim permission gating and debug observability.
 */

import { getStockfishTopMovesForValidation } from "./stockfishValidation";

export interface StockfishTop10GateResult {
  provider: "stockfish";
  fen: string;
  targetUci: string;
  available: boolean;
  depth: number | null;
  timeMs: number | null;
  topMoves: Array<{
    rank: number;
    uci: string;
    san?: string;
    cp?: number;
    mate?: number;
    pv?: string[];
  }>;
  targetInTop10: boolean;
  targetRank: number | null;
  targetEval?: {
    cp?: number;
    mate?: number;
  };
  agreement:
    | "target_top1"
    | "target_top3"
    | "target_top10"
    | "target_not_top10"
    | "engine_unavailable"
    | "engine_timeout"
    | "not_applicable";
  claimPermissions: {
    maySayBest: boolean;
    maySayStrong: boolean;
    maySayEngineBacked: boolean;
    maySayTactical: boolean;
    maySayWinsMaterial: boolean;
    maySayForced: boolean;
    maySayMate: boolean;
  };
  blockedCoachClaims: string[];
  provenance: Array<{
    source: "stockfish";
    detail: string;
  }>;
}

export async function getStockfishTop10Evidence(
  fen: string,
  targetUci: string,
  options: { depth?: number; timeoutMs?: number } = {}
): Promise<StockfishTop10GateResult> {
  const start = performance.now();

  try {
    // Request top 10 (MultiPV=10)
    const engineLines = await getStockfishTopMovesForValidation({
      fen,
      multipv: 10,
      depth: options.depth ?? 14,
      timeoutMs: options.timeoutMs ?? 1800,
    });

    const timeMs = Math.round(performance.now() - start);

    if (!engineLines || engineLines.length === 0) {
      return createUnavailableResult(fen, targetUci, "engine_unavailable", timeMs);
    }

    const topMoves = engineLines.slice(0, 10).map((line: any, index: number) => ({
      rank: index + 1,
      uci: (line.uci || "").toLowerCase(),
      san: line.san,
      cp: typeof line.scoreCp === "number" ? line.scoreCp : undefined,
      mate: typeof line.mate === "number" ? line.mate : undefined,
      pv: line.pv,
    }));

    const targetLower = targetUci.toLowerCase();
    const targetEntry = topMoves.find((m) => m.uci === targetLower);
    const targetRank = targetEntry ? targetEntry.rank : null;
    const targetInTop10 = targetRank !== null && targetRank <= 10;

    let agreement: StockfishTop10GateResult["agreement"] = "target_not_top10";
    if (targetRank === 1) agreement = "target_top1";
    else if (targetRank && targetRank <= 3) agreement = "target_top3";
    else if (targetInTop10) agreement = "target_top10";

    const claimPermissions = computeClaimPermissions(targetRank, targetInTop10, agreement);

    const blockedCoachClaims: string[] = [];
    if (!claimPermissions.maySayBest) blockedCoachClaims.push("best", "top1");
    if (!claimPermissions.maySayStrong) blockedCoachClaims.push("strongest", "top_move");
    if (!claimPermissions.maySayEngineBacked) blockedCoachClaims.push("engine_backed", "engine_approved");
    if (!claimPermissions.maySayWinsMaterial) blockedCoachClaims.push("wins_material", "winning");
    if (!claimPermissions.maySayForced) blockedCoachClaims.push("forced", "only_move");
    if (!claimPermissions.maySayMate) blockedCoachClaims.push("mate", "checkmate");

    return {
      provider: "stockfish",
      fen,
      targetUci,
      available: true,
      depth: options.depth ?? 14,
      timeMs,
      topMoves,
      targetInTop10,
      targetRank,
      targetEval: targetEntry ? { cp: targetEntry.cp, mate: targetEntry.mate } : undefined,
      agreement,
      claimPermissions,
      blockedCoachClaims,
      provenance: [{ source: "stockfish", detail: `top10_multipv depth=${options.depth ?? 14}` }],
    };
  } catch (err) {
    const timeMs = Math.round(performance.now() - start);
    const reason = (err as Error)?.message?.toLowerCase().includes("timeout") ? "engine_timeout" : "engine_unavailable";
    return createUnavailableResult(fen, targetUci, reason, timeMs);
  }
}

function createUnavailableResult(
  fen: string,
  targetUci: string,
  agreement: StockfishTop10GateResult["agreement"],
  timeMs: number
): StockfishTop10GateResult {
  return {
    provider: "stockfish",
    fen,
    targetUci,
    available: false,
    depth: null,
    timeMs,
    topMoves: [],
    targetInTop10: false,
    targetRank: null,
    agreement,
    claimPermissions: {
      maySayBest: false,
      maySayStrong: false,
      maySayEngineBacked: false,
      maySayTactical: false,
      maySayWinsMaterial: false,
      maySayForced: false,
      maySayMate: false,
    },
    blockedCoachClaims: ["best", "strongest", "engine_backed", "winning", "forced", "only_move", "mate"],
    provenance: [{ source: "stockfish", detail: agreement }],
  };
}

function computeClaimPermissions(
  targetRank: number | null,
  targetInTop10: boolean,
  agreement: StockfishTop10GateResult["agreement"]
) {
  if (!targetInTop10 || agreement === "engine_unavailable" || agreement === "engine_timeout") {
    return {
      maySayBest: false,
      maySayStrong: false,
      maySayEngineBacked: false,
      maySayTactical: false,
      maySayWinsMaterial: false,
      maySayForced: false,
      maySayMate: false,
    };
  }

  return {
    maySayBest: targetRank === 1,
    maySayStrong: targetRank !== null && targetRank <= 3,
    maySayEngineBacked: true,
    maySayTactical: true,
    maySayWinsMaterial: targetRank !== null && targetRank <= 5, // conservative
    maySayForced: targetRank !== null && targetRank <= 3,
    maySayMate: targetRank !== null && targetRank <= 3,
  };
}
