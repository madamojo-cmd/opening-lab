import type { StockfishTop10GateResult } from "./engineTypes";

function getPermissions(agreement: StockfishTop10GateResult["agreement"]): StockfishTop10GateResult["claimPermissions"] {
  if (agreement === "target_top1") {
    return {
      maySayBest: true,
      maySayStrong: true,
      maySayEngineBacked: true,
      maySayTactical: true,
      maySayWinsMaterial: true,
      maySayForced: true,
      maySayMate: true,
    };
  }
  if (agreement === "target_top3") {
    return {
      maySayBest: false,
      maySayStrong: true,
      maySayEngineBacked: true,
      maySayTactical: true,
      maySayWinsMaterial: true,
      maySayForced: false,
      maySayMate: false,
    };
  }
  if (agreement === "target_top10") {
    return {
      maySayBest: false,
      maySayStrong: false,
      maySayEngineBacked: true,
      maySayTactical: false,
      maySayWinsMaterial: false,
      maySayForced: false,
      maySayMate: false,
    };
  }
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

function normalizeRank(
  agreement: StockfishTop10GateResult["agreement"],
  targetRank: number | null | undefined,
): number | null {
  if (agreement === "target_top1") return 1;
  if (agreement === "target_top3") return targetRank && targetRank > 0 ? Math.min(targetRank, 3) : 2;
  if (agreement === "target_top10") return targetRank && targetRank > 0 ? Math.min(targetRank, 10) : 7;
  if (agreement === "target_not_top10") return null;
  return null;
}

export function createMockStockfishTop10GateResult(input: {
  fen: string;
  targetUci: string;
  agreement?: StockfishTop10GateResult["agreement"];
  targetRank?: number | null;
}): StockfishTop10GateResult {
  const agreement = input.agreement ?? "not_applicable";
  const rank = normalizeRank(agreement, input.targetRank);
  const available = !["engine_unavailable", "engine_timeout", "not_applicable"].includes(agreement);

  return {
    provider: "stockfish",
    fen: input.fen,
    targetUci: input.targetUci,
    available,
    depth: available ? 14 : null,
    timeMs: available ? 120 : null,
    topMoves:
      available && rank
        ? [
            {
              rank,
              uci: input.targetUci,
              cp: 24,
            },
          ]
        : [],
    targetInTop10: typeof rank === "number" && rank >= 1 && rank <= 10,
    targetRank: rank,
    agreement,
    claimPermissions: getPermissions(agreement),
    blockedCoachClaims:
      agreement === "target_not_top10" || agreement === "engine_unavailable" || agreement === "engine_timeout" || agreement === "not_applicable"
        ? ["engine_best", "engine_strong", "engine_backed"]
        : [],
  };
}
