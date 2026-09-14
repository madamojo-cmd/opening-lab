import { Chess } from "chess.js";
import {
  canonicalPositionFenFromChess,
  classifyChessRuleState,
} from "@/lib/blundr/chess/canonicalPosition";
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
  const positionCounts = new Map<string, number>();
  const initialCanonical = canonicalPositionFenFromChess(replay);
  positionCounts.set(initialCanonical, 1);
  for (const [index, move] of history.entries()) {
    const fenBefore = replay.fen();
    const canonicalFenBefore = canonicalPositionFenFromChess(replay);
    const sideToMove = replay.turn() === "w" ? "white" : "black";
    try {
      const applied = replay.move({
        from: move.from,
        to: move.to,
        promotion: move.promotion,
      });
      const fenAfter = replay.fen();
      const canonicalFenAfter = canonicalPositionFenFromChess(replay);
      positionCounts.set(
        canonicalFenAfter,
        (positionCounts.get(canonicalFenAfter) ?? 0) + 1,
      );
      const ruleStateAfter = classifyChessRuleState(replay, positionCounts);
      plies.push({
        ply: index + 1,
        fenBefore,
        canonicalFenBefore,
        fenAfter,
        canonicalFenAfter,
        moveUci: moveUci(move),
        moveSan: applied.san,
        sideToMove,
        isPlayerMove: sideToMove === playerColor,
        ruleStateAfter,
      });
      if (ruleStateAfter.terminal) break;
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
