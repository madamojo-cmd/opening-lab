import assert from "node:assert/strict";
import test from "node:test";
import { POST as telemetryPost } from "@/app/api/blundr/telemetry/route";

test("public telemetry accepts auth hydration but rejects server-owned events", async () => {
  const invalid = await telemetryPost(
    new Request("http://blundr.local/api/blundr/telemetry", {
      method: "POST",
      body: JSON.stringify({
        name: "not_a_real_event",
        payload: { token: "secret" },
      }),
      headers: { "content-type": "application/json" },
    }),
  );
  assert.equal(invalid.status, 400);
  const valid = await telemetryPost(
    new Request("http://blundr.local/api/blundr/telemetry", {
      method: "POST",
      body: JSON.stringify({
        name: "AUTH_HYDRATION_COMPLETED",
        payload: {
          durationMs: 12,
          internalId: "id-1",
          nested: { secret: true },
        },
      }),
      headers: { "content-type": "application/json" },
    }),
  );
  assert.equal(valid.status, 200);
  const forgedReward = await telemetryPost(
    new Request("http://blundr.local/api/blundr/telemetry", {
      method: "POST",
      body: JSON.stringify({
        name: "REWARD_GRANTED",
        payload: { amount: 1000000 },
      }),
      headers: { "content-type": "application/json" },
    }),
  );
  assert.equal(forgedReward.status, 400);
});

test("public telemetry fails safely when the configured sink is unavailable", async () => {
  const originalEndpoint = process.env.BLUNDR_TELEMETRY_ENDPOINT;
  const originalFetch = global.fetch;
  process.env.BLUNDR_TELEMETRY_ENDPOINT = "https://telemetry.example.invalid/collect";
  global.fetch = (async () =>
    new Response("sink unavailable", { status: 503 })) as typeof fetch;
  try {
    const response = await telemetryPost(
      new Request("http://blundr.local/api/blundr/telemetry", {
        method: "POST",
        body: JSON.stringify({
          name: "AUTH_HYDRATION_COMPLETED",
          payload: {
            durationMs: 12,
            token: "must-not-pass",
          },
        }),
        headers: { "content-type": "application/json" },
      }),
    );
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      accepted: true,
      delivered: false,
    });
  } finally {
    global.fetch = originalFetch;
    if (originalEndpoint === undefined) {
      delete process.env.BLUNDR_TELEMETRY_ENDPOINT;
    } else {
      process.env.BLUNDR_TELEMETRY_ENDPOINT = originalEndpoint;
    }
  }
});
