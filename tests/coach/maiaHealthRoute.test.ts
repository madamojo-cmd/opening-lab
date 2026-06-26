import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { GET } from "../../app/api/maia/health/route";

async function readJson(response: Response): Promise<any> {
  return response.json();
}

async function testHealthWithDisabledRuntime() {
  const env = {
    MAIA_ENABLED: process.env.MAIA_ENABLED,
    MAIA_LC0_PATH: process.env.MAIA_LC0_PATH,
    MAIA_WEIGHTS_PATH: process.env.MAIA_WEIGHTS_PATH,
  };
  try {
    process.env.MAIA_ENABLED = "false";
    delete process.env.MAIA_LC0_PATH;
    delete process.env.MAIA_WEIGHTS_PATH;

    const response = await GET();
    const json = await readJson(response);
    assert.equal(json.status, "disabled");
    assert.equal(json.enabled, false);
    assert.equal(json.configured, false);
    assert.equal(json.summary.enabled, false);
    assert.equal(json.summary.configured, false);
    assert.equal(json.summary.cacheEnabled, true);
  } finally {
    process.env.MAIA_ENABLED = env.MAIA_ENABLED;
    if (env.MAIA_LC0_PATH === undefined) delete process.env.MAIA_LC0_PATH; else process.env.MAIA_LC0_PATH = env.MAIA_LC0_PATH;
    if (env.MAIA_WEIGHTS_PATH === undefined) delete process.env.MAIA_WEIGHTS_PATH; else process.env.MAIA_WEIGHTS_PATH = env.MAIA_WEIGHTS_PATH;
  }
}

async function testHealthWithConfiguredFiles() {
  const dir = mkdtempSync(join(tmpdir(), "maia-health-"));
  const lc0 = join(dir, "lc0");
  const weights = join(dir, "weights.pb.gz");
  writeFileSync(lc0, "#!/bin/sh\nexit 0\n");
  writeFileSync(weights, "weights");

  const env = {
    MAIA_ENABLED: process.env.MAIA_ENABLED,
    MAIA_LC0_PATH: process.env.MAIA_LC0_PATH,
    MAIA_WEIGHTS_PATH: process.env.MAIA_WEIGHTS_PATH,
    MAIA_SKILL_LEVEL: process.env.MAIA_SKILL_LEVEL,
    MAIA_TIMEOUT_MS: process.env.MAIA_TIMEOUT_MS,
    MAIA_NODES: process.env.MAIA_NODES,
    MAIA_CACHE_ENABLED: process.env.MAIA_CACHE_ENABLED,
    MAIA_MAX_CONCURRENT_REQUESTS: process.env.MAIA_MAX_CONCURRENT_REQUESTS,
  };
  try {
    process.env.MAIA_ENABLED = "true";
    process.env.MAIA_LC0_PATH = lc0;
    process.env.MAIA_WEIGHTS_PATH = weights;
    process.env.MAIA_SKILL_LEVEL = "maia-1500";
    process.env.MAIA_TIMEOUT_MS = "1400";
    process.env.MAIA_NODES = "3";
    process.env.MAIA_CACHE_ENABLED = "true";
    process.env.MAIA_MAX_CONCURRENT_REQUESTS = "4";

    const response = await GET();
    const json = await readJson(response);
    assert.equal(json.status, "ready");
    assert.equal(json.ready, true);
    assert.equal(json.enabled, true);
    assert.equal(json.configured, true);
    assert.equal(json.lc0Exists, true);
    assert.equal(json.weightsExists, true);
    assert.equal(json.cacheEnabled, true);
    assert.equal(json.maxConcurrentRequests, 4);
    assert.equal(json.skillLevel, "maia-1500");
    assert.equal(json.timeoutMs, 1400);
    assert.equal(json.nodes, 3);
    assert.equal(json.summary.lc0Exists, true);
    assert.equal(json.summary.weightsExists, true);
  } finally {
    process.env.MAIA_ENABLED = env.MAIA_ENABLED;
    if (env.MAIA_LC0_PATH === undefined) delete process.env.MAIA_LC0_PATH; else process.env.MAIA_LC0_PATH = env.MAIA_LC0_PATH;
    if (env.MAIA_WEIGHTS_PATH === undefined) delete process.env.MAIA_WEIGHTS_PATH; else process.env.MAIA_WEIGHTS_PATH = env.MAIA_WEIGHTS_PATH;
    if (env.MAIA_SKILL_LEVEL === undefined) delete process.env.MAIA_SKILL_LEVEL; else process.env.MAIA_SKILL_LEVEL = env.MAIA_SKILL_LEVEL;
    if (env.MAIA_TIMEOUT_MS === undefined) delete process.env.MAIA_TIMEOUT_MS; else process.env.MAIA_TIMEOUT_MS = env.MAIA_TIMEOUT_MS;
    if (env.MAIA_NODES === undefined) delete process.env.MAIA_NODES; else process.env.MAIA_NODES = env.MAIA_NODES;
    if (env.MAIA_CACHE_ENABLED === undefined) delete process.env.MAIA_CACHE_ENABLED; else process.env.MAIA_CACHE_ENABLED = env.MAIA_CACHE_ENABLED;
    if (env.MAIA_MAX_CONCURRENT_REQUESTS === undefined) delete process.env.MAIA_MAX_CONCURRENT_REQUESTS; else process.env.MAIA_MAX_CONCURRENT_REQUESTS = env.MAIA_MAX_CONCURRENT_REQUESTS;
  }
}

async function main() {
  await testHealthWithDisabledRuntime();
  await testHealthWithConfiguredFiles();
  console.log("maiaHealthRoute ok");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
