import assert from "node:assert/strict";
import test from "node:test";
import { projectStandaloneMiniGame } from "../standaloneMiniGameProjection";

const record = {
  instanceId: "mgi_test_instance",
  revision: 0,
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
  assert.equal(serialized.includes('"solution"'), false);
  assert.equal(publicState.instanceId, "mgi_test_instance");
  assert.equal(publicState.revision, 0);
});

test("deep pre-answer projection excludes line and engine evidence", () => {
  const deepRecord = {
    instanceId: "mgi_deep_instance",
    revision: 4,
    userId: "user-a",
    kind: "deep",
    card: { title: "private" },
    state: {
      state: "ready",
      currentFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      userMoveIndex: 0,
      opponentReplyIndex: 0,
      moves: [],
      targetsReached: [],
      terminalResult: null,
      firstAttempt: null,
      firstAttemptRecordedAt: null,
      retryCount: 0,
      feedback: null,
    },
    scenario: {
      id: "catalog:1:test",
      miniGameId: "tactic_shots_deep",
      startFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      sideToMove: "white",
      solution: {
        userMoves: ["e2e4", "g1f3"],
        opponentReplies: ["e7e5"],
      },
      schemaVersion: "deep-schema-v1",
      generatorVersion: "prepared-engine-catalog-v1",
      validatorVersion: "deep-catalog-validator-v1",
      evidenceVersion: "stockfish-18-lite-depth-8",
      evidence: {
        catalogId: "blundr-engine-certified-deep-minigames",
        catalogVersion: "1.0.0",
        sourceRecordId: "test",
        family: "tactic",
        engine: "Stockfish 18 Lite",
        depth: 8,
        evaluationCp: 42,
        mate: null,
        bestMoveGapCp: 30,
        multiPv: 2,
        legalMoveCount: 20,
        pieceCount: 32,
        theme: "forcing line",
        architecture: "open center",
        checksumSha256: "a".repeat(64),
      },
    },
    firstAttempt: null,
    retryCount: 0,
    expiresAt: "2999-01-01T00:00:00.000Z",
  };
  const serialized = JSON.stringify(
    projectStandaloneMiniGame(deepRecord as never),
  );
  assert.equal(serialized.includes("e2e4"), false);
  assert.equal(serialized.includes("Stockfish"), false);
  assert.equal(serialized.includes("evaluationCp"), false);
  assert.equal(serialized.includes('"solution"'), false);
  assert.equal(serialized.includes('"revision":4'), true);
});
