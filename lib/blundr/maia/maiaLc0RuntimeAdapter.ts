import { existsSync } from "node:fs";
import { spawn as spawnChild } from "node:child_process";
import { validateFen } from "chess.js";

import type { MaiaRuntimeConfig, MaiaRuntimeHealth, MaiaRuntimeMoveRequest, MaiaRuntimeMoveResult } from "./maiaRuntimeTypes";
import { buildMaiaRuntimeHealth, evaluateMaiaRuntimeConfig } from "./maiaRuntimeConfig";

type SpawnFn = typeof spawnChild;
let activeMaiaRuntimeRequests = 0;

function tryAcquireMaiaRuntimeRequest(maxConcurrentRequests: number): (() => void) | null {
  if (activeMaiaRuntimeRequests >= Math.max(1, maxConcurrentRequests)) return null;
  activeMaiaRuntimeRequests += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    activeMaiaRuntimeRequests = Math.max(0, activeMaiaRuntimeRequests - 1);
  };
}

function normalizeUci(uci: string): string | null {
  const value = String(uci ?? "").trim().toLowerCase();
  return /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(value) ? value : null;
}

function validateRequestFen(fen: string): boolean {
  const result = validateFen(String(fen ?? ""));
  return Boolean((result as any)?.ok);
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
    return buildMaiaRuntimeHealth(this.config, { status: evaluated.status, lastError: evaluated.errorReason });
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
      return createErrorResult(request, "error", Date.now() - started, "no_legal_moves");
    }
    const releaseRequest = tryAcquireMaiaRuntimeRequest(this.config.maxConcurrentRequests);
    if (!releaseRequest) {
      return createErrorResult(request, "error", Date.now() - started, "overloaded");
    }

    const spawn = this.deps.spawn ?? spawnChild;
    const args = [`--weights=${this.config.weightsPath}`];
    if (this.config.backend) args.push(`--backend=${this.config.backend}`);

    return new Promise<MaiaRuntimeMoveResult>((resolve) => {
      let settled = false;
      let rawBestMoveLine: string | null = null;
      const timeoutMs = Math.max(250, Math.min(5000, request.timeoutMs || this.config.timeoutMs));
      let stderrText = "";
      let stdoutText = "";
      let child: ReturnType<SpawnFn> | null = null;

      const finalize = (result: MaiaRuntimeMoveResult) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        releaseRequest();
        try { child?.kill("SIGKILL"); } catch {}
        resolve(result);
      };

      const timer = setTimeout(() => {
        finalize(createErrorResult(request, "timeout", Date.now() - started, "timeout"));
      }, timeoutMs);

      try {
        child = spawn(this.config.lc0Path as string, args, {
          stdio: ["pipe", "pipe", "pipe"],
          shell: false,
        });
      } catch (err) {
        finalize(createErrorResult(request, "error", Date.now() - started, "spawn_failed"));
        return;
      }

      child.on("error", (err) => {
        finalize(createErrorResult(request, "error", Date.now() - started, "spawn_failed"));
      });

      child.stderr.on("data", (chunk) => {
        stderrText += String(chunk ?? "");
      });

      child.stdout.on("data", (chunk) => {
        const text = String(chunk ?? "");
        stdoutText += text;
        const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
        for (const line of lines) {
          if (line.startsWith("bestmove ")) {
            rawBestMoveLine = line;
            const match = /^bestmove\s+([a-h][1-8][a-h][1-8][qrbn]?)(?:\s+ponder\s+([a-h][1-8][a-h][1-8][qrbn]?))?/i.exec(line);
            const bestMoveUci = normalizeUci(match?.[1] ?? "");
            const ponderUci = normalizeUci(match?.[2] ?? "");
            const legal = Boolean(bestMoveUci && legalUciSet.has(bestMoveUci));
            if (!bestMoveUci) {
              finalize(createErrorResult(request, "error", Date.now() - started, "provider_error"));
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
        finalize(createErrorResult(request, "error", Date.now() - started, "provider_error"));
      });

      try {
        child.stdin.write("uci\n");
        child.stdin.write("isready\n");
        child.stdin.write(`position fen ${request.fen}\n`);
        child.stdin.write(`go nodes ${Math.max(1, this.config.nodes)}\n`);
      } catch (err) {
        finalize(createErrorResult(request, "error", Date.now() - started, "spawn_failed"));
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
