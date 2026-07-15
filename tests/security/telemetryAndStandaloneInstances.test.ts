import assert from "node:assert/strict";
import test from "node:test";
import { POST as telemetryPost } from "@/app/api/blundr/telemetry/route";

test("telemetry route accepts only known events and sanitizes payload shapes", async () => {
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
        name: "OPENING_RUN_COMPLETED",
        payload: { internalId: "id-1", nested: { secret: true } },
      }),
      headers: { "content-type": "application/json" },
    }),
  );
  assert.equal(valid.status, 200);
});
