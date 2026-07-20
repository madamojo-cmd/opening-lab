import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

test("node mastery stores indexed canonical runtime coordinates without answers", () => {
  const sql = fs.readFileSync(
    path.join(
      process.cwd(),
      "supabase/migrations/20260723_001_blundr_node_mastery_runtime_keys.sql",
    ),
    "utf8",
  );
  assert.match(sql, /alter table public\.blundr_node_mastery/i);
  assert.match(sql, /add column if not exists opening_id text/i);
  assert.match(sql, /add column if not exists play_key text/i);
  assert.match(sql, /\(user_id, opening_id, play_key\)/i);
  assert.doesNotMatch(sql, /solution|correct_move|expected_move|answer_id/i);
});
