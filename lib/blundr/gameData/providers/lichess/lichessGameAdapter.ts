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
    const winner = String(input.winner ?? "");
    const status = typeof input.status === "string" ? input.status : null;
    const result =
      winner === "white"
        ? "1-0"
        : winner === "black"
          ? "0-1"
          : status === "draw"
            ? "1/2-1/2"
            : "*";
    if (result === "*") return null;
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
      result,
      terminationReason: status,
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
      metadata: {
        whiteRating:
          typeof players?.white === "object" &&
          typeof (players.white as { rating?: unknown }).rating === "number"
            ? (players.white as { rating: number }).rating
            : null,
        blackRating:
          typeof players?.black === "object" &&
          typeof (players.black as { rating?: unknown }).rating === "number"
            ? (players.black as { rating: number }).rating
            : null,
      },
    };
  } catch {
    return null;
  }
}
