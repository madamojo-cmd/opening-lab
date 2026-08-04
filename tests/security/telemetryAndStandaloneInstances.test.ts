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
