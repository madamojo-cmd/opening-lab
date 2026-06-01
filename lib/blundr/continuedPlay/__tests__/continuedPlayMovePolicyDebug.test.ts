import assert from "node:assert/strict";
import { selectContinuedPlayMove } from "../continuedPlayMovePolicy";

export function testContinuedPlayMovePolicyDebug(): void {
  const fen = "r1bqk2r/ppp2ppp/2np1n2/2b1p3/2B1P3/2PP1N2/PP3PPP/RNBQK2R w KQkq - 0 6";

  const unverified = selectContinuedPlayMove({
    fen,
    lichessCandidates: [{ uci: "a2a4", san: "a4", source: "lichess", supported: false, engineSafe: false }],
  });
  assert.equal(unverified?.source, "human_continuation_unverified");
  assert.equal(unverified?.debug.selectedMoveInCandidateList, true);

  const validated = selectContinuedPlayMove({
    fen,
    lichessCandidates: [{ uci: "e1g1", san: "O-O", source: "lichess", supported: true, engineSafe: true }],
  });
  assert.equal(validated?.source, "lichess_engine_validated");
  assert.equal(validated?.reason, "human_continuation_with_safety");
  assert.equal(validated?.debug.continuationMoveSafetySource, "engine_or_support");

  const mismatchCheck = selectContinuedPlayMove({
    fen,
    engineTop: { uci: "e1g1", san: "O-O", source: "engine", supported: true, engineSafe: true },
  });
  assert.equal(Boolean(mismatchCheck?.debug.candidates.find((c) => c.moveUci === mismatchCheck?.selectedUci)), true);
}
