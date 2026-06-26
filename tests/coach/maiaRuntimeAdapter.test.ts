import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { mkdtempSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { MaiaLc0RuntimeAdapter } from "../../lib/blundr/maia/maiaLc0RuntimeAdapter";
import type { MaiaRuntimeConfig } from "../../lib/blundr/maia/maiaRuntimeTypes";

type SpawnMode = "ready" | "illegal" | "timeout" | "stderr_only" | "delayed_ready";

function makeTempConfig(): MaiaRuntimeConfig {
  const dir = mkdtempSync(join(tmpdir(), "maia-test-"));
  const lc0 = join(dir, "lc0");
  const weights = join(dir, "maia-1500.pb.gz");
  writeFileSync(lc0, "#!/bin/sh\nexit 0\n");
  writeFileSync(weights, "weights");
  return {
    enabled: true,
    lc0Path: lc0,
    weightsPath: weights,
    skillLevel: "maia-1500",
    timeoutMs: 120,
    nodes: 1,
    maxConcurrentRequests: 2,
    cacheEnabled: true,
    backend: null,
  };
}

function createSpawn(mode: SpawnMode, capture: { cmd?: string; args?: string[]; options?: any; called: number }) {
  return (cmd: string, args: string[], options: any) => {
    capture.called += 1;
    capture.cmd = cmd;
    capture.args = args;
    capture.options = options;

    const child = new EventEmitter() as any;
    child.stdout = new EventEmitter();
    child.stderr = new EventEmitter();
    child.stdin = {
      write: (_text: string) => {
        if (mode === "ready") {
          setTimeout(() => child.stdout.emit("data", "uciok\nreadyok\nbestmove e2e4 ponder e7e5\n"), 5);
          setTimeout(() => child.emit("exit", 0), 10);
        } else if (mode === "illegal") {
          setTimeout(() => child.stdout.emit("data", "uciok\nreadyok\nbestmove h7h5\n"), 5);
          setTimeout(() => child.emit("exit", 0), 10);
        } else if (mode === "delayed_ready") {
          setTimeout(() => child.stdout.emit("data", "uciok\nreadyok\nbestmove e2e4 ponder e7e5\n"), 40);
          setTimeout(() => child.emit("exit", 0), 50);
        } else if (mode === "stderr_only") {
          setTimeout(() => child.stderr.emit("data", "engine warning"), 5);
          setTimeout(() => child.emit("exit", 0), 10);
        }
      },
    };
    child.kill = () => true;
    return child;
  };
}

async function testRuntimeDisabledReturnsDisabled() {
  const config = makeTempConfig();
  const adapter = new MaiaLc0RuntimeAdapter({ ...config, enabled: false });
  const result = await adapter.getBestMove({
    requestId: 1,
    fen: "startpos",
    fen4: "startpos",
    legalMovesUci: ["e2e4"],
    skillLevel: "maia-1500",
    timeoutMs: 100,
  });
  assert.equal(result.status, "disabled", "runtime_disabled_returns_disabled");
}

async function testMissingPathStatuses() {
  const config = makeTempConfig();
  const missingLc0 = new MaiaLc0RuntimeAdapter({ ...config, lc0Path: null });
  const r1 = await missingLc0.getBestMove({ requestId: 1, fen: "bad", fen4: "bad", legalMovesUci: ["e2e4"], skillLevel: "maia-1500", timeoutMs: 100 });
  assert.equal(r1.status, "missing_lc0_path", "missing_lc0_path_returns_missing_lc0_path");

  const missingWeights = new MaiaLc0RuntimeAdapter({ ...config, weightsPath: null });
  const r2 = await missingWeights.getBestMove({ requestId: 1, fen: "bad", fen4: "bad", legalMovesUci: ["e2e4"], skillLevel: "maia-1500", timeoutMs: 100 });
  assert.equal(r2.status, "missing_weights_path", "missing_weights_path_returns_missing_weights_path");

  const notFoundWeights = new MaiaLc0RuntimeAdapter({ ...config, weightsPath: join(tmpdir(), "does-not-exist.pb.gz") });
  const r3 = await notFoundWeights.getBestMove({ requestId: 1, fen: "bad", fen4: "bad", legalMovesUci: ["e2e4"], skillLevel: "maia-1500", timeoutMs: 100 });
  assert.equal(r3.status, "weights_not_found", "weights_not_found_returns_weights_not_found");
}

async function testLegalAndIllegalBestmove() {
  const config = makeTempConfig();
  const capture = { called: 0 } as any;
  const legalAdapter = new MaiaLc0RuntimeAdapter(config, { spawn: createSpawn("ready", capture) as any });
  const legal = await legalAdapter.getBestMove({
    requestId: 1,
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    fen4: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -",
    legalMovesUci: ["e2e4", "d2d4"],
    skillLevel: "maia-1500",
    timeoutMs: 100,
  });
  assert.equal(legal.status, "ready", "lc0_bestmove_legal_returns_ready_result");
  assert.equal(legal.legal, true);

  const illegalAdapter = new MaiaLc0RuntimeAdapter(config, { spawn: createSpawn("illegal", { called: 0 } as any) as any });
  const illegal = await illegalAdapter.getBestMove({
    requestId: 2,
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    fen4: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -",
    legalMovesUci: ["e2e4", "d2d4"],
    skillLevel: "maia-1500",
    timeoutMs: 100,
  });
  assert.equal(illegal.legal, false);
  assert.equal(illegal.errorReason, "bestmove_illegal", "lc0_bestmove_illegal_returns_error_or_illegal_result");
}

async function testTimeoutAndSpawnSafety() {
  const config = makeTempConfig();
  const capture = { called: 0 } as any;
  const timeoutAdapter = new MaiaLc0RuntimeAdapter(config, { spawn: createSpawn("timeout", capture) as any });
  const timeout = await timeoutAdapter.getBestMove({
    requestId: 3,
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    fen4: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -",
    legalMovesUci: ["e2e4", "d2d4"],
    skillLevel: "maia-1500",
    timeoutMs: 50,
  });
  assert.equal(timeout.status, "timeout", "lc0_timeout_returns_timeout");
  assert.equal(timeout.errorReason, "timeout");

  const overloadedConfig = { ...config, maxConcurrentRequests: 1 };
  const firstCapture = { called: 0 } as any;
  const overloadedAdapter = new MaiaLc0RuntimeAdapter(overloadedConfig, { spawn: createSpawn("delayed_ready", firstCapture) as any });
  const firstPromise = overloadedAdapter.getBestMove({
    requestId: 40,
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    fen4: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -",
    legalMovesUci: ["e2e4", "d2d4"],
    skillLevel: "maia-1500",
    timeoutMs: 200,
  });
  const overloaded = await overloadedAdapter.getBestMove({
    requestId: 41,
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    fen4: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -",
    legalMovesUci: ["e2e4", "d2d4"],
    skillLevel: "maia-1500",
    timeoutMs: 200,
  });
  assert.equal(overloaded.status, "error");
  assert.equal(overloaded.errorReason, "overloaded", "concurrency_limit_returns_overloaded");
  const firstResult = await firstPromise;
  assert.equal(firstResult.status, "ready");

  const readyCapture = { called: 0 } as any;
  const adapter = new MaiaLc0RuntimeAdapter(config, { spawn: createSpawn("ready", readyCapture) as any });
  await adapter.getBestMove({
    requestId: 4,
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    fen4: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -",
    legalMovesUci: ["e2e4", "d2d4"],
    skillLevel: "maia-1500",
    timeoutMs: 100,
  });
  assert.equal(Array.isArray(readyCapture.args), true, "spawn_uses_args_array_not_shell_string");
  assert.equal(readyCapture.options?.shell, false);

  const spawnFailureAdapter = new MaiaLc0RuntimeAdapter(config, {
    spawn: (() => { throw new Error("spawn_failed"); }) as any,
  });
  const spawnFailure = await spawnFailureAdapter.getBestMove({
    requestId: 42,
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    fen4: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -",
    legalMovesUci: ["e2e4", "d2d4"],
    skillLevel: "maia-1500",
    timeoutMs: 100,
  });
  assert.equal(spawnFailure.errorReason, "spawn_failed");
}

async function testStderrAndFenSanitization() {
  const config = makeTempConfig();
  const stderrAdapter = new MaiaLc0RuntimeAdapter(config, { spawn: createSpawn("stderr_only", { called: 0 } as any) as any });
  const stderr = await stderrAdapter.getBestMove({
    requestId: 5,
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    fen4: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -",
    legalMovesUci: ["e2e4", "d2d4"],
    skillLevel: "maia-1500",
    timeoutMs: 100,
  });
  assert.equal(stderr.status, "error", "lc0_stderr_does_not_throw_to_ui");
  assert.equal(stderr.errorReason, "provider_error");

  const capture = { called: 0 } as any;
  const fenAdapter = new MaiaLc0RuntimeAdapter(config, { spawn: createSpawn("ready", capture) as any });
  const invalidFen = await fenAdapter.getBestMove({
    requestId: 6,
    fen: "bad; rm -rf /",
    fen4: "bad",
    legalMovesUci: ["e2e4"],
    skillLevel: "maia-1500",
    timeoutMs: 100,
  });
  assert.equal(invalidFen.errorReason, "invalid_fen", "fen_input_is_not_shell_executed");
  assert.equal(capture.called, 0);
}

async function main() {
  await testRuntimeDisabledReturnsDisabled();
  await testMissingPathStatuses();
  await testLegalAndIllegalBestmove();
  await testTimeoutAndSpawnSafety();
  await testStderrAndFenSanitization();
  console.log("maiaRuntimeAdapter ok");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
