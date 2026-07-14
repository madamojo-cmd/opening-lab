export function lichessRetryDelay(
  status: number | "network" | "timeout",
  attempt: number,
  random = Math.random,
): number | null {
  if (
    status === 429 ||
    status === "network" ||
    status === "timeout" ||
    status >= 500
  ) {
    return Math.min(30_000, 500 * 2 ** attempt) + Math.floor(random() * 500);
  }
  return null;
}

export const LICHESS_HEADERS = {
  Accept: "application/x-ndjson",
  "User-Agent": "Blundr/2.10 game-data-import (+https://blundr.app)",
};
