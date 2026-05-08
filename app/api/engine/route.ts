import { NextRequest, NextResponse } from "next/server";
import { Chess } from "chess.js";

export const dynamic = "force-dynamic";

type VerboseMove = {
  color: "w" | "b";
  from: string;
  to: string;
  piece: string;
  captured?: string;
  promotion?: string;
  flags?: string;
  san: string;
};

const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 0,
};

const CENTER = new Set(["d4", "e4", "d5", "e5"]);
const NEAR_CENTER = new Set(["c3", "d3", "e3", "f3", "c4", "f4", "c5", "f5", "c6", "d6", "e6", "f6"]);

function moveToUci(move: { from: string; to: string; promotion?: string }) {
  return `${move.from}${move.to}${move.promotion ?? ""}`;
}

function scoreMove(fen: string, move: VerboseMove) {
  let score = 10;

  if (move.captured) {
    score += (PIECE_VALUES[move.captured] ?? 0) - Math.floor((PIECE_VALUES[move.piece] ?? 0) * 0.08);
  }

  if (move.promotion) score += PIECE_VALUES[move.promotion] ?? 800;
  if (move.flags?.includes("k") || move.flags?.includes("q")) score += 65;
  if (CENTER.has(move.to)) score += 45;
  if (NEAR_CENTER.has(move.to)) score += 20;
  if ((move.piece === "n" || move.piece === "b") && (move.from[1] === "1" || move.from[1] === "8")) score += 35;
  if (move.piece === "q") score -= 12;
  if (move.piece === "k" && !(move.flags?.includes("k") || move.flags?.includes("q"))) score -= 25;

  try {
    const after = new Chess(fen);
    after.move({
      from: move.from,
      to: move.to,
      promotion: move.promotion ?? "q",
    });

    if (after.isCheckmate()) score += 100000;
    else if (after.isCheck()) score += 80;

    const opponentLegalMoves = after.moves();
    if (opponentLegalMoves.length < 8) score += 12;
  } catch {
    // Ignore simulation errors; the move came from chess.js legal moves.
  }

  // Slight deterministic jitter so equivalent moves do not always tie.
  score += (move.from.charCodeAt(0) + move.to.charCodeAt(0) + move.to.charCodeAt(1)) % 13;

  return score;
}

function localContinuation(fen: string, multiPv: number, reason: string) {
  try {
    const game = new Chess(fen);
    const moves = game.moves({ verbose: true }) as VerboseMove[];

    const ranked = moves
      .map((move) => ({
        move,
        score: scoreMove(fen, move),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.max(1, multiPv));

    return NextResponse.json({
      source: "local-heuristic-continuation",
      fallback: true,
      reason,
      fen,
      depth: 1,
      fetchedAt: new Date().toISOString(),
      pvs: ranked.map((item) => ({
        line: moveToUci(item.move),
        cp: item.score,
        san: item.move.san,
        note: "Local heuristic continuation. Replace with dedicated Stockfish for production-strength analysis.",
      })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        source: "local-heuristic-continuation",
        fallback: true,
        error: "Could not generate legal fallback continuation",
        details: error instanceof Error ? error.message : String(error),
        pvs: [],
      },
      { status: 200 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const fen = searchParams.get("fen");
  if (!fen) {
    return NextResponse.json({ error: "Missing fen query parameter" }, { status: 400 });
  }

  const multiPv = Math.max(1, Math.min(Number(searchParams.get("multiPv") ?? "3") || 3, 5));

  const url = new URL("https://lichess.org/api/cloud-eval");
  url.searchParams.set("fen", fen);
  url.searchParams.set("multiPv", String(multiPv));

  try {
    const response = await fetch(url.toString(), {
      headers: {
        accept: "application/json",
        "user-agent": "OpeningLabTrainer/0.7 contact: local-development",
      },
      next: {
        revalidate: 60 * 60 * 24,
      },
    });

    // Lichess cloud eval can legitimately return 404 when a position is not in the
    // cloud evaluation database. That should not break training, so we return a
    // local legal continuation instead of surfacing an error to the UI.
    if (response.status === 404) {
      return localContinuation(fen, multiPv, "Lichess cloud eval had no stored evaluation for this position.");
    }

    if (response.status === 429) {
      return localContinuation(fen, multiPv, "Lichess cloud eval rate-limited this request.");
    }

    if (!response.ok) {
      return localContinuation(fen, multiPv, `Lichess cloud eval returned status ${response.status}.`);
    }

    const data = await response.json();

    if (!Array.isArray(data?.pvs) || data.pvs.length === 0) {
      return localContinuation(fen, multiPv, "Lichess cloud eval returned no principal variations.");
    }

    return NextResponse.json({
      source: "lichess-cloud-eval",
      fallback: false,
      fen,
      fetchedAt: new Date().toISOString(),
      ...data,
    });
  } catch (error) {
    return localContinuation(
      fen,
      multiPv,
      error instanceof Error ? `Could not reach Lichess cloud eval: ${error.message}` : "Could not reach Lichess cloud eval."
    );
  }
}
