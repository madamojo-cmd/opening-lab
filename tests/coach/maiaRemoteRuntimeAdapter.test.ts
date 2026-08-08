import assert from "node:assert/strict";

import { MaiaRemoteRuntimeAdapter } from "../../lib/blundr/maia/maiaRemoteRuntimeAdapter";
import {
  evaluateMaiaRuntimeConfig,
  readMaiaRuntimeConfig,
} from "../../lib/blundr/maia/maiaRuntimeConfig";
import type { MaiaRuntimeConfig } from "../../lib/blundr/maia/maiaRuntimeTypes";

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

async function main() {
  const ready = new MaiaRemoteRuntimeAdapter(config, {
    fetch: async (_url, init) => {
      assert.equal(
        (init?.headers as Record<string, string>).authorization,
        "Bearer test-token",
      );
      return Response.json({
        requestId: 17,
        fen4: request.fen4,
        skillLevel: "maia-1500",
        bestMoveUci: "e2e4",
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
      }),
  });
  assert.equal(
    (await illegal.getBestMove(request)).errorReason,
    "bestmove_illegal",
  );

  const health = new MaiaRemoteRuntimeAdapter(config, {
    fetch: async () => Response.json({ ready: true }),
  });
  assert.equal((await health.health()).ready, true);

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
