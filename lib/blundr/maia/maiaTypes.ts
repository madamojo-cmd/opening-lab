export type MaiaSkillLevel =
  | "maia-1100"
  | "maia-1200"
  | "maia-1300"
  | "maia-1400"
  | "maia-1500"
  | "maia-1600"
  | "maia-1700"
  | "maia-1800"
  | "maia-1900";

export type MaiaProviderStatus =
  | "ready"
  | "unavailable"
  | "timeout"
  | "error"
  | "disabled"
  | "loading";

export interface MaiaMoveCandidate {
  uci: string;
  san?: string | null;
  from?: string | null;
  to?: string | null;
  humanLikelihood?: number | null;
  rank?: number | null;
  policyScore?: number | null;
  skillLevel?: MaiaSkillLevel | null;
  source: "maia";
}

export interface MaiaOpponentReplyRequest {
  requestId: number;
  fen: string;
  fen4: string;
  sideToMove: "w" | "b";
  skillLevel: MaiaSkillLevel;
  legalMovesUci: string[];
  maxCandidates: number;
  timeoutMs: number;
  continuationSessionId: string | null;
}

export interface MaiaOpponentReplyResult {
  status: MaiaProviderStatus;
  requestId: number;
  fen4: string;
  skillLevel: MaiaSkillLevel;
  candidates: MaiaMoveCandidate[];
  selectedCandidate: MaiaMoveCandidate | null;
  errorReason?: string | null;
  providerMs?: number | null;
  stale?: boolean;
}

export interface MaiaOpponentReplyDecision {
  allowed: boolean;
  reason: string;
  providerUsed: boolean;
  selectedMoveUci: string | null;
  selectedMoveSan: string | null;
  selectedMoveSource: "maia" | "fallback" | "none";
  skillLevel: MaiaSkillLevel | null;
  humanLikelihood: number | null;
  candidateCount: number;
  fallbackReason: string | null;
}

// Legacy contract kept for older package tests.
export interface MaiaContinuationContext {
  provider: "maia";
  status: "not_applicable" | "available" | "unavailable" | "timeout" | "error";
  ratingLevel: number | null;
  fen: string;
  predictedOpponentMove?: {
    uci: string;
    san?: string;
    confidence: number;
  };
  deviationScore?: number;
  humanLikelyMistake?: string;
  provenance: Array<{
    source: "maia";
    confidence: "high" | "medium" | "low";
    note?: string;
  }>;
}
