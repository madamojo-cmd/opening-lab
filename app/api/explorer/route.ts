import { NextRequest, NextResponse } from "next/server";
import { Chess } from "chess.js";

export const dynamic = "force-dynamic";

type ExplorerSource = "lichess" | "masters";
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

const VALID_RATINGS = new Set(["1000", "1200", "1400", "1600", "1800", "2000", "2200", "2500"]);
const VALID_SPEEDS = new Set(["bullet", "blitz", "rapid", "classical", "correspondence"]);
const CENTER = new Set(["d4", "e4", "d5", "e5"]);
const NEAR_CENTER = new Set(["c3", "d3", "e3", "f3", "c4", "f4", "c5", "f5", "c6", "d6", "e6", "f6"]);
const PIECE_VALUES: Record<string, number> = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };

function cleanCsv(value: string | null, fallback: string, valid?: Set<string>) {
  const cleaned = (value ?? fallback)
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => !valid || valid.has(part));

  return cleaned.length ? cleaned.join(",") : fallback;
}

function cleanRatings(value: string | null, fallback = "1000") {
  // Lichess Explorer uses fixed rating buckets. Beginner modes below 1000
  // are simulated in our UI but must query the lowest supported bucket.
  return cleanCsv(value, fallback, VALID_RATINGS);
}

function moveToUci(move: { from: string; to: string; promotion?: string }) {
  return `${move.from}${move.to}${move.promotion ?? ""}`;
}

function scoreMove(fen: string, move: VerboseMove) {
  let score = 1000;

  if (move.captured) score += (PIECE_VALUES[move.captured] ?? 0) - Math.floor((PIECE_VALUES[move.piece] ?? 0) * 0.08);
  if (move.promotion) score += PIECE_VALUES[move.promotion] ?? 800;
  if (move.flags?.includes("k") || move.flags?.includes("q")) score += 65;
  if (CENTER.has(move.to)) score += 50;
  if (NEAR_CENTER.has(move.to)) score += 22;
  if ((move.piece === "n" || move.piece === "b") && (move.from[1] === "1" || move.from[1] === "8")) score += 38;
  if (move.piece === "q") score -= 18;
  if (move.piece === "k" && !(move.flags?.includes("k") || move.flags?.includes("q"))) score -= 30;

  try {
    const after = new Chess(fen);
    after.move({ from: move.from, to: move.to, promotion: move.promotion ?? "q" });
    if (after.isCheckmate()) score += 100000;
    else if (after.isCheck()) score += 90;
  } catch {
    // ignore
  }

  score += (move.from.charCodeAt(0) + move.to.charCodeAt(0) + move.to.charCodeAt(1)) % 17;
  return Math.max(1, score);
}

function localExplorerFallback(fen: string, source: ExplorerSource, requestedMoves: string, reason: string, upstreamStatus?: number) {
  try {
    const game = new Chess(fen);
    const limit = Math.max(1, Math.min(Number(requestedMoves) || 25, 25));
    const legalMoves = game.moves({ verbose: true }) as VerboseMove[];
    const ranked = legalMoves
      .map((move) => ({ move, score: scoreMove(fen, move) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    const totalScore = ranked.reduce((sum, item) => sum + item.score, 0) || 1;

    return NextResponse.json({
      source: "local-explorer-fallback",
      requestedSource: source,
      fallback: true,
      reason,
      upstreamStatus,
      fen,
      white: game.turn() === "w" ? totalScore : 0,
      draws: 0,
      black: game.turn() === "b" ? totalScore : 0,
      opening: {
        eco: "SANDBOX",
        name: "Local legal continuation fallback",
      },
      moves: ranked.map((item) => ({
        uci: moveToUci(item.move),
        san: item.move.san,
        white: item.move.color === "w" ? item.score : 0,
        draws: 0,
        black: item.move.color === "b" ? item.score : 0,
        averageRating: undefined,
      })),
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      source: "local-explorer-fallback",
      requestedSource: source,
      fallback: true,
      reason: `${reason} Local fallback also failed.`,
      upstreamStatus,
      details: error instanceof Error ? error.message : String(error),
      fen,
      moves: [],
      fetchedAt: new Date().toISOString(),
    });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const fen = searchParams.get("fen");
  if (!fen) {
    return NextResponse.json({ error: "Missing fen query parameter" }, { status: 400 });
  }

  const source = (searchParams.get("source") ?? "lichess") as ExplorerSource;
  const moves = searchParams.get("moves") ?? "25";

  const endpoint = source === "masters" ? "https://explorer.lichess.org/masters" : "https://explorer.lichess.org/lichess";

  const url = new URL(endpoint);
  url.searchParams.set("fen", fen);
  url.searchParams.set("moves", moves);
  url.searchParams.set("topGames", "0");
  url.searchParams.set("variant", "standard");

  if (source === "lichess") {
    url.searchParams.set("speeds", cleanCsv(searchParams.get("speeds"), "blitz,rapid,classical", VALID_SPEEDS));
    url.searchParams.set("ratings", cleanRatings(searchParams.get("ratings"), "1000"));
    url.searchParams.set("recentGames", "0");
  } else {
    url.searchParams.set("since", searchParams.get("since") ?? "2000");
  }

  try {
    const response = await fetch(url.toString(), {
      headers: {
        accept: "application/json",
        // Keep a clear UA; some upstream services are stricter with anonymous/generic traffic.
        "user-agent": "OpeningLabTrainer/0.8 contact: local-development",
      },
      next: { revalidate: 60 * 60 * 24 },
    });

    if (response.status === 401) {
      return localExplorerFallback(
        fen,
        source,
        moves,
        "Lichess Explorer rejected this unauthenticated request. Using local legal continuations instead.",
        401
      );
    }

    if (response.status === 423) {
      return localExplorerFallback(
        fen,
        source,
        moves,
        "Lichess Explorer temporarily locked this resource/request. Using local legal continuations instead.",
        423
      );
    }

    if (response.status === 429) {
      return localExplorerFallback(
        fen,
        source,
        moves,
        "Lichess Explorer rate-limited this request. Using local legal continuations instead.",
        429
      );
    }

    if (!response.ok) {
      return localExplorerFallback(
        fen,
        source,
        moves,
        `Lichess Explorer returned status ${response.status}. Using local legal continuations instead.`,
        response.status
      );
    }

    const data = await response.json();
    return NextResponse.json({ source, fallback: false, fen, fetchedAt: new Date().toISOString(), ...data });
  } catch (error) {
    return localExplorerFallback(
      fen,
      source,
      moves,
      error instanceof Error ? `Could not reach Lichess Explorer: ${error.message}` : "Could not reach Lichess Explorer.",
      undefined
    );
  }
}
