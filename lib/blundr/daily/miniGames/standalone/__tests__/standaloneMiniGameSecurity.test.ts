import assert from "node:assert/strict";
import test from "node:test";
import { projectStandaloneMiniGame } from "../standaloneMiniGameProjection";

const record = {
  instanceId: "mgi_test_instance",
  userId: "user-a",
  card: {
    kind: "mini_game",
    title: "Tactic practice",
    summary: "Practice a verified position.",
    miniGame: {
      miniGameId: "tactic_shots",
      startFen: "8/8/8/8/8/8/4K3/7k w - - 0 1",
      currentFen: "8/8/8/8/8/8/4K3/7k w - - 0 1",
      learnerSide: "white",
      sideToMove: "w",
      completed: false,
      plyCount: 0,
      scenario: {
        solution: { uci: "e2e3" },
        acceptedMoves: ["e2e3"],
        targetSquares: ["e3"],
        explanation: "Authorized feedback",
      },
    },
  },
  state: {
    currentFen: "8/8/8/8/8/8/4K3/7k w - - 0 1",
    startFen: "8/8/8/8/8/8/4K3/7k w - - 0 1",
    sideToMove: "w",
    learnerSide: "white",
    completed: false,
    plyCount: 0,
    lastMoveSan: null,
  },
  firstAttempt: null,
  retryCount: 0,
  expiresAt: "2999-01-01T00:00:00.000Z",
};

test("standalone pre-answer projection excludes server solution fields", () => {
  const publicState = projectStandaloneMiniGame(record as never);
  const serialized = JSON.stringify(publicState);
  assert.equal(serialized.includes("e2e3"), false);
  assert.equal(serialized.includes("acceptedMoves"), false);
  assert.equal(serialized.includes("targetSquares"), false);
  assert.equal(serialized.includes("solution"), false);
  assert.equal(publicState.instanceId, "mgi_test_instance");
});
