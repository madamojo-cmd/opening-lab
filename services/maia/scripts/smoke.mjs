import assert from "node:assert/strict";

const baseUrl = String(
  process.env.MAIA_SMOKE_URL ?? "http://127.0.0.1:8080",
).replace(/\/$/, "");
const token = String(process.env.MAIA_SERVICE_TOKEN ?? "");
assert.ok(token, "MAIA_SERVICE_TOKEN is required");
const headers = { authorization: `Bearer ${token}` };

const live = await fetch(`${baseUrl}/live`);
assert.equal(live.status, 200);
assert.equal((await live.json()).live, true);

const health = await fetch(`${baseUrl}/health`, {
  headers: { ...headers, "x-blundr-maia-contract": "blundr-maia-health.v1" },
});
assert.equal(health.status, 200);
const healthBody = await health.json();
assert.equal(healthBody.ready, true);
assert.equal(healthBody.contractVersion, "blundr-maia-health.v1");
assert.equal(healthBody.models.verified, 9);

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
const move = await fetch(`${baseUrl}/move`, {
  method: "POST",
  headers: {
    ...headers,
    "content-type": "application/json",
    "x-blundr-maia-contract": "blundr-maia-move.v1",
  },
  body: JSON.stringify({
    requestId: 1,
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    fen4: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -",
    legalMovesUci,
    skillLevel: "maia-1500",
    timeoutMs: 2_500,
    ratingBandId: "club",
    requestedRating: 1500,
  }),
});
assert.equal(move.status, 200);
const result = await move.json();
assert.equal(result.status, "ready");
assert.ok(legalMovesUci.includes(result.bestMoveUci));
assert.equal(result.provenance.model.skillLevel, "maia-1500");
assert.equal(result.provenance.engine.nodes, 1);
console.log(`Maia smoke passed with ${result.bestMoveUci}.`);
