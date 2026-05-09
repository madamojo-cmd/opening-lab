import { NextRequest, NextResponse } from "next/server";
import { Chess } from "chess.js";

export const dynamic = "force-dynamic";

const VALID_RATINGS = new Set(["1000", "1200", "1400", "1600", "1800", "2000", "2200", "2500"]);
const VALID_SPEEDS = new Set(["ultraBullet", "bullet", "blitz", "rapid", "classical", "correspondence"]);

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

function localFallback(fen: string, reason: string, status = 200) {
  try {
    const game = new Chess(fen);
    const turn = game.turn();
    const legalMoves = game.moves({ verbose: true }) as any[];
    const center = new Set(["d4", "e4", "d5", "e5"]);
    const ranked = legalMoves
      .map((move) => {
        let score = 20;
        if (move.captured) score += 60;
        if (center.has(move.to)) score += 35;
        if ((move.piece === "n" || move.piece === "b") && (move.from[1] === "1" || move.from[1] === "8")) score += 25;
        if (move.san?.includes("+")) score += 40;
        if (move.flags?.includes("k") || move.flags?.includes("q")) score += 30;
        return { move, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 16);

    return NextResponse.json({
      source: "local-fallback",
      fallback: true,
      reason,
      status,
      opening: { eco: "LOCAL", name: "Local fallback" },
      white: turn === "w" ? 1 : 0,
      draws: 0,
      black: turn === "b" ? 1 : 0,
      moves: ranked.map((item, index) => {
        const weight = Math.max(10, 120 - index * 8 + item.score);
        return {
          uci: moveToUci(item.move),
          san: item.move.san,
          white: turn === "w" ? weight : 0,
          draws: Math.max(1, Math.round(weight * .08)),
          black: turn === "b" ? weight : 0,
          averageRating: 1200
        };
      }),
      fetchedAt: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ source: "local-fallback", fallback: true, reason, error: String(error), moves: [] });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fen = searchParams.get("fen");
  if (!fen) return NextResponse.json({ error: "Missing fen query parameter" }, { status: 400 });

  const source = searchParams.get("source") === "masters" ? "masters" : "lichess";
  const endpoint = source === "masters" ? "https://explorer.lichess.org/masters" : "https://explorer.lichess.org/lichess";

  const url = new URL(endpoint);
  url.searchParams.set("fen", fen);
  url.searchParams.set("moves", searchParams.get("moves") ?? "25");
  url.searchParams.set("topGames", "0");

  if (source === "lichess") {
    url.searchParams.set("variant", "standard");
    url.searchParams.set("speeds", cleanCsv(searchParams.get("speeds"), "blitz,rapid,classical", VALID_SPEEDS));
    url.searchParams.set("ratings", cleanCsv(searchParams.get("ratings"), "1000,1200,1400,1600", VALID_RATINGS));
    url.searchParams.set("recentGames", "0");
  }

  const headers: Record<string, string> = { accept: "application/json", "user-agent": "BlundrOpeningTrainer/2.0" };
  if (process.env.LICHESS_TOKEN) headers.authorization = `Bearer ${process.env.LICHESS_TOKEN}`;

  try {
    const response = await fetch(url.toString(), { headers, next: { revalidate: 60 * 60 * 12 } } as any);
    if (response.status === 401) return localFallback(fen, "Lichess unauthenticated. Check LICHESS_TOKEN.", 401);
    if (response.status === 423) return localFallback(fen, "Lichess returned 423 Locked.", 423);
    if (response.status === 429) return localFallback(fen, "Lichess rate-limited request.", 429);
    if (!response.ok) return localFallback(fen, `Lichess returned ${response.status}.`, response.status);
    const data = await response.json();
    return NextResponse.json({ source, fallback: false, fen, fetchedAt: new Date().toISOString(), ...data });
  } catch (error) {
    return localFallback(fen, error instanceof Error ? error.message : "Could not reach Lichess.");
  }
}
