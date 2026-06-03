import type { MaiaContinuationContext } from "./maiaTypes";

export function createMockMaiaContinuationContext(input: {
  fen: string;
  forContinuation?: boolean;
  status?: MaiaContinuationContext["status"];
  ratingLevel?: number | null;
  predictedOpponentMove?: MaiaContinuationContext["predictedOpponentMove"];
}): MaiaContinuationContext {
  if (!input.forContinuation) {
    return {
      provider: "maia",
      status: "not_applicable",
      ratingLevel: null,
      fen: input.fen,
      provenance: [],
    };
  }

  const status = input.status ?? "available";
  return {
    provider: "maia",
    status,
    ratingLevel: input.ratingLevel ?? 1800,
    fen: input.fen,
    predictedOpponentMove: status === "available" ? input.predictedOpponentMove : undefined,
    provenance:
      status === "available"
        ? [
            {
              source: "maia",
              confidence: "medium",
              note: "deterministic mock",
            },
          ]
        : [],
  };
}
