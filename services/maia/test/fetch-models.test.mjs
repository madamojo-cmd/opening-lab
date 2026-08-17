import assert from "node:assert/strict";
import test from "node:test";

import { downloadModelAsset } from "../scripts/fetch-models.mjs";

function response(body, status, headers = {}) {
  return new Response(body, { status, headers });
}

test("model download retries HTTP 429 and honors Retry-After", async () => {
  let calls = 0;
  const sleeps = [];

  const contents = await downloadModelAsset("https://example.invalid/model", {
    maxAttempts: 3,
    now: () => 1_000,
    sleep: async (ms) => {
      sleeps.push(ms);
    },
    fetchImpl: async () => {
      calls += 1;
      if (calls === 1) {
        return response("rate limited", 429, { "retry-after": "2" });
      }
      return response(new Uint8Array([1, 2, 3]), 200);
    },
  });

  assert.deepEqual([...contents], [1, 2, 3]);
  assert.equal(calls, 2);
  assert.deepEqual(sleeps, [2_000]);
});

test("model download retries transient 5xx with bounded exponential delay", async () => {
  let calls = 0;
  const sleeps = [];

  const contents = await downloadModelAsset("https://example.invalid/model", {
    maxAttempts: 4,
    sleep: async (ms) => {
      sleeps.push(ms);
    },
    fetchImpl: async () => {
      calls += 1;
      if (calls < 3) return response("unavailable", 503);
      return response(new Uint8Array([9]), 200);
    },
  });

  assert.deepEqual([...contents], [9]);
  assert.equal(calls, 3);
  assert.deepEqual(sleeps, [1_000, 2_000]);
});

test("model download does not retry permanent HTTP failures", async () => {
  let calls = 0;

  await assert.rejects(
    () =>
      downloadModelAsset("https://example.invalid/model", {
        maxAttempts: 5,
        sleep: async () => {
          throw new Error("sleep_should_not_run");
        },
        fetchImpl: async () => {
          calls += 1;
          return response("not found", 404);
        },
      }),
    /download_failed:404/,
  );

  assert.equal(calls, 1);
});

test("model download fails closed after bounded retry exhaustion", async () => {
  let calls = 0;
  const sleeps = [];

  await assert.rejects(
    () =>
      downloadModelAsset("https://example.invalid/model", {
        maxAttempts: 3,
        sleep: async (ms) => {
          sleeps.push(ms);
        },
        fetchImpl: async () => {
          calls += 1;
          return response("rate limited", 429, { "retry-after": "0" });
        },
      }),
    /download_failed:429/,
  );

  assert.equal(calls, 3);
  assert.deepEqual(sleeps, [0, 0]);
});

test("model download retries transient network failures but remains bounded", async () => {
  let calls = 0;
  const sleeps = [];

  const contents = await downloadModelAsset("https://example.invalid/model", {
    maxAttempts: 2,
    sleep: async (ms) => {
      sleeps.push(ms);
    },
    fetchImpl: async () => {
      calls += 1;
      if (calls === 1) throw new TypeError("temporary network failure");
      return response(new Uint8Array([7, 8]), 200);
    },
  });

  assert.deepEqual([...contents], [7, 8]);
  assert.equal(calls, 2);
  assert.deepEqual(sleeps, [1_000]);
});
