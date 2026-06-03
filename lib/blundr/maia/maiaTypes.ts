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
