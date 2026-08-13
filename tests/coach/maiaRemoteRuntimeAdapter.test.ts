import assert from "node:assert/strict";

import { MaiaRemoteRuntimeAdapter } from "../../lib/blundr/maia/maiaRemoteRuntimeAdapter";
import {
  evaluateMaiaRuntimeConfig,
  readMaiaRuntimeConfig,
} from "../../lib/blundr/maia/maiaRuntimeConfig";
import type { MaiaRuntimeConfig } from "../../lib/blundr/maia/maiaRuntimeTypes";
import {
  BLUNDR_MAIA_ENGINE_COMMIT,
  BLUNDR_MAIA_ENGINE_VERSION,
  BLUNDR_MAIA_HEALTH_CONTRACT,
  BLUNDR_MAIA_MODEL_SHA256,
  BLUNDR_MAIA_MOVE_CONTRACT,
  BLUNDR_MAIA_PROVIDER_COMMIT,
  BLUNDR_MAIA_PROVIDER_NAME,
  BLUNDR_MAIA_SERVICE_VERSION,
} from "../../lib/blundr/maia/maiaRemoteContract";

const config: MaiaRuntimeConfig = {
  enabled: true,
  lc0Path: null,
  weightsPath: null,
  skillLevel: "maia-1500",
  timeoutMs: 1500,
  nodes: 1,
  maxConcurrentRequests: 2,
  cacheEnabled: true,
  transport: "remote",
  remoteUrl: "https://maia.example.test/move",
  remoteHealthUrl: "https://maia.example.test/health",
  remoteToken: "test-token",
};

const request = {
  requestId: 17,
  fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  fen4: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -",
  legalMovesUci: ["e2e4", "d2d4"],
  skillLevel: "maia-1500" as const,
  timeoutMs: 1500,
};

const provenance = {
  contractVersion: BLUNDR_MAIA_MOVE_CONTRACT,
  service: {
    name: "blundr-maia-service",
    version: BLUNDR_MAIA_SERVICE_VERSION,
  },
  provider: {
    name: BLUNDR_MAIA_PROVIDER_NAME,
    sourceCommit: BLUNDR_MAIA_PROVIDER_COMMIT,
  },
  model: {
    id: "csslab-maia-v1-1500",
    skillLevel: "maia-1500",
    sha256: BLUNDR_MAIA_MODEL_SHA256["maia-1500"],
  },
  engine: {
    name: "lc0",
    version: BLUNDR_MAIA_ENGINE_VERSION,
    commit: BLUNDR_MAIA_ENGINE_COMMIT,
    search: "classic",
    nodes: 1,
    backend: "blas",
  },
};

const healthResponse = {
  contractVersion: BLUNDR_MAIA_HEALTH_CONTRACT,
  ready: true,
  service: {
    name: "blundr-maia-service",
    version: BLUNDR_MAIA_SERVICE_VERSION,
  },
  provider: {
    name: BLUNDR_MAIA_PROVIDER_NAME,
    sourceCommit: BLUNDR_MAIA_PROVIDER_COMMIT,
  },
  engine: {
    name: "lc0",
    version: BLUNDR_MAIA_ENGINE_VERSION,
    commit: BLUNDR_MAIA_ENGINE_COMMIT,
    search: "classic",
    nodes: 1,
  },
  models: {
    verified: 9,
    availableSkills: Object.keys(BLUNDR_MAIA_MODEL_SHA256),
  },
};

async function main() {
  const ready = new MaiaRemoteRuntimeAdapter(config, {
    fetch: async (_url, init) => {
      assert.equal(
        (init?.headers as Record<string, string>).authorization,
        "Bearer test-token",
      );
      assert.equal(
        (init?.headers as Record<string, string>)["x-blundr-maia-contract"],
        BLUNDR_MAIA_MOVE_CONTRACT,
      );
      return Response.json({
        requestId: 17,
        fen4: request.fen4,
        skillLevel: "maia-1500",
        bestMoveUci: "e2e4",
        status: "ready",
        legal: true,
        provenance,
      });
    },
  });
  assert.deepEqual((await ready.getBestMove(request)).bestMoveUci, "e2e4");

  const mismatched = new MaiaRemoteRuntimeAdapter(config, {
    fetch: async () =>
      Response.json({
        requestId: 18,
        fen4: request.fen4,
        skillLevel: "maia-1500",
        bestMoveUci: "e2e4",
        status: "ready",
        legal: true,
        provenance,
      }),
  });
  assert.equal(
    (await mismatched.getBestMove(request)).errorReason,
    "response_frame_mismatch",
  );

  const illegal = new MaiaRemoteRuntimeAdapter(config, {
    fetch: async () =>
      Response.json({
        requestId: 17,
        fen4: request.fen4,
        skillLevel: "maia-1500",
        bestMoveUci: "e2e5",
        status: "ready",
        legal: true,
        provenance,
      }),
  });
  assert.equal(
    (await illegal.getBestMove(request)).errorReason,
    "bestmove_illegal",
  );

  const unproven = new MaiaRemoteRuntimeAdapter(config, {
    fetch: async () =>
      Response.json({
        requestId: 17,
        fen4: request.fen4,
        skillLevel: "maia-1500",
        bestMoveUci: "e2e4",
        status: "ready",
        legal: true,
      }),
  });
  assert.equal(
    (await unproven.getBestMove(request)).errorReason,
    "response_provenance_mismatch",
  );

  const health = new MaiaRemoteRuntimeAdapter(config, {
    fetch: async (_url, init) => {
      assert.equal(
        (init?.headers as Record<string, string>)["x-blundr-maia-contract"],
        BLUNDR_MAIA_HEALTH_CONTRACT,
      );
      return Response.json(healthResponse);
    },
  });
  const healthResult = await health.health();
  assert.equal(healthResult.ready, true);
  assert.equal(
    healthResult.remoteEvidence?.providerCommit,
    BLUNDR_MAIA_PROVIDER_COMMIT,
  );
  assert.equal(
    evaluateMaiaRuntimeConfig({
      ...config,
      remoteHealthUrl: "http://maia.internal/health",
    }).errorReason,
    "insecure_remote_url",
  );

  const previous = {
    nodeEnv: process.env.NODE_ENV,
    enabled: process.env.MAIA_ENABLED,
    remoteUrl: process.env.MAIA_REMOTE_URL,
    remoteToken: process.env.MAIA_REMOTE_TOKEN,
  };
  try {
    process.env.NODE_ENV = "production";
    process.env.MAIA_ENABLED = "true";
    delete process.env.MAIA_REMOTE_URL;
    delete process.env.MAIA_REMOTE_TOKEN;
    assert.equal(
      evaluateMaiaRuntimeConfig(readMaiaRuntimeConfig()).errorReason,
      "missing_remote_url",
    );
    process.env.MAIA_REMOTE_URL = "http://maia.internal/move";
    process.env.MAIA_REMOTE_TOKEN = "token";
    assert.equal(
      evaluateMaiaRuntimeConfig(readMaiaRuntimeConfig()).errorReason,
      "insecure_remote_url",
    );
  } finally {
    if (previous.nodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previous.nodeEnv;
    if (previous.enabled === undefined) delete process.env.MAIA_ENABLED;
    else process.env.MAIA_ENABLED = previous.enabled;
    if (previous.remoteUrl === undefined) delete process.env.MAIA_REMOTE_URL;
    else process.env.MAIA_REMOTE_URL = previous.remoteUrl;
    if (previous.remoteToken === undefined)
      delete process.env.MAIA_REMOTE_TOKEN;
    else process.env.MAIA_REMOTE_TOKEN = previous.remoteToken;
  }
  console.log("maiaRemoteRuntimeAdapter ok");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
