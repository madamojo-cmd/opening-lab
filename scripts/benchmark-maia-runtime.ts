import { Chess } from "chess.js";

import { MaiaLc0RuntimeAdapter } from "../lib/blundr/maia/maiaLc0RuntimeAdapter";
import { readMaiaRuntimeConfig } from "../lib/blundr/maia/maiaRuntimeConfig";

const BENCH_FENS = [
  "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
  "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
  "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
  "r2q1rk1/ppp2ppp/2np1n2/4p3/2B1P3/2PP1N2/PP1N1PPP/R1BQR1K1 w - - 0 9",
  "r1bq1rk1/bpp2ppp/p1np1n2/4p3/4P3/1BPP1N2/PP1N1PPP/R1BQR1K1 b - - 1 9",
];

function p(values: number[], pct: number): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.floor((pct / 100) * sorted.length)));
  return sorted[idx];
}

async function main() {
  const config = readMaiaRuntimeConfig();
  const adapter = new MaiaLc0RuntimeAdapter(config);
  const latencies: number[] = [];
  let legalSuccess = 0;
  let timeoutCount = 0;

  for (let i = 0; i < BENCH_FENS.length; i += 1) {
    const fen = BENCH_FENS[i];
    const game = new Chess(fen);
    const legalMoves = game.moves({ verbose: true }).map((m: any) => `${m.from}${m.to}${m.promotion ?? ""}`.toLowerCase());
    const result = await adapter.getBestMove({
      requestId: i + 1,
      fen,
      fen4: fen.split(" ").slice(0, 4).join(" "),
      legalMovesUci: legalMoves,
      skillLevel: config.skillLevel,
      timeoutMs: config.timeoutMs,
    });
    latencies.push(result.runtimeMs);
    if (result.legal) legalSuccess += 1;
    if (result.status === "timeout") timeoutCount += 1;
  }

  const payload = {
    sampleCount: BENCH_FENS.length,
    minLatencyMs: latencies.length ? Math.min(...latencies) : 0,
    p50LatencyMs: p(latencies, 50),
    p95LatencyMs: p(latencies, 95),
    maxLatencyMs: latencies.length ? Math.max(...latencies) : 0,
    legalMoveSuccessRate: BENCH_FENS.length ? legalSuccess / BENCH_FENS.length : 0,
    timeoutCount,
  };

  console.log(JSON.stringify(payload, null, 2));
}

main().catch((error) => {
  console.error(JSON.stringify({ status: "error", message: error instanceof Error ? error.message : String(error) }, null, 2));
  process.exit(1);
});
