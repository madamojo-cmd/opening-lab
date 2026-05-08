import { NextRequest, NextResponse } from "next/server";
import { Chess } from "chess.js";

export const dynamic = "force-dynamic";

type ExplorerSource = "lichess" | "masters";

const VALID_RATINGS = new Set([
  "1000",
  "1200",
  "1400",
  "1600",
  "1800",
  "2000",
  "2200",
  "2500",
]);

const VALID_SPEEDS = new Set([
  "ultraBullet",
  "bullet",
  "blitz",
  "rapid",
  "classical",
  "correspondence",
]);

function cleanCsv(value: string | null, fallback: string, allowed?: Set<string>) {
  const cleaned = (value ?? fallback)
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => !allowed || allowed.has(part));

  return cleaned.length ? cleaned.join(",") : fallback;
}

function moveToUci(move: { from: string; to: string; promotion?: string }) {
  return `${move.from}${move.to}${move.promotion ?? ""}`;
}

function scoreFallbackMove(move: any) {
  let score = 10;

  if (move.captured) score += 60;
  if (move.san?.includes("+")) score += 40;
  if (move.san?.includes("#")) score += 10000;
  if (move.flags?.includes("k") || move.flags?.includes("q")) score += 35;

  const center = new Set(["d4", "e4", "d5", "e5"]);
  const nearCenter = new Set(["c3", "d3", "e3", "f3", "c4", "f4", "c5", "f5", "c6", "d6", "e6", "f6"]);

  if (center.has(move.to)) score += 30;
  if (nearCenter.has(move.to)) score += 15;

  if ((move.piece === "n" || move.piece === "b") && (move.from[1] === "1" || move.from[1] === "8")) {
    score += 25;
  }

  if (move.piece === "q") score -= 10;

  return score;
}

function localExplorerFallback(fen: string, reason: string, status = 200) {
  try {
    const game = new Chess(fen);
    const turn = game.turn();
    const legalMoves = game.moves({ verbose: true }) as any[];

    const ranked = legalMoves
      .map((move) => ({
        move,
        score: scoreFallbackMove(move),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);

    const moves = ranked.map((item, index) => {
      const weight = Math.max(10, 120 - index * 10 + item.score);

      return {
        uci: moveToUci(item.move),
        san: item.move.san,
        white: turn === "w" ? weight : 0,
        draws: Math.max(1, Math.round(weight * 0.08)),
        black: turn === "b" ? weight : 0,
        averageRating: 1200,
      };
    });

    return NextResponse.json(
      {
        source: "local-fallback",
        fallback: true,
        reason,
        status,
        fen,
        opening: {
          eco: "LOCAL",
          name: "Local legal continuation",
        },
        white: turn === "w" ? 1 : 0,
        draws: 0,
        black: turn === "b" ? 1 : 0,
        moves,
        fetchedAt: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        source: "local-fallback",
        fallback: true,
        reason: "Could not generate local fallback moves.",
        error: error instanceof Error ? error.message : String(error),
        fen,
        moves: [],
        fetchedAt: new Date().toISOString(),
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

  const source = (searchParams.get("source") ?? "lichess") as ExplorerSource;
  const moves = searchParams.get("moves") ?? "25";

  const endpoint =
    source === "masters"
      ? "https://explorer.lichess.org/masters"
      : "https://explorer.lichess.org/lichess";

  const url = new URL(endpoint);
  url.searchParams.set("fen", fen);
  url.searchParams.set("moves", moves);
  url.searchParams.set("topGames", "0");

  if (source === "lichess") {
    url.searchParams.set("variant", "standard");
    url.searchParams.set("speeds", cleanCsv(searchParams.get("speeds"), "blitz,rapid,classical", VALID_SPEEDS));
    url.searchParams.set("ratings", cleanCsv(searchParams.get("ratings"), "1000,1200,1400,1600", VALID_RATINGS));
    url.searchParams.set("recentGames", "0");
  } else {
    url.searchParams.set("since", searchParams.get("since") ?? "2000");
  }

  const headers: Record<string, string> = {
    accept: "application/json",
    "user-agent": "BlundrOpeningTrainer/1.0",
  };

  if (process.env.LICHESS_TOKEN) {
    headers.authorization = `Bearer ${process.env.LICHESS_TOKEN}`;
  }

  try {
    const response = await fetch(url.toString(), {
      headers,
      next: {
        revalidate: 60 * 60 * 24,
      },
    });

    if (response.status === 401) {
      return localExplorerFallback(
        fen,
        "Lichess Explorer rejected this request as unauthenticated. Check that LICHESS_TOKEN is set in Vercel and redeploy.",
        401
      );
    }

    if (response.status === 423) {
      return localExplorerFallback(
        fen,
        "Lichess Explorer returned 423 Locked. Using local legal continuations instead.",
        423
      );
    }

    if (response.status === 429) {
      return localExplorerFallback(
        fen,
        "Lichess Explorer rate-limited this request. Using local legal continuations instead.",
        429
      );
    }

    if (!response.ok) {
      return localExplorerFallback(
        fen,
        `Lichess Explorer returned ${response.status}. Using local legal continuations instead.`,
        response.status
      );
    }

    const data = await response.json();

    return NextResponse.json({
      source,
      fallback: false,
      fen,
      fetchedAt: new Date().toISOString(),
      ...data,
    });
  } catch (error) {
    return localExplorerFallback(
      fen,
      error instanceof Error
        ? `Could not reach Lichess Explorer: ${error.message}`
        : "Could not reach Lichess Explorer."
    );
  }
}
