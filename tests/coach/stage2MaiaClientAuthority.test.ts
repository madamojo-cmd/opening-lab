import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const repoRoot = process.cwd();
const appPath = path.join(repoRoot, "app/page.tsx");
const providerPath = path.join(
  repoRoot,
  "lib/blundr/maia/maiaApiClientProvider.ts",
);

test("trainer never compiles Maia out behind a public build-time feature flag", () => {
  const source = fs.readFileSync(appPath, "utf8");

  assert.equal(
    source.includes("NEXT_PUBLIC_MAIA_API_ENABLED"),
    false,
    "preview/public env must not disable the browser Maia client",
  );
  assert.equal(
    source.includes("const maiaOpponentProvider = new MaiaApiClientProvider();"),
    true,
    "trainer must always target the authenticated Maia API route",
  );
  assert.equal(
    source.includes("unavailableMaiaProvider"),
    false,
    "browser must not substitute a permanently unavailable provider at build time",
  );
});

test("Maia client remains fail-closed through the authenticated opponent-reply route", () => {
  const source = fs.readFileSync(providerPath, "utf8");

  assert.equal(
    source.includes('"/api/maia/opponent-reply"'),
    true,
    "browser Maia authority must remain the server opponent-reply route",
  );
  assert.equal(
    source.includes('status: timedOut ? "timeout" : "unavailable"'),
    true,
    "route/provider failures must still fail closed instead of inventing a move",
  );
  assert.equal(
    source.includes("selectedCandidate: null"),
    true,
    "provider failures must not synthesize an opponent candidate",
  );
});
