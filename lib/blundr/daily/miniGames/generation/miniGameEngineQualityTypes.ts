export type MiniGameEngineName = "stockfish" | "none";

export type MiniGameEngineMode = "strict" | "balanced" | "strategic_sanity";

export type MiniGameEngineVerdict =
  | "pass"
  | "soft_pass"
  | "reject_blunder"
  | "reject_not_top_enough"
  | "reject_bad_explanation"
  | "reject_unstable_eval"
  | "skip_not_required";

export type MiniGameEngineScore = {
  cp?: number;
  mate?: number;
};

export type MiniGameEngineTopMove = {
  moveUci: string;
  rank: number;
  cp?: number;
  mate?: number;
  san?: string;
};

export type MiniGameEngineAnalysis = {
  fen: string;
  sideToMove: "w" | "b";
  depth: number;
  multipv: number;
  providerStatus: "ready" | "loading" | "unavailable" | "error";
  topMoves: MiniGameEngineTopMove[];
  bestMoveUci: string | null;
  bestMoveSan: string | null;
};

export type MiniGameEngineQuality = {
  adjudicated: boolean;
  engine: MiniGameEngineName;
  depth: number;
  multipv: number;
  sideToMove: "w" | "b";
  primaryMoveUci: string;
  primaryMoveRank?: number;
  primaryMoveCentipawnLoss?: number;
  beforeEval?: MiniGameEngineScore;
  afterEval?: MiniGameEngineScore;
  bestMoveUci?: string;
  topMoves?: MiniGameEngineTopMove[];
  verdict: MiniGameEngineVerdict;
  notes: string[];
};

export type MiniGameEngineThresholds = {
  mode: MiniGameEngineMode;
  depth: number;
  multipv: number;
  strictTopRanks: readonly number[];
  softTopRanks: readonly number[];
  maxCentipawnLoss: number;
  hardRejectCentipawnLoss: number;
  requirePreservedResult: boolean;
  requireMateSafety: boolean;
};

export type MiniGameEngineCandidateDescriptor = {
  miniGameId: string;
  source: "daily_deck" | "standalone_review";
  family: string;
  motif?: string;
  fen: string;
  sideToMove: "w" | "b";
  primaryMoveUci: string;
  acceptedMoves: readonly string[];
  targetSquares?: readonly string[];
  orientation: "white" | "black";
};

export type MiniGameEngineAdjudicationResult = {
  candidateKey: string;
  scenarioKey: string;
  engineQuality: MiniGameEngineQuality;
  analysis: MiniGameEngineAnalysis | null;
  accepted: boolean;
  rejectionReason: string | null;
  notes: string[];
  usedFallback: boolean;
  scenario: unknown | null;
};

export function isMiniGameEngineVerdict(value: unknown): value is MiniGameEngineVerdict {
  return (
    value === "pass" ||
    value === "soft_pass" ||
    value === "reject_blunder" ||
    value === "reject_not_top_enough" ||
    value === "reject_bad_explanation" ||
    value === "reject_unstable_eval" ||
    value === "skip_not_required"
  );
}

export function normalizeMiniGameEngineScore(score: MiniGameEngineScore | null | undefined): MiniGameEngineScore | null {
  if (!score) return null;
  const cp = Number.isFinite(score.cp as number) ? Number(score.cp) : undefined;
  const mate = Number.isFinite(score.mate as number) ? Number(score.mate) : undefined;
  if (typeof cp !== "number" && typeof mate !== "number") {
    return null;
  }
  return {
    ...(typeof cp === "number" ? { cp } : {}),
    ...(typeof mate === "number" ? { mate } : {}),
  };
}
