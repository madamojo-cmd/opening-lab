export type MoveQualityStatus =
  | "idle"
  | "pending"
  | "verified_top1"
  | "verified_top2"
  | "rejected"
  | "unavailable";

export type MoveQualityEngineLine = {
  rank: number;
  uci: string;
  san?: string;
  scoreCp?: number;
  mate?: number;
  pv?: string[];
};

export type MoveQualityResult = {
  status: MoveQualityStatus;
  fen: string;
  expectedMovesUci: string[];
  selectedMoveUci?: string;
  selectedMoveSan?: string;
  selectedRank?: 1 | 2;
  topMoves: MoveQualityEngineLine[];
  reason: string;
  checkedAt: number;
};

export const MOVE_QUALITY_GATE_VERSION = "2.7.32";
export const MOVE_QUALITY_TOP_N = 2;
export const MOVE_QUALITY_TIMEOUT_MS = 5000;
export const MOVE_QUALITY_TARGET_DEPTH = 10;

export function normalizeUci(value: unknown): string {
  return typeof value === "string"
    ? value.trim().toLowerCase().replace(/\s+/g, "")
    : "";
}

export function buildMoveQualityCacheKey(input: {
  fen: string;
  expectedMovesUci: string[];
}): string {
  const expected = input.expectedMovesUci
    .map(normalizeUci)
    .filter(Boolean)
    .sort()
    .join(",");

  return `${input.fen}::${expected}`;
}

export function evaluateTopTwoMatch(input: {
  fen: string;
  expectedMoves: Array<{ uci: string; san?: string }>;
  topMoves: MoveQualityEngineLine[];
}): MoveQualityResult {
  const expected = input.expectedMoves
    .map((move) => ({
      uci: normalizeUci(move.uci),
      san: move.san,
    }))
    .filter((move) => move.uci);

  const expectedSet = new Set(expected.map((move) => move.uci));

  const topTwo = input.topMoves
    .filter((line) => line.rank <= MOVE_QUALITY_TOP_N)
    .map((line) => ({
      ...line,
      uci: normalizeUci(line.uci),
    }));

  const match = topTwo.find((line) => expectedSet.has(line.uci));

  if (!expected.length) {
    return {
      status: "unavailable",
      fen: input.fen,
      expectedMovesUci: [],
      topMoves: input.topMoves,
      reason: "No expected training move was available for validation.",
      checkedAt: Date.now(),
    };
  }

  if (!topTwo.length) {
    return {
      status: "unavailable",
      fen: input.fen,
      expectedMovesUci: expected.map((move) => move.uci),
      topMoves: input.topMoves,
      reason: "Stockfish did not return top-two candidate moves.",
      checkedAt: Date.now(),
    };
  }

  if (match) {
    const expectedMatch = expected.find((move) => move.uci === match.uci);

    return {
      status: match.rank === 1 ? "verified_top1" : "verified_top2",
      fen: input.fen,
      expectedMovesUci: expected.map((move) => move.uci),
      selectedMoveUci: match.uci,
      selectedMoveSan: expectedMatch?.san,
      selectedRank: match.rank === 1 ? 1 : 2,
      topMoves: input.topMoves,
      reason:
        match.rank === 1
          ? "Expected move matched Stockfish's top move."
          : "Expected move matched Stockfish's second choice.",
      checkedAt: Date.now(),
    };
  }

  return {
    status: "rejected",
    fen: input.fen,
    expectedMovesUci: expected.map((move) => move.uci),
    topMoves: input.topMoves,
    reason: "Expected training move did not match Stockfish's top two moves.",
    checkedAt: Date.now(),
  };
}
