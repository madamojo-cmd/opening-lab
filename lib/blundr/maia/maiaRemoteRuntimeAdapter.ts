import { validateFen } from "chess.js";

import {
  buildMaiaRuntimeHealth,
  evaluateMaiaRuntimeConfig,
} from "./maiaRuntimeConfig";
import type {
  MaiaRuntimeConfig,
  MaiaRuntimeHealth,
  MaiaRuntimeMoveRequest,
  MaiaRuntimeMoveResult,
} from "./maiaRuntimeTypes";
import {
  BLUNDR_MAIA_HEALTH_CONTRACT,
  BLUNDR_MAIA_MOVE_CONTRACT,
  BLUNDR_MAIA_SERVICE_VERSION,
  parseMaiaRemoteHealth,
  parseMaiaRemoteProvenance,
} from "./maiaRemoteContract";

type FetchFn = typeof fetch;

function errorResult(
  request: MaiaRuntimeMoveRequest,
  status: MaiaRuntimeMoveResult["status"],
  errorReason: string,
  started: number,
): MaiaRuntimeMoveResult {
  return {
    status,
    requestId: request.requestId,
    fen4: request.fen4,
    skillLevel: request.skillLevel,
    bestMoveUci: null,
    legal: false,
    errorReason,
    runtimeMs: Date.now() - started,
  };
}

function normalizeUci(value: unknown): string | null {
  const uci = String(value ?? "")
    .trim()
    .toLowerCase();
  return /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(uci) ? uci : null;
}

export class MaiaRemoteRuntimeAdapter {
  readonly providerName = "maia-remote-runtime";
  readonly providerVersion = BLUNDR_MAIA_SERVICE_VERSION;

  constructor(
    private readonly config: MaiaRuntimeConfig,
    private readonly deps: { fetch?: FetchFn } = {},
  ) {}

  async health(): Promise<MaiaRuntimeHealth> {
    const evaluated = evaluateMaiaRuntimeConfig(this.config);
    if (evaluated.status !== "ready")
      return buildMaiaRuntimeHealth(this.config, {
        status: evaluated.status,
        lastError: evaluated.errorReason,
      });
    const endpoint =
      this.config.remoteHealthUrl ??
      new URL("./health", this.config.remoteUrl as string).toString();
    try {
      const response = await (this.deps.fetch ?? fetch)(endpoint, {
        method: "GET",
        headers: {
          authorization: `Bearer ${this.config.remoteToken}`,
          "x-blundr-maia-contract": BLUNDR_MAIA_HEALTH_CONTRACT,
        },
        signal: AbortSignal.timeout(Math.min(this.config.timeoutMs, 2_000)),
        cache: "no-store",
      });
      const body = (await response.json().catch(() => null)) as {
        ready?: unknown;
      } | null;
      const remoteEvidence = parseMaiaRemoteHealth(body);
      if (!response.ok || !remoteEvidence)
        return buildMaiaRuntimeHealth(this.config, {
          status: "remote_unreachable",
          lastError: "remote_health_unavailable",
        });
      return {
        ...buildMaiaRuntimeHealth(this.config, {
          status: "ready",
          lastError: null,
        }),
        remoteEvidence,
      };
    } catch {
      return buildMaiaRuntimeHealth(this.config, {
        status: "remote_unreachable",
        lastError: "remote_health_unavailable",
      });
    }
  }

  async getBestMove(
    request: MaiaRuntimeMoveRequest,
  ): Promise<MaiaRuntimeMoveResult> {
    const started = Date.now();
    const evaluated = evaluateMaiaRuntimeConfig(this.config);
    if (evaluated.status !== "ready")
      return errorResult(
        request,
        evaluated.status,
        evaluated.errorReason ?? "runtime_unavailable",
        started,
      );
    if (!validateFen(request.fen).ok)
      return errorResult(request, "error", "invalid_fen", started);
    const legalMoves = new Set(request.legalMovesUci.map(normalizeUci));
    try {
      const response = await (this.deps.fetch ?? fetch)(
        this.config.remoteUrl as string,
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${this.config.remoteToken}`,
            "content-type": "application/json",
            "x-blundr-maia-contract": BLUNDR_MAIA_MOVE_CONTRACT,
          },
          body: JSON.stringify(request),
          signal: AbortSignal.timeout(
            Math.min(request.timeoutMs, this.config.timeoutMs),
          ),
          cache: "no-store",
        },
      );
      const body = (await response.json().catch(() => null)) as Record<
        string,
        unknown
      > | null;
      if (!response.ok || !body)
        return errorResult(request, "error", "provider_error", started);
      if (body.status !== "ready" || body.legal !== true)
        return errorResult(request, "error", "provider_error", started);
      const provenance = parseMaiaRemoteProvenance(
        body.provenance,
        request.skillLevel,
      );
      if (!provenance)
        return errorResult(
          request,
          "error",
          "response_provenance_mismatch",
          started,
        );
      if (
        Number(body.requestId) !== request.requestId ||
        String(body.fen4 ?? "") !== request.fen4 ||
        String(body.skillLevel ?? "") !== request.skillLevel
      )
        return errorResult(
          request,
          "error",
          "response_frame_mismatch",
          started,
        );
      const selected = body.selectedCandidate as
        | Record<string, unknown>
        | null
        | undefined;
      const bestMoveUci = normalizeUci(
        body.bestMoveUci ?? selected?.uci ?? null,
      );
      if (!bestMoveUci)
        return errorResult(request, "error", "provider_error", started);
      if (!legalMoves.has(bestMoveUci))
        return {
          ...errorResult(request, "error", "bestmove_illegal", started),
          bestMoveUci,
        };
      return {
        status: "ready",
        requestId: request.requestId,
        fen4: request.fen4,
        skillLevel: request.skillLevel,
        bestMoveUci,
        ponderUci: normalizeUci(body.ponderUci),
        legal: true,
        errorReason: null,
        runtimeMs: Date.now() - started,
        provenance,
      };
    } catch (error) {
      return errorResult(
        request,
        error instanceof Error &&
          (error.name === "TimeoutError" || error.name === "AbortError")
          ? "timeout"
          : "error",
        error instanceof Error &&
          (error.name === "TimeoutError" || error.name === "AbortError")
          ? "timeout"
          : "provider_error",
        started,
      );
    }
  }
}
