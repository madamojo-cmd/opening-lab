import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { glob } from "node:fs/promises";

const expectedSignatures = new Set([
  "blundr_touch_updated_at()",
  "blundr_normalize_username(text)",
  "blundr_validate_username_pair()",
  "blundr_learning_events_force_auth_user()",
  "blundr_game_data_force_auth_user()",
]);

test("Supabase function search_path hardening stays scoped and explicit", async () => {
  const migrations: string[] = [];
  for await (const file of glob(
    "supabase/migrations/*_harden-function-search-path.sql",
  )) {
    migrations.push(file);
  }
  assert.equal(migrations.length, 1, "expected_single_hardening_migration");

  const sql = await readFile(migrations[0]!, "utf8");

  const alteredSignatures = new Set<string>();
  for (const match of sql.matchAll(
    /alter function if exists public\.([a-z0-9_]+)\(([^)]*)\)/gi,
  )) {
    const functionName = match[1]!;
    const args = match[2] ?? "";
    alteredSignatures.add(`${functionName}(${args})`);
  }

  assert.deepEqual(
    alteredSignatures,
    expectedSignatures,
    "altered_functions_must_match_expected_set",
  );

  for (const signature of expectedSignatures) {
    const [functionName, argsWithCloseParen] = signature.split("(");
    const args = argsWithCloseParen!.slice(0, -1);
    const escapedArgs = args.replaceAll(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const escapedName = functionName!.replaceAll(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&",
    );
    const hardeningPattern = new RegExp(
      `alter function if exists public\\.${escapedName}\\(${escapedArgs}\\)\\s*\\n\\s*set search_path = pg_catalog;`,
      "i",
    );
    assert.match(sql, hardeningPattern, `missing_search_path_hardening:${signature}`);
  }
});

