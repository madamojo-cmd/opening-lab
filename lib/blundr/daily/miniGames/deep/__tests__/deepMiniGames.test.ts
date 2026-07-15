import assert from "node:assert/strict";
import test from "node:test";
import { buildDeepTacticShots } from "../tacticShotsDeep";
import { buildKingPawnLab } from "../kingPawnLab";
import {
  createDeepMiniGameState,
  reduceDeepMiniGame,
} from "../deepMiniGameReducer";
import { validateDeepMiniGameScenario } from "../deepMiniGameValidator";

const access = {
  decision: "active",
  checkedAt: "2026-07-14T00:00:00Z",
  expiresAt: null,
};
test("deep tactic requires multiple legal plies and legal_progress never completes", () => {
  const built = buildDeepTacticShots({
    openingId: "italian-white",
    positionKey: "p",
    startFen:
      "rn bqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 1 2".replace(
        " ",
        "",
      ),
    userMoves: ["f1b5", "g1f3"],
    opponentReplies: ["b8c6", "g8f6"],
    access,
  });
  assert.equal(built.ok, false);
  const valid = buildDeepTacticShots({
    openingId: "italian-white",
    positionKey: "p",
    startFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    userMoves: ["e2e4", "g1f3"],
    opponentReplies: ["e7e5", "b8c6"],
    access,
  });
  assert.equal(valid.ok, true);
  if (!valid.ok) return;
  let state = createDeepMiniGameState(valid.solution);
  const first = reduceDeepMiniGame(state, valid.solution, {
    type: "move",
    uci: "e2e4",
    now: "2026-07-14T00:00:00Z",
  });
  assert.equal(first.kind, "opponent_reply");
  assert.equal(first.state.state, "in_progress");
  state = first.state;
  const done = reduceDeepMiniGame(state, valid.solution, {
    type: "move",
    uci: "g1f3",
    now: "2026-07-14T00:00:01Z",
  });
  assert.equal(done.kind, "objective_complete");
});

test("king pawn lab rejects an illegal verified line", () => {
  const result = buildKingPawnLab({
    openingId: "endgame",
    positionKey: "k",
    startFen: "8/8/8/8/8/8/4K3/7k w - - 0 1",
    userMoves: ["e2e4", "e4e5"],
    opponentReplies: ["h1g1", "g1f1"],
    result: "hold",
    access,
  });
  assert.equal(result.ok, false);
  assert.equal(
    validateDeepMiniGameScenario({
      id: "bad",
      miniGameId: "king_pawn_lab",
      startFen: "bad",
      sideToMove: "white",
      solution: { userMoves: ["e2e4", "e4e5"], opponentReplies: [] },
      schemaVersion: "v",
      generatorVersion: "v",
      validatorVersion: "v",
      evidenceVersion: "v",
    }).ok,
    false,
  );
});
