import { NextRequest, NextResponse } from "next/server";
import { Chess } from "chess.js";

export const dynamic = "force-dynamic";

type VerboseMove = {
  from: string;
  to: string;
  piece: string;
  captured?: string;
  promotion?: string;
  flags?: string;
  san: string;
};

const VALUES: Record<string, number> = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };

function moveToUci(move: { from: string; to: string; promotion?: string }) {
  return `${move.from}${move.to}${move.promotion ?? ""}`;
}

function scoreMove(fen: string, move: VerboseMove, skill = 1400) {
  let score = 10;
  const center = new Set(["d4", "e4", "d5", "e5"]);
  if (move.captured) score += (VALUES[move.captured] ?? 0) - Math.floor((VALUES[move.piece] ?? 0) * .08);
  if (move.promotion) score += VALUES[move.promotion] ?? 800;
  if (move.flags?.includes("k") || move.flags?.includes("q")) score += 65;
  if (center.has(move.to)) score += 45;
  if ((move.piece === "n" || move.piece === "b") && (move.from[1] === "1" || move.from[1] === "8")) score += 35;
  if (move.piece === "q") score -= skill < 1600 ? 16 : 7;
  try {
    const after = new Chess(fen);
    after.move({ from: move.from, to: move.to, promotion: move.promotion ?? "q" });
    if (after.isCheckmate()) score += 100000;
    else if (after.isCheck()) score += 80;
  } catch {}
  return score + ((move.from.charCodeAt(0) + move.to.charCodeAt(0) + move.to.charCodeAt(1)) % 13);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fen = searchParams.get("fen");
  if (!fen) return NextResponse.json({ error: "Missing fen query parameter" }, { status: 400 });
  const skill = Number(searchParams.get("skill") ?? "1400") || 1400;
  const multiPv = Math.max(1, Math.min(Number(searchParams.get("multiPv") ?? "5") || 5, 8));

  try {
    const game = new Chess(fen);
    const moves = game.moves({ verbose: true }) as VerboseMove[];
    const ranked = moves.map((move) => ({ move, score: scoreMove(fen, move, skill) })).sort((a, b) => b.score - a.score).slice(0, multiPv);
    return NextResponse.json({
      source: "engine-style-fallback",
      fallback: true,
      reason: "Engine-style heuristic fallback. Replace this route with a real Stockfish worker/backend for production engine depth.",
      skill,
      depth: 1,
      pvs: ranked.map((item) => ({ line: moveToUci(item.move), san: item.move.san, cp: item.score }))
    });
  } catch (error) {
    return NextResponse.json({ source: "engine-style-fallback", fallback: true, error: String(error), pvs: [] });
  }
}
