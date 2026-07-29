import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relativePath: string) =>
  readFileSync(path.join(root, relativePath), "utf8");

test("engine-certified answers remain outside public and client barrels", () => {
  assert.equal(
    existsSync(path.join(root, "public", "engineCertifiedCatalog.v1.json")),
    false,
  );
  assert.equal(
    read("lib/blundr/daily/miniGames/deep/index.ts").includes(
      "engineCertifiedCatalog",
    ),
    false,
  );
  assert.equal(
    read("components/review/MiniGamePracticeRunner.tsx").includes(
      "engineCertifiedCatalog",
    ),
    false,
  );
});

test("standalone routes require owned revision-bound durable mutations", () => {
  const repository = read(
    "lib/blundr/daily/miniGames/standalone/standaloneMiniGameRepository.server.ts",
  );
  assert.match(repository, /\.eq\("user_id", record\.userId\)/);
  assert.match(repository, /\.eq\("revision", expectedRevision\)/);
  assert.match(repository, /standalone_minigame_persistence_unavailable/);
  assert.match(repository, /process\.env\.NODE_ENV !== "test"/);
  for (const action of ["advance", "reveal", "retry", "reset"]) {
    const route = read(
      `app/api/blundr/minigames/instances/[instanceId]/${action}/route.ts`,
    );
    assert.match(route, /revision_required/);
    assert.match(route, /stale_instance_state/);
  }
});

test("minigame instance storage stays browser-denied and revision-backed", () => {
  const initial = read(
    "supabase/migrations/20260715_001_blundr_minigame_instances.sql",
  );
  const revision = read(
    "supabase/migrations/20260727_001_blundr_minigame_instance_revision.sql",
  );
  assert.match(initial, /enable row level security/i);
  assert.match(
    initial,
    /revoke all on public\.blundr_minigame_instances from anon, authenticated/i,
  );
  assert.match(revision, /revision bigint not null default 0/i);
  assert.match(revision, /check \(revision >= 0\)/i);
});
