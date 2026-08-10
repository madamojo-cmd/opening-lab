import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "../../../../");
const nextConfig = readFileSync(resolve(root, "next.config.ts"), "utf8");

test("Next tracing keeps the exact training runtime package files in server bundles", () => {
  assert.match(nextConfig, /outputFileTracingIncludes\s*:/);
  for (const route of [
    "/api/blundr/jobs/process-game-import",
    "/api/blundr/daily/today",
    "/api/blundr/daily/sessions/[sessionId]/attempts",
    "/api/blundr/daily/sessions/[sessionId]/retry",
    "/api/blundr/daily/sessions/[sessionId]/reveal",
    "/api/blundr/learning/events",
    "/api/blundr/repertoire/openings/[openingId]/insights",
    "/api/blundr/dev/game-data-health",
    "/api/runtime-book/candidates",
  ]) {
    assert.match(
      nextConfig,
      new RegExp(route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    );
  }
  for (const file of [
    "manifest.json",
    "opening-book.nodes.runtime.v1.jsonl",
    "opening-book.candidates.runtime.v1.jsonl",
    "opening-index.runtime.v1.json",
    "opening-availability.runtime.v1.json",
    "checksums.sha256",
    "validation-report.json",
  ]) {
    assert.match(
      nextConfig,
      new RegExp(file.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    );
  }
  assert.doesNotMatch(nextConfig, /\*\*/);
});
