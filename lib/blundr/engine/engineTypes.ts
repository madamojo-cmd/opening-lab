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
}
