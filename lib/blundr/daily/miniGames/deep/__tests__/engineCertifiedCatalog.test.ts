import assert from "node:assert/strict";
import test from "node:test";
import { Chess } from "chess.js";
import {
  ENGINE_CERTIFIED_DEEP_CATALOG_SUMMARY,
  selectEngineCertifiedDeepScenario,
} from "../engineCertifiedCatalog";
import { validateDeepMiniGameScenario } from "../deepMiniGameValidator";

test("engine catalog reports supplied, active, and quarantined provenance", () => {
  assert.deepEqual(ENGINE_CERTIFIED_DEEP_CATALOG_SUMMARY, {
    catalogId: "blundr-engine-certified-deep-minigames",
    catalogVersion: "1.0.0",
    suppliedRecords: 920,
    activeRecords: 857,
    quarantinedRecords: 63,
    sourceGeneratorAvailable: false,
  });
});

test("catalog selection is deterministic for the same game and seed", () => {
  const first = selectEngineCertifiedDeepScenario(
    "tactic_shots_deep",
    "user-a|instance-a",
  );
  const second = selectEngineCertifiedDeepScenario(
    "tactic_shots_deep",
    "user-a|instance-a",
  );
  assert.ok(first);
  assert.deepEqual(first, second);
  assert.equal(validateDeepMiniGameScenario(first).ok, true);
});

test("each deep family selects a legal multi-decision line", () => {
  for (const miniGameId of [
    "tactic_shots_deep",
    "knight_gymnasium_deep",
    "king_pawn_lab",
  ] as const) {
    const scenario = selectEngineCertifiedDeepScenario(
      miniGameId,
      `seed:${miniGameId}`,
    );
    assert.ok(scenario);
    assert.equal(validateDeepMiniGameScenario(scenario).ok, true);
    assert.ok(scenario.solution.userMoves.length >= 2);
    const chess = new Chess(scenario.startFen);
    for (
      let index = 0;
      index < scenario.solution.userMoves.length;
      index += 1
    ) {
      assert.ok(chess.move(scenario.solution.userMoves[index]));
      const reply = scenario.solution.opponentReplies[index];
      if (reply) assert.ok(chess.move(reply));
    }
  }
});

test("prepared catalog scenarios require complete engine evidence", () => {
  const scenario = selectEngineCertifiedDeepScenario(
    "knight_gymnasium_deep",
    "evidence",
  );
  assert.ok(scenario?.evidence);
  assert.equal(scenario.evidence.depth, 8);
  assert.equal(scenario.evidence.engine, "Stockfish 18 Lite");
  assert.match(scenario.evidence.checksumSha256, /^[a-f0-9]{64}$/);
});
