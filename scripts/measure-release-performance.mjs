import { performance } from "node:perf_hooks";
import { buildDeterministicDailyDeck } from "../lib/blundr/daily/core/dailyDeckPolicy.ts";
import { createDeepMiniGameState } from "../lib/blundr/daily/miniGames/deep/deepMiniGameReducer.ts";

const candidates = Array.from({ length: 25 }, (_, index) => ({
  cardFingerprint: `card-${index}`,
  positionKey: `position-${index}`,
  title: "Recall",
  priority: 25 - index,
  stableKey: `key-${index}`,
}));
const deckSamples = [];
for (let index = 0; index < 100; index += 1) {
  const start = performance.now();
  buildDeterministicDailyDeck({
    userId: "performance-user",
    dateKey: "2026-07-15",
    candidates,
  });
  deckSamples.push(performance.now() - start);
}
const stateSamples = [];
const scenario = {
  id: "performance-scenario",
  miniGameId: "tactic_shots_deep",
  startFen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
  sideToMove: "black",
  solution: { userMoves: ["e7e5", "b8c6"], opponentReplies: ["g1f3"] },
  schemaVersion: "2026-07-15.v1",
  generatorVersion: "performance",
  validatorVersion: "performance",
  evidenceVersion: "performance",
};
for (let index = 0; index < 100; index += 1) {
  const start = performance.now();
  JSON.stringify(createDeepMiniGameState(scenario));
  stateSamples.push(performance.now() - start);
}
const p95 = (values) =>
  [...values].sort((a, b) => a - b)[Math.floor(values.length * 0.95)];
const result = {
  measuredAt: new Date().toISOString(),
  dailyDeckReservationP95Ms: p95(deckSamples),
  deepGameSerializationP95Ms: p95(stateSamples),
  samples: 100,
  notes:
    "Local deterministic reducer/serialization measurements; network-backed insight and projection latency require staging telemetry.",
};
console.log(JSON.stringify(result, null, 2));
if (
  result.dailyDeckReservationP95Ms > 1500 ||
  result.deepGameSerializationP95Ms > 100
)
  process.exitCode = 1;
