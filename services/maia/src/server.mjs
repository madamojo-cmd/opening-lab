import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import { createServer } from "node:http";

import {
  ContractError,
  HEALTH_CONTRACT_VERSION,
  MOVE_CONTRACT_VERSION,
  validateMoveRequest,
} from "./contracts.mjs";
import { CapacityError } from "./engine-pool.mjs";
import { Metrics } from "./metrics.mjs";

const SERVICE_NAME = "blundr-maia-service";

function tokenDigest(value) {
  return createHash("sha256").update(String(value), "utf8").digest();
}

function isAuthorized(request, expectedToken) {
  const header = String(request.headers.authorization ?? "");
  const match = /^Bearer\s+(.+)$/i.exec(header);
  if (!match) return false;
  return timingSafeEqual(tokenDigest(match[1]), tokenDigest(expectedToken));
}

function setSecurityHeaders(response, requestId, contentType) {
  response.setHeader("cache-control", "no-store");
  response.setHeader("content-type", contentType);
  response.setHeader("content-security-policy", "default-src 'none'");
  response.setHeader("referrer-policy", "no-referrer");
  response.setHeader("x-content-type-options", "nosniff");
  response.setHeader("x-request-id", requestId);
}

function json(response, status, body, requestId) {
  const payload = JSON.stringify(body);
  response.statusCode = status;
  setSecurityHeaders(response, requestId, "application/json; charset=utf-8");
  response.setHeader("content-length", Buffer.byteLength(payload));
  response.end(payload);
}

function text(response, status, body, requestId, contentType) {
  response.statusCode = status;
  setSecurityHeaders(response, requestId, contentType);
  response.setHeader("content-length", Buffer.byteLength(body));
  response.end(body);
}

async function readJson(request, maxBodyBytes) {
  const contentType = String(request.headers["content-type"] ?? "")
    .split(";", 1)[0]
    .trim()
    .toLowerCase();
  if (contentType !== "application/json") {
    throw new ContractError("content_type_must_be_json", 415);
  }
  const declared = Number(request.headers["content-length"] ?? 0);
  if (Number.isFinite(declared) && declared > maxBodyBytes) {
    throw new ContractError("request_too_large", 413);
  }
  const chunks = [];
  let bytes = 0;
  for await (const chunk of request) {
    bytes += chunk.byteLength;
    if (bytes > maxBodyBytes) {
      throw new ContractError("request_too_large", 413);
    }
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new ContractError("invalid_json");
  }
}

function provenance(manifest, model, backend) {
  return {
    contractVersion: MOVE_CONTRACT_VERSION,
    service: {
      name: SERVICE_NAME,
      version: manifest.serviceVersion,
    },
    provider: {
      name: manifest.modelFamily,
      sourceCommit: manifest.source.commit,
    },
    model: {
      id: model.id,
      skillLevel: model.skillLevel,
      sha256: model.sha256,
    },
    engine: {
      name: manifest.engine.name,
      version: manifest.engine.version,
      commit: manifest.engine.commit,
      search: manifest.engine.search,
      nodes: manifest.engine.nodes,
      backend,
    },
  };
}

function healthPayload(manifest, models, backend, poolHealth) {
  return {
    contractVersion: HEALTH_CONTRACT_VERSION,
    ready: poolHealth.ready === true,
    service: {
      name: SERVICE_NAME,
      version: manifest.serviceVersion,
    },
    provider: {
      name: manifest.modelFamily,
      sourceCommit: manifest.source.commit,
    },
    engine: {
      name: manifest.engine.name,
      version: manifest.engine.version,
      commit: manifest.engine.commit,
      search: manifest.engine.search,
      nodes: manifest.engine.nodes,
      backend,
    },
    models: {
      verified: models.size,
      availableSkills: [...models.keys()].sort(),
      loadedSkills: poolHealth.loadedSkills ?? [],
    },
    capacity: {
      activeRequests: poolHealth.activeRequests ?? 0,
      queuedRequests: poolHealth.queuedRequests ?? 0,
    },
    lastProbeAt: poolHealth.lastProbeAt ?? null,
    lastError: poolHealth.lastError ?? null,
  };
}

function routeName(method, pathname) {
  if (method === "GET" && pathname === "/live") return "live";
  if (method === "GET" && pathname === "/ready") return "ready";
  if (method === "GET" && pathname === "/health") return "health";
  if (method === "GET" && pathname === "/metrics") return "metrics";
  if (method === "POST" && (pathname === "/move" || pathname === "/v1/move")) {
    return "move";
  }
  return "not_found";
}

export function createMaiaServer({
  config,
  manifest,
  models,
  enginePool,
  logger,
}) {
  const metrics = new Metrics();
  const server = createServer(async (request, response) => {
    const started = performance.now();
    const requestId = /^[a-zA-Z0-9._-]{1,80}$/.test(
      String(request.headers["x-request-id"] ?? ""),
    )
      ? String(request.headers["x-request-id"])
      : randomUUID();
    let route = "not_found";
    let status = 500;
    try {
      const url = new URL(request.url ?? "/", "http://maia.internal");
      route = routeName(request.method ?? "GET", url.pathname);
      if (route === "live") {
        status = 200;
        return json(
          response,
          status,
          {
            live: true,
            service: SERVICE_NAME,
            version: manifest.serviceVersion,
          },
          requestId,
        );
      }
      if (route === "ready") {
        const ready = enginePool.health().ready === true;
        status = ready ? 200 : 503;
        return json(response, status, { ready }, requestId);
      }

      if (route === "not_found") {
        status = 404;
        return json(response, status, { error: "not_found" }, requestId);
      }
      if (!isAuthorized(request, config.token)) {
        status = 401;
        response.setHeader("www-authenticate", "Bearer");
        return json(response, status, { error: "unauthorized" }, requestId);
      }

      if (route === "health") {
        if (
          request.headers["x-blundr-maia-contract"] !== HEALTH_CONTRACT_VERSION
        ) {
          throw new ContractError("contract_version_mismatch");
        }
        const payload = healthPayload(
          manifest,
          models,
          config.backend,
          enginePool.health(),
        );
        status = payload.ready ? 200 : 503;
        return json(response, status, payload, requestId);
      }
      if (route === "metrics") {
        const poolHealth = enginePool.health();
        metrics.set(
          "blundr_maia_active_requests",
          poolHealth.activeRequests ?? 0,
        );
        metrics.set(
          "blundr_maia_queued_requests",
          poolHealth.queuedRequests ?? 0,
        );
        metrics.set(
          "blundr_maia_loaded_models",
          poolHealth.loadedSkills?.length ?? 0,
        );
        status = 200;
        return text(
          response,
          status,
          metrics.render(),
          requestId,
          "text/plain; version=0.0.4; charset=utf-8",
        );
      }

      if (request.headers["x-blundr-maia-contract"] !== MOVE_CONTRACT_VERSION) {
        throw new ContractError("contract_version_mismatch");
      }
      const body = await readJson(request, config.maxBodyBytes);
      const input = validateMoveRequest(body);
      const model = models.get(input.skillLevel);
      if (!model) throw new Error("model_not_found");
      const engineStarted = performance.now();
      const result = await enginePool.bestMove(input);
      const runtimeMs = Math.max(
        0,
        Math.round(performance.now() - engineStarted),
      );
      if (!input.legalMoveSet.has(result.bestMoveUci)) {
        throw new Error("engine_bestmove_illegal");
      }
      metrics.increment("blundr_maia_moves_total", {
        skill: input.skillLevel,
        status: "ready",
      });
      metrics.increment("blundr_maia_move_duration_ms_sum", {}, runtimeMs);
      metrics.increment("blundr_maia_move_duration_ms_count");
      status = 200;
      return json(
        response,
        status,
        {
          status: "ready",
          requestId: input.requestId,
          fen4: input.fen4,
          skillLevel: input.skillLevel,
          ratingBandId: input.ratingBandId,
          requestedRating: input.requestedRating,
          bestMoveUci: result.bestMoveUci,
          ponderUci: result.ponderUci,
          legal: true,
          runtimeMs,
          provenance: provenance(manifest, model, config.backend),
        },
        requestId,
      );
    } catch (error) {
      const code = String(error?.code ?? error?.message ?? "internal_error");
      status =
        error instanceof ContractError
          ? error.status
          : error instanceof CapacityError
            ? 503
            : /timeout/.test(code)
              ? 504
              : 503;
      metrics.increment("blundr_maia_requests_failed_total", {
        route,
        code,
      });
      if (status >= 500)
        logger.error("maia_request_failed", { route, code, status, requestId });
      else
        logger.warn("maia_request_rejected", {
          route,
          code,
          status,
          requestId,
        });
      return json(response, status, { error: code, requestId }, requestId);
    } finally {
      const durationMs = Math.max(0, Math.round(performance.now() - started));
      metrics.increment("blundr_maia_http_requests_total", {
        route,
        status: String(status),
      });
      logger.info("maia_request_finished", {
        route,
        status,
        durationMs,
        requestId,
      });
    }
  });

  server.keepAliveTimeout = 5_000;
  server.headersTimeout = 7_000;
  server.requestTimeout = 7_000;
  server.maxRequestsPerSocket = 1_000;
  return server;
}
