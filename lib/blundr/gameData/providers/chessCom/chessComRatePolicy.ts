export type RetryDecision = {
  retry: boolean;
  delayMs: number;
  errorCode:
    | "rate_limited"
    | "provider_unavailable"
    | "network_timeout"
    | "unknown";
};

export function chessComRetryDecision(
  status: number | "timeout" | "network",
  attempt: number,
  random = Math.random,
): RetryDecision {
  if (status === 429)
    return {
      retry: attempt < 5,
      delayMs: 1000 + Math.floor(random() * 1500),
      errorCode: "rate_limited",
    };
  if (status === "timeout" || status === "network" || status >= 500)
    return {
      retry: attempt < 4,
      delayMs:
        Math.min(30_000, 500 * 2 ** attempt) + Math.floor(random() * 500),
      errorCode:
        status === "timeout" ? "network_timeout" : "provider_unavailable",
    };
  return { retry: false, delayMs: 0, errorCode: "unknown" };
}

export function chessComHeaders(
  etag?: string | null,
  lastModified?: string | null,
): Record<string, string> {
  return {
    Accept: "application/json",
    "User-Agent": "Blundr/2.10 game-data-import (+https://blundr.app)",
    ...(etag ? { "If-None-Match": etag } : {}),
    ...(lastModified ? { "If-Modified-Since": lastModified } : {}),
  };
}
