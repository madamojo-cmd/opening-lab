import { existsSync } from "node:fs";
import { spawn as spawnChild } from "node:child_process";
import { Chess, validateFen } from "chess.js";

import type { MaiaRuntimeConfig, MaiaRuntimeHealth, MaiaRuntimeMoveRequest, MaiaRuntimeMoveResult } from "./maiaRuntimeTypes";
import { buildMaiaRuntimeHealth, evaluateMaiaRuntimeConfig } from "./maiaRuntimeConfig";

type SpawnFn = typeof spawnChild;

function normalizeUci(uci: string): string | null {
  const value = String(uci ?? "").trim().toLowerCase();
  return /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(value) ? value : null;
}

function validateRequestFen(fen: string): boolean {
  const result = validateFen(String(fen ?? ""));
  return Boolean((result as any)?.ok);
}

function toFen4(fen: string): string {
  return String(fen || "").split(" ").slice(0, 4).join(" ");
}

function createErrorResult(request: MaiaRuntimeMoveRequest, status: MaiaRuntimeMoveResult["status"], runtimeMs: number, errorReason: string): MaiaRuntimeMoveResult {
  return {
    status,
    requestId: request.requestId,
    fen4: request.fen4,
    skillLevel: request.skillLevel,
    bestMoveUci: null,
    legal: false,
    errorReason,
    runtimeMs,
  };
}

export class MaiaLc0RuntimeAdapter {
  readonly providerName = "maia-lc0-runtime";
  readonly providerVersion = "14B";

  constructor(
    private readonly config: MaiaRuntimeConfig,
    private readonly deps: { spawn?: SpawnFn } = {},
  ) {}

  async health(): Promise<MaiaRuntimeHealth> {
    const evaluated = evaluateMaiaRuntimeConfig(this.config);
    if (evaluated.status !== "ready") {
      return buildMaiaRuntimeHealth(this.config, { status: evaluated.status, lastError: evaluated.errorReason });
    }
    const request: MaiaRuntimeMoveRequest = {
      requestId: 0,
      fen: new Chess().fen(),
      fen4: toFen4(new Chess().fen()),
      legalMovesUci: ["e2e4", "d2d4", "g1f3", "c2c4"],
      skillLevel: this.config.skillLevel,
      timeoutMs: Math.min(1200, this.config.timeoutMs),
    };
    const result = await this.getBestMove(request);
    if (result.status !== "ready") {
      return buildMaiaRuntimeHealth(this.config, { status: result.status, lastError: result.errorReason });
    }
    return buildMaiaRuntimeHealth(this.config, { status: "ready", lastError: null });
  }

  async getBestMove(request: MaiaRuntimeMoveRequest): Promise<MaiaRuntimeMoveResult> {
    const started = Date.now();
    const evaluated = evaluateMaiaRuntimeConfig(this.config);
    if (evaluated.status !== "ready") {
      return createErrorResult(request, evaluated.status, Date.now() - started, evaluated.errorReason ?? "runtime_unavailable");
    }
    if (!validateRequestFen(request.fen)) {
      return createErrorResult(request, "error", Date.now() - started, "invalid_fen");
    }
    const legalUciSet = new Set((request.legalMovesUci ?? []).map((move) => normalizeUci(move)).filter(Boolean) as string[]);
    if (!legalUciSet.size) {
      return createErrorResult(request, "error", Date.now() - started, "empty_legal_moves");
    }

    const spawn = this.deps.spawn ?? spawnChild;
    const args = [`--weights=${this.config.weightsPath}`];
    if (this.config.backend) args.push(`--backend=${this.config.backend}`);

    return new Promise<MaiaRuntimeMoveResult>((resolve) => {
      let settled = false;
      let sawUciOk = false;
      let sawReadyOk = false;
      let rawBestMoveLine: string | null = null;
      const timeoutMs = Math.max(250, Math.min(5000, request.timeoutMs || this.config.timeoutMs));
      let stderrText = "";
      let stdoutText = "";

      const child = spawn(this.config.lc0Path as string, args, {
        stdio: ["pipe", "pipe", "pipe"],
        shell: false,
      });

      const finalize = (result: MaiaRuntimeMoveResult) => {
        if (settled) return;
        settled = true;
        try { child.kill("SIGKILL"); } catch {}
        resolve(result);
      };

      const timer = setTimeout(() => {
        finalize(createErrorResult(request, "timeout", Date.now() - started, "runtime_timeout"));
      }, timeoutMs);

      const cleanupTimer = () => clearTimeout(timer);

      child.on("error", (err) => {
        cleanupTimer();
        finalize(createErrorResult(request, "startup_failed", Date.now() - started, err instanceof Error ? err.message : "startup_failed"));
      });

      child.stderr.on("data", (chunk) => {
        stderrText += String(chunk ?? "");
      });

      child.stdout.on("data", (chunk) => {
        const text = String(chunk ?? "");
        stdoutText += text;
        const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
        for (const line of lines) {
          if (line === "uciok") sawUciOk = true;
          if (line === "readyok") sawReadyOk = true;
          if (line.startsWith("bestmove ")) {
            rawBestMoveLine = line;
            const match = /^bestmove\s+([a-h][1-8][a-h][1-8][qrbn]?)(?:\s+ponder\s+([a-h][1-8][a-h][1-8][qrbn]?))?/i.exec(line);
            const bestMoveUci = normalizeUci(match?.[1] ?? "");
            const ponderUci = normalizeUci(match?.[2] ?? "");
            const legal = Boolean(bestMoveUci && legalUciSet.has(bestMoveUci));
            cleanupTimer();
            if (!bestMoveUci) {
              finalize(createErrorResult(request, "error", Date.now() - started, "bestmove_missing"));
              return;
            }
            if (!legal) {
              finalize({
                status: "error",
                requestId: request.requestId,
                fen4: request.fen4,
                skillLevel: request.skillLevel,
                bestMoveUci,
                ponderUci,
                rawBestMoveLine,
                legal: false,
                errorReason: "bestmove_illegal",
                runtimeMs: Date.now() - started,
              });
              return;
            }
            finalize({
              status: "ready",
              requestId: request.requestId,
              fen4: request.fen4,
              skillLevel: request.skillLevel,
              bestMoveUci,
              ponderUci,
              rawBestMoveLine,
              legal: true,
              errorReason: null,
              runtimeMs: Date.now() - started,
            });
            return;
          }
        }
      });

      child.on("exit", () => {
        if (settled) return;
        cleanupTimer();
        if (!sawUciOk || !sawReadyOk) {
          finalize(createErrorResult(request, "uci_not_ready", Date.now() - started, stderrText || "uci_not_ready"));
          return;
        }
        finalize(createErrorResult(request, "error", Date.now() - started, rawBestMoveLine ? "bestmove_parse_failed" : (stderrText || stdoutText || "runtime_exit_without_bestmove")));
      });

      try {
        child.stdin.write("uci\n");
        child.stdin.write("isready\n");
        child.stdin.write(`position fen ${request.fen}\n`);
        child.stdin.write(`go nodes ${Math.max(1, this.config.nodes)}\n`);
      } catch (err) {
        cleanupTimer();
        finalize(createErrorResult(request, "startup_failed", Date.now() - started, err instanceof Error ? err.message : "stdin_write_failed"));
      }
    });
  }
}

export function runtimeConfigHasFiles(config: MaiaRuntimeConfig): { lc0Exists: boolean; weightsExists: boolean } {
  return {
    lc0Exists: Boolean(config.lc0Path && existsSync(config.lc0Path)),
    weightsExists: Boolean(config.weightsPath && existsSync(config.weightsPath)),
  };
}
