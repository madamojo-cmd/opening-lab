import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

test("mastery runtime identity backfill uses only unambiguous learning events", () => {
  const sql = fs.readFileSync(
    path.join(
      process.cwd(),
      "supabase/migrations/20260803_001_blundr_mastery_runtime_identity.sql",
    ),
    "utf8",
  );
  assert.match(sql, /from public\.blundr_learning_events/i);
  assert.match(
    sql,
    /having count\(distinct opening_id \|\| E'\\x1f' \|\| move_order_key\) = 1/i,
  );
  assert.match(sql, /unique \(user_id, opening_id, play_key\)/i);
  assert.match(sql, /raise notice .*unresolved runtime identities/i);
  assert.match(
    sql,
    /raise exception .*duplicate canonical runtime identities/i,
  );
  assert.doesNotMatch(sql, /delete from|truncate|drop table|drop column/i);
});
