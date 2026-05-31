import assert from "node:assert/strict";
import { selectContinuedPlayMove } from "../continuedPlayMovePolicy";

export function testContinuedPlayMovePolicy(): void {
  const fen = "r1bqk2r/ppp2ppp/2np1n2/2b1p3/2B1P3/2PP1N2/PP3PPP/RNBQK2R w KQkq - 0 6";

  const book = selectContinuedPlayMove({
    fen,
    bookCandidates: [{ uci: "e1g1", san: "O-O", source: "book", supported: true }],
    engineTop: { uci: "c2c3", san: "c3", source: "engine" },
  });
  assert.equal(book?.source, "book_supported");

  const lichessNotAutoSafe = selectContinuedPlayMove({
    fen,
    lichessCandidates: [{ uci: "a2a4", san: "a4", source: "lichess", supported: false, engineSafe: false }],
    engineTop: { uci: "e1g1", san: "O-O", source: "engine", supported: true, engineSafe: true },
  });
  assert.equal(lichessNotAutoSafe?.source, "engine_top");

  const engineTop = selectContinuedPlayMove({
    fen,
    engineTop: { uci: "e1g1", san: "O-O", source: "engine", supported: true, engineSafe: true },
  });
  assert.equal(engineTop?.source, "engine_top");

  const emergency = selectContinuedPlayMove({
    fen,
    lichessCandidates: [],
    engineTop: null,
  });
  assert.equal(Boolean(emergency), true);
  assert.equal(emergency?.source, "emergency_legal_fallback");
}
