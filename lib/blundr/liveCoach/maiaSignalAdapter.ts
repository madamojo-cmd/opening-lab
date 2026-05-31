import type { MaiaSignalSet } from "./liveCoachTypes";

export type MaiaRaw = {
  move_probs?: Record<string, number>;
  win_prob?: number;
};

function normalizeProbs(input: Record<string, number>): Record<string, number> {
  const entries = Object.entries(input).filter(([, value]) => Number.isFinite(value) && value > 0);
  const total = entries.reduce((sum, [, value]) => sum + value, 0);
  if (total <= 0) return {};
  return Object.fromEntries(entries.map(([move, value]) => [move, value / total]));
}

function entropy(probs: number[]): number {
  return probs.reduce((sum, p) => (p > 0 ? sum - p * Math.log2(p) : sum), 0);
}

export function adaptMaiaSignals(input: {
  raw?: MaiaRaw | null;
  userElo: number;
  opponentElo: number;
  source?: "maia2" | "mock" | "none";
}): MaiaSignalSet {
  if (!input.raw?.move_probs || !Object.keys(input.raw.move_probs).length) {
    return {
      status: "unavailable",
      source: "none",
      userElo: input.userElo,
      opponentElo: input.opponentElo,
      topMoves: [],
      moveProbabilities: {},
      entropy: 0,
      topMoveProbability: 0,
      humanConsensus: "low",
      skillGradients: [],
    };
  }

  const moveProbabilities = normalizeProbs(input.raw.move_probs);
  const topMoves = Object.entries(moveProbabilities)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([moveUci, probability], index) => ({ moveUci, probability, rank: index + 1 }));
  const topMoveProbability = topMoves[0]?.probability ?? 0;
  const signalEntropy = entropy(Object.values(moveProbabilities));
  const humanConsensus: MaiaSignalSet["humanConsensus"] = topMoveProbability >= 0.35 || signalEntropy < 1.8 ? "high" : topMoveProbability >= 0.18 ? "medium" : "low";

  return {
    status: "available",
    source: input.source ?? "maia2",
    userElo: input.userElo,
    opponentElo: input.opponentElo,
    topMoves,
    moveProbabilities,
    winProbability: input.raw.win_prob,
    entropy: signalEntropy,
    topMoveProbability,
    humanConsensus,
    skillGradients: [],
  };
}
