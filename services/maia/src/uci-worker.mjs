import { spawn } from "node:child_process";
import { createInterface } from "node:readline";

import { normalizeUci } from "./contracts.mjs";

function reportsVersion(identity, expectedVersion) {
  const escaped = expectedVersion.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\bv?${escaped}\\b`, "i").test(identity);
}

function reportsCommit(identity, expectedCommit) {
  return identity
    .toLowerCase()
    .includes(`git.${expectedCommit.slice(0, 7).toLowerCase()}`);
}

export class EngineError extends Error {
  constructor(code) {
    super(code);
    this.name = "EngineError";
    this.code = code;
  }
}

export class UciWorker {
  #process = null;
  #stdout = null;
  #waiters = new Set();
  #ready = false;
  #busy = false;
  #closing = false;
  #identity = null;

  constructor({
    binaryPath,
    weightsPath,
    backend,
    startupTimeoutMs,
    expectedEngineVersion,
    expectedEngineCommit,
    logger,
  }) {
    this.binaryPath = binaryPath;
    this.weightsPath = weightsPath;
    this.backend = backend;
    this.startupTimeoutMs = startupTimeoutMs;
    this.expectedEngineVersion = expectedEngineVersion;
    this.expectedEngineCommit = expectedEngineCommit;
    this.logger = logger;
  }

  get ready() {
    return this.#ready && this.#process?.exitCode === null;
  }

  get busy() {
    return this.#busy;
  }

  async start() {
    if (this.ready) return;
    if (this.#process) await this.close();
    this.#closing = false;
    this.#identity = null;
    const args = [
      `--weights=${this.weightsPath}`,
      `--backend=${this.backend}`,
      "--threads=1",
      "--minibatch-size=1",
      "--preload",
    ];
    const child = spawn(this.binaryPath, args, {
      stdio: ["pipe", "pipe", "pipe"],
      shell: false,
      windowsHide: true,
    });
    this.#process = child;
    child.once("error", () =>
      this.#failAll(new EngineError("engine_spawn_failed")),
    );
    child.once("exit", (code, signal) => {
      this.#ready = false;
      if (!this.#closing) {
        this.logger.error("maia_engine_exit", {
          exitCode: code,
          signal: signal ?? "none",
        });
        this.#failAll(new EngineError("engine_exited"));
      }
    });
    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk) => {
      const message = String(chunk).trim().slice(0, 160);
      if (message) this.logger.debug("maia_engine_stderr", { message });
    });
    this.#stdout = createInterface({
      input: child.stdout,
      crlfDelay: Infinity,
    });
    this.#stdout.on("line", (line) => this.#handleLine(line));

    const uciReady = this.#waitFor(
      (line) => line.trim() === "uciok",
      this.startupTimeoutMs,
      "uci_startup_timeout",
    );
    this.#send("uci");
    await uciReady;
    if (
      !this.#identity ||
      !reportsVersion(this.#identity, this.expectedEngineVersion) ||
      !reportsCommit(this.#identity, this.expectedEngineCommit)
    ) {
      await this.close();
      throw new EngineError("engine_version_mismatch");
    }
    await this.#synchronize(this.startupTimeoutMs);
    this.#ready = true;
  }

  async bestMove(fen, timeoutMs) {
    if (!this.ready) await this.start();
    if (this.#busy) throw new EngineError("engine_busy");
    this.#busy = true;
    try {
      this.#send("ucinewgame");
      await this.#synchronize(Math.min(timeoutMs, this.startupTimeoutMs));
      this.#send(`position fen ${fen}`);
      const result = this.#waitFor(
        (line) => {
          const match = /^bestmove\s+(\S+)(?:\s+ponder\s+(\S+))?/i.exec(
            line.trim(),
          );
          if (!match) return false;
          return { bestMoveUci: match[1], ponderUci: match[2] ?? null };
        },
        timeoutMs,
        "engine_timeout",
      );
      this.#send("go nodes 1");
      const move = await result;
      const bestMoveUci = normalizeUci(move.bestMoveUci);
      const ponderUci = normalizeUci(move.ponderUci);
      if (!bestMoveUci) throw new EngineError("engine_bestmove_invalid");
      return { bestMoveUci, ponderUci };
    } catch (error) {
      await this.close();
      throw error;
    } finally {
      this.#busy = false;
    }
  }

  async #synchronize(timeoutMs) {
    const ready = this.#waitFor(
      (line) => line.trim() === "readyok",
      timeoutMs,
      "engine_ready_timeout",
    );
    this.#send("isready");
    await ready;
  }

  #send(command) {
    if (!this.#process?.stdin?.writable) {
      throw new EngineError("engine_stdin_unavailable");
    }
    this.#process.stdin.write(`${command}\n`);
  }

  #waitFor(matcher, timeoutMs, timeoutCode) {
    return new Promise((resolve, reject) => {
      const waiter = {
        matcher,
        resolve,
        reject,
        timer: setTimeout(() => {
          this.#waiters.delete(waiter);
          reject(new EngineError(timeoutCode));
        }, timeoutMs),
      };
      waiter.timer.unref?.();
      this.#waiters.add(waiter);
    });
  }

  #handleLine(line) {
    const identity = /^id name\s+(.+)$/i.exec(line.trim());
    if (identity) this.#identity = identity[1];
    for (const waiter of [...this.#waiters]) {
      let result = false;
      try {
        result = waiter.matcher(line);
      } catch (error) {
        clearTimeout(waiter.timer);
        this.#waiters.delete(waiter);
        waiter.reject(error);
        continue;
      }
      if (result === false) continue;
      clearTimeout(waiter.timer);
      this.#waiters.delete(waiter);
      waiter.resolve(result === true ? line : result);
    }
  }

  #failAll(error) {
    for (const waiter of this.#waiters) {
      clearTimeout(waiter.timer);
      waiter.reject(error);
    }
    this.#waiters.clear();
  }

  async close() {
    const child = this.#process;
    this.#ready = false;
    this.#closing = true;
    this.#failAll(new EngineError("engine_closed"));
    this.#stdout?.close();
    this.#stdout = null;
    this.#process = null;
    if (!child || child.exitCode !== null) return;
    const exited = new Promise((resolve) => child.once("exit", resolve));
    child.kill("SIGTERM");
    const killTimer = setTimeout(() => child.kill("SIGKILL"), 2_000);
    killTimer.unref?.();
    await exited;
    clearTimeout(killTimer);
  }
}
