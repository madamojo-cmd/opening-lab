import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync(
  "supabase/migrations/20260804120000_blundr_provider_projection_replay.sql",
  "utf8",
);

test("provider deletion atomically removes only imported evidence and replays mixed-source projections", () => {
  assert.match(migration, /security definer/i);
  assert.match(migration, /source = 'imported_game'/);
  assert.match(migration, /attempt_id = any\(v_finding_ids\)/);
  assert.match(
    migration,
    /from public\.blundr_learning_events[\s\S]*position_key = v_position/,
  );
  assert.match(migration, /on conflict \(user_id, position_key\) do update/);
  assert.match(
    migration,
    /revoke all on function[\s\S]*from public, anon, authenticated/i,
  );
  assert.match(migration, /grant execute[\s\S]*to service_role/i);
});
