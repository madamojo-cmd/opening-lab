import type { RawProviderGame } from "../../gameNormalizer";
import { replayPgn } from "../../pgnReplay";

export function adaptLichessGame(
  ndjson: string,
  username: string,
): RawProviderGame | null {
  try {
    const input = JSON.parse(ndjson) as Record<string, unknown>;
    const players = input.players as
      | {
          white?: { user?: { name?: string }; userId?: string };
          black?: { user?: { name?: string }; userId?: string };
        }
      | undefined;
    const white = players?.white?.user?.name ?? players?.white?.userId ?? "";
    const black = players?.black?.user?.name ?? players?.black?.userId ?? "";
    const pgn = typeof input.pgn === "string" ? input.pgn : "";
    if (!pgn || !white || !black) return null;
    const playerColor =
      white.toLowerCase() === username.trim().toLowerCase() ? "white" : "black";
    const replay = replayPgn(pgn, playerColor);
    const moves = replay.ok ? replay.plies.map((ply) => ply.moveUci) : [];
    return {
      provider: "lichess",
      externalId: typeof input.id === "string" ? input.id : null,
      username,
      white,
      black,
      playedAt: new Date(Number(input.createdAt ?? 0)).toISOString(),
      result:
        String(input.winner ?? "") === "white"
          ? "1-0"
          : String(input.winner ?? "") === "black"
            ? "0-1"
            : "1/2-1/2",
      timeControl:
        typeof input.clock === "object"
          ? JSON.stringify(input.clock)
          : typeof input.speed === "string"
            ? input.speed
            : null,
      rated: typeof input.rated === "boolean" ? input.rated : null,
      variant: typeof input.variant === "string" ? input.variant : "standard",
      pgn,
      moves,
    };
  } catch {
    return null;
  }
}
