import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

test("repertoire point persistence accepts the server reward bonus source", () => {
  const source = readFileSync(
    resolve(
      process.cwd(),
      "supabase/migrations/20260724_001_blundr_repertoire_reward_bonus_source.sql",
    ),
    "utf8",
  );
  assert.match(source, /alter table public\.blundr_repertoire_point_events/);
  assert.match(source, /'reward_bonus'/);
  assert.doesNotMatch(source, /drop table|truncate|delete from/i);
});
