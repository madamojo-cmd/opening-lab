import assert from "node:assert/strict";
import test from "node:test";

import {
  deliverBlundrTelemetryEvent,
  probeBlundrTelemetrySink,
  sanitizeBlundrTelemetryPayload,
} from "../telemetrySink.server";

function withTelemetryEnv(
  env: { endpoint?: string; token?: string },
  run: () => Promise<void>,
) {
  return async () => {
    const originalEndpoint = process.env.BLUNDR_TELEMETRY_ENDPOINT;
    const originalToken = process.env.BLUNDR_TELEMETRY_TOKEN;
    if (env.endpoint === undefined)
      delete process.env.BLUNDR_TELEMETRY_ENDPOINT;
    else process.env.BLUNDR_TELEMETRY_ENDPOINT = env.endpoint;
    if (env.token === undefined) delete process.env.BLUNDR_TELEMETRY_TOKEN;
    else process.env.BLUNDR_TELEMETRY_TOKEN = env.token;
    try {
      await run();
    } finally {
      if (originalEndpoint === undefined)
        delete process.env.BLUNDR_TELEMETRY_ENDPOINT;
      else process.env.BLUNDR_TELEMETRY_ENDPOINT = originalEndpoint;
      if (originalToken === undefined)
        delete process.env.BLUNDR_TELEMETRY_TOKEN;
      else process.env.BLUNDR_TELEMETRY_TOKEN = originalToken;
    }
  };
}

function restoreFetch(originalFetch: typeof fetch) {
  global.fetch = originalFetch;
}

test(
  "successful telemetry sink returns delivered=true and sends bearer token",
  withTelemetryEnv(
    { endpoint: "https://telemetry.example.test/collect", token: "token-123" },
    async () => {
      const originalFetch = global.fetch;
      let authorization: string | null = null;
      global.fetch = (async (_input, init) => {
        authorization = new Headers(init?.headers).get("authorization");
        return new Response(null, { status: 204 });
      }) as typeof fetch;
      try {
        const result = await deliverBlundrTelemetryEvent({
          name: "PAYWALL_VIEWED",
          payload: { source: "test" },
          receivedAt: "2026-09-15T00:00:00.000Z",
        });
        assert.equal(result.delivered, true);
        assert.equal(result.configured, true);
        assert.equal(result.delivery, "ready");
        assert.equal(authorization, "Bearer token-123");
      } finally {
        restoreFetch(originalFetch);
      }
    },
  ),
);

test(
  "rejected sink returns delivered=false without exposing token",
  withTelemetryEnv(
    {
      endpoint: "https://telemetry.example.test/collect",
      token: "secret-token",
    },
    async () => {
      const originalFetch = global.fetch;
      global.fetch = (async () =>
        new Response("forbidden secret-token", {
          status: 403,
        })) as typeof fetch;
      try {
        const result = await deliverBlundrTelemetryEvent({
          name: "PAYWALL_VIEWED",
          payload: { source: "test" },
        });
        assert.deepEqual(result, {
          delivered: false,
          configured: true,
          delivery: "degraded",
          errorCode: "sink_rejected",
        });
        assert.equal(JSON.stringify(result).includes("secret-token"), false);
      } finally {
        restoreFetch(originalFetch);
      }
    },
  ),
);

test(
  "timeout returns delivered=false as network_timeout",
  withTelemetryEnv(
    { endpoint: "https://telemetry.example.test/collect" },
    async () => {
      const originalFetch = global.fetch;
      global.fetch = (async () => {
        throw new DOMException("timed out", "TimeoutError");
      }) as typeof fetch;
      try {
        const result = await deliverBlundrTelemetryEvent(
          { name: "PAYWALL_VIEWED", payload: { source: "test" } },
          { timeoutMs: 1 },
        );
        assert.equal(result.delivered, false);
        assert.equal(result.errorCode, "network_timeout");
      } finally {
        restoreFetch(originalFetch);
      }
    },
  ),
);

test(
  "bearer token is omitted when not configured",
  withTelemetryEnv(
    { endpoint: "https://telemetry.example.test/collect" },
    async () => {
      const originalFetch = global.fetch;
      let authorization: string | null = "unexpected";
      global.fetch = (async (_input, init) => {
        authorization = new Headers(init?.headers).get("authorization");
        return new Response("{}", { status: 200 });
      }) as typeof fetch;
      try {
        await deliverBlundrTelemetryEvent({
          name: "PAYWALL_VIEWED",
          payload: { source: "test" },
        });
        assert.equal(authorization, null);
      } finally {
        restoreFetch(originalFetch);
      }
    },
  ),
);

test("payload sanitization drops unsafe keys and values", () => {
  const payload = sanitizeBlundrTelemetryPayload(
    {
      source: "x".repeat(200),
      token: "must-not-pass",
      nested: { secret: true },
      validNumber: 2,
      validBool: true,
      "bad-key": "drop",
    },
    { maxEntries: 4, maxStringLength: 12 },
  );
  assert.deepEqual(payload, {
    source: "xxxxxxxxxxxx",
    nested: null,
    validNumber: 2,
    validBool: true,
  });
  assert.equal(JSON.stringify(payload).includes("must-not-pass"), false);
  assert.equal(JSON.stringify(payload).includes("secret"), false);
  assert.equal(Object.hasOwn(payload, "bad-key"), false);
});

test(
  "health reports ready=true only when the real sink probe succeeds",
  withTelemetryEnv(
    { endpoint: "https://telemetry.example.test/collect" },
    async () => {
      const originalFetch = global.fetch;
      global.fetch = (async () =>
        new Response("{}", { status: 200 })) as typeof fetch;
      try {
        const health = await probeBlundrTelemetrySink();
        assert.equal(health.ready, true);
        assert.equal(health.configured, true);
        assert.equal(health.delivery, "ready");
      } finally {
        restoreFetch(originalFetch);
      }
    },
  ),
);

test(
  "health reports ready=false when sink probe fails and does not fake config readiness",
  withTelemetryEnv(
    { endpoint: "https://telemetry.example.test/collect" },
    async () => {
      const originalFetch = global.fetch;
      global.fetch = (async () =>
        new Response("bad", { status: 503 })) as typeof fetch;
      try {
        const health = await probeBlundrTelemetrySink();
        assert.equal(health.ready, false);
        assert.equal(health.configured, true);
        assert.equal(health.delivery, "degraded");
        assert.equal(health.errorCode, "sink_server_error");
      } finally {
        restoreFetch(originalFetch);
      }
    },
  ),
);

test(
  "empty literal endpoint is treated as not configured",
  withTelemetryEnv({ endpoint: '""' }, async () => {
    const health = await probeBlundrTelemetrySink();
    assert.equal(health.ready, false);
    assert.equal(health.configured, false);
    assert.equal(health.delivery, "console_only");
  }),
);
