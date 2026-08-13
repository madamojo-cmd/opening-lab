import assert from "node:assert/strict";
import { chmod } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { UciWorker } from "../src/uci-worker.mjs";

const fakeLc0 = fileURLToPath(
  new URL("./fixtures/fake-lc0.mjs", import.meta.url),
);
const logger = { debug() {}, info() {}, warn() {}, error() {} };

describe("persistent UCI worker", () => {
  it("initializes once and returns a policy move", async () => {
    await chmod(fakeLc0, 0o755);
    const worker = new UciWorker({
      binaryPath: fakeLc0,
      weightsPath: "/tmp/fake-maia.pb.gz",
      backend: "blas",
      startupTimeoutMs: 2_000,
      expectedEngineVersion: "0.32.1",
      expectedEngineCommit: "fd71a2d921b689c5f479d3227c3806c8e272d9c5",
      logger,
    });
    try {
      await worker.start();
      assert.equal(worker.ready, true);
      const first = await worker.bestMove(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        1_000,
      );
      assert.deepEqual(first, { bestMoveUci: "e2e4", ponderUci: "e7e5" });
      const second = await worker.bestMove(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        1_000,
      );
      assert.equal(second.bestMoveUci, "e2e4");
    } finally {
      await worker.close();
    }
  });

  it("rejects an engine whose reported version is not pinned", async () => {
    await chmod(fakeLc0, 0o755);
    process.env.FAKE_LC0_VERSION = "0.31.2";
    const worker = new UciWorker({
      binaryPath: fakeLc0,
      weightsPath: "/tmp/fake-maia.pb.gz",
      backend: "blas",
      startupTimeoutMs: 2_000,
      expectedEngineVersion: "0.32.1",
      expectedEngineCommit: "fd71a2d921b689c5f479d3227c3806c8e272d9c5",
      logger,
    });
    try {
      await assert.rejects(worker.start(), {
        message: "engine_version_mismatch",
      });
    } finally {
      delete process.env.FAKE_LC0_VERSION;
      await worker.close();
    }
  });

  it("rejects a longer version that merely contains the pinned text", async () => {
    await chmod(fakeLc0, 0o755);
    process.env.FAKE_LC0_VERSION = "0.32.10";
    const worker = new UciWorker({
      binaryPath: fakeLc0,
      weightsPath: "/tmp/fake-maia.pb.gz",
      backend: "blas",
      startupTimeoutMs: 2_000,
      expectedEngineVersion: "0.32.1",
      expectedEngineCommit: "fd71a2d921b689c5f479d3227c3806c8e272d9c5",
      logger,
    });
    try {
      await assert.rejects(worker.start(), {
        message: "engine_version_mismatch",
      });
    } finally {
      delete process.env.FAKE_LC0_VERSION;
      await worker.close();
    }
  });

  it("rejects a different engine commit with the same version", async () => {
    await chmod(fakeLc0, 0o755);
    process.env.FAKE_LC0_COMMIT = "0000000";
    const worker = new UciWorker({
      binaryPath: fakeLc0,
      weightsPath: "/tmp/fake-maia.pb.gz",
      backend: "blas",
      startupTimeoutMs: 2_000,
      expectedEngineVersion: "0.32.1",
      expectedEngineCommit: "fd71a2d921b689c5f479d3227c3806c8e272d9c5",
      logger,
    });
    try {
      await assert.rejects(worker.start(), {
        message: "engine_version_mismatch",
      });
    } finally {
      delete process.env.FAKE_LC0_COMMIT;
      await worker.close();
    }
  });
});
