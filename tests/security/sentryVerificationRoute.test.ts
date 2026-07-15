import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const source = fs.readFileSync(
  path.join(process.cwd(), "app/api/blundr/dev/sentry-verification/route.ts"),
  "utf8",
);

test("Sentry verification is staging-only and token-gated", () => {
  assert.match(source, /SENTRY_ENVIRONMENT !== "staging"/);
  assert.match(source, /BLUNDR_SENTRY_VERIFY_TOKEN/);
  assert.match(source, /x-blundr-staging-verification/);
  assert.match(source, /Sentry\.flush\(5000\)/);
  assert.doesNotMatch(source, /request\.json\(\)/);
  assert.doesNotMatch(
    source,
    /email|username|pgn|acceptedMoves|solutionRoute/i,
  );
});
