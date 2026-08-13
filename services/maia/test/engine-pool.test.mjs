import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { CapacityError, MaiaEnginePool } from "../src/engine-pool.mjs";

const logger = { debug() {}, info() {}, warn() {}, error() {} };

function createHarness(overrides = {}) {
  const workers = [];
  let delayMs = 0;
  const models = new Map(
    ["maia-1100", "maia-1500", "maia-1900"].map((skill) => [
      skill,
      { path: `/models/${skill}.pb.gz` },
    ]),
  );
  const pool = new MaiaEnginePool({
    config: {
      healthProbeSkill: "maia-1500",
      requestTimeoutMs: 2_500,
      maxWarmWorkers: 2,
      prewarmSkills: ["maia-1500"],
      queueLimit: 1,
      lc0Path: "/bin/fake-lc0",
      backend: "blas",
      startupTimeoutMs: 2_000,
      ...overrides,
    },
    manifest: { engine: { version: "0.32.1" } },
    models,
    logger,
    workerFactory: ({ weightsPath }) => {
      const worker = {
        weightsPath,
        ready: false,
        closed: false,
        async start() {
          worker.ready = true;
        },
        async bestMove() {
          if (delayMs)
            await new Promise((resolve) => setTimeout(resolve, delayMs));
          return { bestMoveUci: "e2e4", ponderUci: "e7e5" };
        },
        async close() {
          worker.ready = false;
          worker.closed = true;
        },
      };
      workers.push(worker);
      return worker;
    },
  });
  return { pool, workers, setDelay: (value) => (delayMs = value) };
}

const request = {
  skillLevel: "maia-1500",
  fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  timeoutMs: 2_500,
};

describe("engine pool", () => {
  it("runs a startup probe and retains a bounded LRU set", async () => {
    const harness = createHarness();
    await harness.pool.initialize();
    assert.equal(harness.pool.health().ready, true);
    await harness.pool.bestMove({ ...request, skillLevel: "maia-1100" });
    await harness.pool.bestMove({ ...request, skillLevel: "maia-1900" });
    assert.equal(harness.pool.health().loadedSkills.length, 2);
    assert.equal(harness.workers[0].closed, true);
    await harness.pool.close();
  });

  it("does not become ready until every configured skill is warm", async () => {
    const harness = createHarness({
      maxWarmWorkers: 3,
      prewarmSkills: ["maia-1100", "maia-1500", "maia-1900"],
    });
    await harness.pool.initialize();
    assert.deepEqual(harness.pool.health().loadedSkills, [
      "maia-1100",
      "maia-1500",
      "maia-1900",
    ]);
    assert.equal(harness.workers.length, 3);
    await harness.pool.close();
  });

  it("rejects immediately when the bounded queue is full", async () => {
    const harness = createHarness({ queueLimit: 0 });
    await harness.pool.initialize();
    harness.setDelay(50);
    const active = harness.pool.bestMove(request);
    await assert.rejects(
      harness.pool.bestMove(request),
      (error) => error instanceof CapacityError,
    );
    await active;
    await harness.pool.close();
  });
});
