import type { RawProviderGame } from "../../gameNormalizer";
import { replayPgn } from "../../pgnReplay";

function pgnHeader(pgn: string, name: string): string {
  const match = pgn.match(new RegExp(`^\\[${name}\\s+"([^"]*)"\\]$`, "im"));
  return match?.[1]?.trim() ?? "";
}

function playerName(value: unknown, fallback: string): string {
  if (typeof value === "string") return value.trim();
  if (value && typeof value === "object") {
    const username = (value as { username?: unknown }).username;
    if (typeof username === "string") return username.trim();
  }
  return fallback;
}

function playerResult(value: unknown): string {
  if (!value || typeof value !== "object") return "";
  const result = (value as { result?: unknown }).result;
  return typeof result === "string" ? result.trim().toLowerCase() : "";
}

function chessComResult(input: Record<string, unknown>, pgn: string): string {
  const whiteResult = playerResult(input.white);
  const blackResult = playerResult(input.black);
  const pgnResult = pgnHeader(pgn, "Result");
  if (pgnResult && pgnResult !== "*") return pgnResult;
  if (whiteResult === "win") return "1-0";
  if (blackResult === "win") return "0-1";
  if (
    whiteResult &&
    blackResult &&
    [
      "agreed",
      "repetition",
      "stalemate",
      "insufficient",
      "50move",
      "timevsinsufficient",
    ].includes(whiteResult)
  )
    return "1/2-1/2";
  return "*";
}

export function adaptChessComGame(
  input: Record<string, unknown>,
  username: string,
): RawProviderGame | null {
  const pgn = typeof input.pgn === "string" ? input.pgn : "";
  const white = playerName(input.white, pgnHeader(pgn, "White"));
  const black = playerName(input.black, pgnHeader(pgn, "Black"));
  const result = chessComResult(input, pgn);
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
    terminationReason:
      pgnHeader(pgn, "Termination") ||
      [
        playerResult(input.white) ? `white:${playerResult(input.white)}` : "",
        playerResult(input.black) ? `black:${playerResult(input.black)}` : "",
      ]
        .filter(Boolean)
        .join(",") ||
      null,
    timeControl:
      typeof input.time_control === "string" ? input.time_control : null,
    rated: typeof input.rated === "boolean" ? input.rated : null,
    variant:
      typeof input.rules === "string" && input.rules.toLowerCase() !== "chess"
        ? input.rules
        : "standard",
    pgn,
    moves,
    metadata: {
      whiteRating:
        typeof (input.white as { rating?: unknown } | null)?.rating === "number"
          ? (input.white as { rating: number }).rating
          : null,
      blackRating:
        typeof (input.black as { rating?: unknown } | null)?.rating === "number"
          ? (input.black as { rating: number }).rating
          : null,
    },
  };
}
