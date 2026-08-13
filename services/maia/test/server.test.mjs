import assert from "node:assert/strict";
import { once } from "node:events";
import { after, before, describe, it } from "node:test";

import { createLogger } from "../src/logger.mjs";
import { loadManifest } from "../src/manifest.mjs";
import { createMaiaServer } from "../src/server.mjs";

const token = "test-token-that-is-longer-than-thirty-two-bytes";
const legalMovesUci = [
  "a2a3",
  "a2a4",
  "b2b3",
  "b2b4",
  "c2c3",
  "c2c4",
  "d2d3",
  "d2d4",
  "e2e3",
  "e2e4",
  "f2f3",
  "f2f4",
  "g2g3",
  "g2g4",
  "h2h3",
  "h2h4",
  "b1a3",
  "b1c3",
  "g1f3",
  "g1h3",
];

function moveRequest(overrides = {}) {
  return {
    requestId: 9,
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    fen4: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -",
    legalMovesUci,
    skillLevel: "maia-1500",
    timeoutMs: 2_500,
    ratingBandId: "club",
    requestedRating: 1500,
    ...overrides,
  };
}

describe("Maia HTTP service", () => {
  let server;
  let baseUrl;
  let manifest;

  before(async () => {
    manifest = await loadManifest();
    const models = new Map(
      manifest.models.map((model) => [
        model.skillLevel,
        { ...model, path: model.file },
      ]),
    );
    const enginePool = {
      health: () => ({
        ready: true,
        lastProbeAt: "2026-08-13T00:00:00.000Z",
        lastError: null,
        activeRequests: 0,
        queuedRequests: 0,
        loadedSkills: ["maia-1500"],
      }),
      bestMove: async () => ({ bestMoveUci: "e2e4", ponderUci: "e7e5" }),
    };
    const config = {
      token,
      backend: "blas",
      maxBodyBytes: 65_536,
    };
    const sink = { debug() {}, info() {}, warn() {}, error() {}, log() {} };
    server = createMaiaServer({
      config,
      manifest,
      models,
      enginePool,
      logger: createLogger("error", sink),
    });
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  after(async () => {
    server.close();
    await once(server, "close");
  });

  it("exposes only boolean probes without authentication", async () => {
    const live = await fetch(`${baseUrl}/live`);
    assert.equal(live.status, 200);
    const ready = await fetch(`${baseUrl}/ready`);
    assert.equal(ready.status, 200);
    assert.deepEqual(await ready.json(), { ready: true });
    const health = await fetch(`${baseUrl}/health`);
    assert.equal(health.status, 401);
  });

  it("returns pinned readiness provenance", async () => {
    const response = await fetch(`${baseUrl}/health`, {
      headers: {
        authorization: `Bearer ${token}`,
        "x-blundr-maia-contract": "blundr-maia-health.v1",
      },
    });
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.contractVersion, "blundr-maia-health.v1");
    assert.equal(body.provider.sourceCommit, manifest.source.commit);
    assert.equal(body.models.verified, 9);
  });

  it("returns an exact-frame legal move with full provenance", async () => {
    const response = await fetch(`${baseUrl}/move`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
        "x-blundr-maia-contract": "blundr-maia-move.v1",
      },
      body: JSON.stringify(moveRequest()),
    });
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.bestMoveUci, "e2e4");
    assert.equal(body.provenance.model.id, "csslab-maia-v1-1500");
    assert.equal(body.provenance.engine.nodes, 1);
  });

  it("rejects a caller-provided partial legal set", async () => {
    const response = await fetch(`${baseUrl}/move`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
        "x-blundr-maia-contract": "blundr-maia-move.v1",
      },
      body: JSON.stringify(moveRequest({ legalMovesUci: ["e2e4"] })),
    });
    assert.equal(response.status, 422);
    assert.equal((await response.json()).error, "legal_set_mismatch");
  });
});
