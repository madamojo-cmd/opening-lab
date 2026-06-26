import type { MaiaProvider } from "./maiaProvider";
import type { MaiaOpponentReplyRequest, MaiaOpponentReplyResult } from "./maiaTypes";

function timeoutFetch<T>(url: string, init: RequestInit, timeoutMs: number): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Math.max(100, timeoutMs));
  return fetch(url, { ...init, signal: controller.signal })
    .then(async (response) => {
      const json = await response.json();
      return json as T;
    })
    .finally(() => clearTimeout(timer));
}

export class MaiaApiClientProvider implements MaiaProvider {
  readonly name = "maia-api-client";
  readonly version = "14B";

  isAvailable(): boolean {
    return true;
  }

  async getOpponentReplies(request: MaiaOpponentReplyRequest): Promise<MaiaOpponentReplyResult> {
    try {
      const payload = {
        requestId: request.requestId,
        fen: request.fen,
        fen4: request.fen4,
        legalMovesUci: request.legalMovesUci,
        skillLevel: request.skillLevel,
        timeoutMs: request.timeoutMs,
        ratingBandId: request.ratingBandId ?? null,
        requestedRating: request.requestedRating ?? null,
      };
      const result = await timeoutFetch<MaiaOpponentReplyResult>(
        "/api/maia/opponent-reply",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
        request.timeoutMs,
      );
      return {
        ...result,
        requestId: request.requestId,
        fen4: request.fen4,
        skillLevel: request.skillLevel,
      };
    } catch (error) {
      const timedOut = error instanceof Error && error.name === "AbortError";
      return {
        status: timedOut ? "timeout" : "unavailable",
        requestId: request.requestId,
        fen4: request.fen4,
        skillLevel: request.skillLevel,
        candidates: [],
        selectedCandidate: null,
        errorReason: timedOut ? "provider_timeout" : "provider_unavailable",
        providerMs: null,
      };
    }
  }
}
