import type { RawProviderGame } from "../../gameNormalizer";
import { replayPgn } from "../../pgnReplay";

export function adaptChessComGame(
  input: Record<string, unknown>,
  username: string,
): RawProviderGame | null {
  const pgn = typeof input.pgn === "string" ? input.pgn : "";
  const white = String(input.white?.toString() ?? "").trim();
  const black = String(input.black?.toString() ?? "").trim();
  const result = String(input.result ?? "*");
  if (!pgn || !white || !black) return null;
  const playerColor =
    white.toLowerCase() === username.trim().toLowerCase() ? "white" : "black";
  const replay = replayPgn(pgn, playerColor);
  const moves = replay.ok ? replay.plies.map((ply) => ply.moveUci) : [];
  const rawPlayedAt = input.end_time ?? input.start_time;
  const playedAt =
    typeof rawPlayedAt === "number"
      ? new Date(rawPlayedAt * 1000).toISOString()
      : String(rawPlayedAt ?? new Date(0).toISOString());
  return {
    provider: "chesscom",
    externalId:
      typeof input.url === "string"
        ? input.url
        : typeof input.uuid === "string"
          ? input.uuid
          : null,
    username,
    white,
    black,
    playedAt,
    result,
    timeControl:
      typeof input.time_control === "string" ? input.time_control : null,
    rated: typeof input.rated === "boolean" ? input.rated : null,
    variant: typeof input.rules === "string" ? input.rules : "standard",
    pgn,
    moves,
  };
}
