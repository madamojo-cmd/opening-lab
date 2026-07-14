import { Chess } from "chess.js";
import type { ReplayedPly } from "./gameDataTypes";

export type PgnReplayResult =
  | {
      ok: true;
      plies: readonly ReplayedPly[];
      finalFen: string;
    }
  | {
      ok: false;
      reason: "malformed_pgn" | "illegal_move" | "unsupported_variant";
    };

function moveUci(move: {
  from: string;
  to: string;
  promotion?: string;
}): string {
  return `${move.from}${move.to}${move.promotion ?? ""}`;
}

export function replayPgn(
  pgn: string,
  playerColor: "white" | "black",
): PgnReplayResult {
  const chess = new Chess();
  try {
    chess.loadPgn(pgn, { strict: false });
  } catch {
    return { ok: false, reason: "malformed_pgn" };
  }
  const history = chess.history({ verbose: true });
  if (history.length === 0 && pgn.trim()) {
    return { ok: false, reason: "malformed_pgn" };
  }
  const replay = new Chess();
  const plies: ReplayedPly[] = [];
  for (const [index, move] of history.entries()) {
    const fenBefore = replay.fen();
    const sideToMove = replay.turn() === "w" ? "white" : "black";
    try {
      const applied = replay.move({
        from: move.from,
        to: move.to,
        promotion: move.promotion,
      });
      plies.push({
        ply: index + 1,
        fenBefore,
        moveUci: moveUci(move),
        moveSan: applied.san,
        sideToMove,
        isPlayerMove: sideToMove === playerColor,
      });
    } catch {
      return { ok: false, reason: "illegal_move" };
    }
  }
  return { ok: true, plies, finalFen: replay.fen() };
}

export function isCompletedStandardGame(input: {
  result: string;
  variant?: string | null;
  termination?: string | null;
  moves?: readonly string[] | null;
}): boolean {
  return (
    ["1-0", "0-1", "1/2-1/2"].includes(input.result) &&
    (!input.variant || input.variant.toLowerCase() === "standard") &&
    Boolean(input.moves?.length)
  );
}
