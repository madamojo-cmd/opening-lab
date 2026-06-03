import { Chess } from "chess.js";

import { MaiaLc0RuntimeAdapter } from "../lib/blundr/maia/maiaLc0RuntimeAdapter";
import { readMaiaRuntimeConfig } from "../lib/blundr/maia/maiaRuntimeConfig";

async function main() {
  const config = readMaiaRuntimeConfig();
  const adapter = new MaiaLc0RuntimeAdapter(config);
  const health = await adapter.health();

  const game = new Chess();
  const legalMoves = game.moves({ verbose: true }).map((m: any) => `${m.from}${m.to}${m.promotion ?? ""}`.toLowerCase());
  const moveResult = await adapter.getBestMove({
    requestId: 1,
    fen: game.fen(),
    fen4: game.fen().split(" ").slice(0, 4).join(" "),
    legalMovesUci: legalMoves,
    skillLevel: config.skillLevel,
    timeoutMs: config.timeoutMs,
  });

  const payload = {
    config: {
      enabled: config.enabled,
      skillLevel: config.skillLevel,
      timeoutMs: config.timeoutMs,
      nodes: config.nodes,
      lc0Configured: Boolean(config.lc0Path),
      weightsConfigured: Boolean(config.weightsPath),
    },
    health,
    sampleMove: moveResult,
  };

  console.log(JSON.stringify(payload, null, 2));
  process.exit(health.ready ? 0 : 1);
}

main().catch((error) => {
  console.error(JSON.stringify({ status: "error", message: error instanceof Error ? error.message : String(error) }, null, 2));
  process.exit(1);
});
