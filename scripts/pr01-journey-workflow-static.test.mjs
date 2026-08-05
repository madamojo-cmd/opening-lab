import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const workflow = await readFile(
  ".github/workflows/blundr-release-candidate.yml",
  "utf8",
);

function assertInOrder(...needles) {
  let previousIndex = -1;
  for (const needle of needles) {
    const index = workflow.indexOf(needle, previousIndex + 1);
    assert.notEqual(index, -1, `missing workflow contract: ${needle}`);
    assert.ok(
      index > previousIndex,
      `workflow contract is out of order: ${needle}`,
    );
    previousIndex = index;
  }
}

assert.match(
  workflow,
  /supabase-rls-fresh:\n[\s\S]*?environment: blundr-disposable-rls/,
);
assert.match(
  workflow,
  /supabase-rls-upgrade:\n[\s\S]*?environment: blundr-disposable-rls/,
);
assert.match(
  workflow,
  /test "\$BLUNDR_RLS_TEST_PROJECT_REF" = "\$BLUNDR_RLS_UPGRADE_PROJECT_REF"/,
);
assert.match(
  workflow,
  /BLUNDR_PR01_PREFLIGHT_MODE=fresh BLUNDR_PR01_PREFLIGHT_PROJECT_REF="\$BLUNDR_RLS_FRESH_PROJECT_REF" BLUNDR_PR01_EXPORT_API_KEYS=true/,
);
assert.match(
  workflow,
  /BLUNDR_PR01_PREFLIGHT_MODE=upgrade BLUNDR_PR01_PREFLIGHT_PROJECT_REF="\$BLUNDR_RLS_UPGRADE_PROJECT_REF" BLUNDR_PR01_EXPORT_API_KEYS=true/,
);
assert.match(
  workflow,
  /BLUNDR_RLS_TEST_PROJECT_REF="\$BLUNDR_RLS_FRESH_PROJECT_REF" node --preserve-symlinks --import tsx tests\/security\/pr01MigrationAuthority\.integration\.test\.ts/,
);
assert.equal((workflow.match(/supabase@2\.111\.0/g) ?? []).length, 2);
assert.doesNotMatch(workflow, /migration\s+repair/i);
assert.doesNotMatch(workflow, /BLUNDR_RLS_(?:FRESH|UPGRADE)_DB_PASSWORD/);
assert.equal(
  (
    workflow.match(
      /SUPABASE_DB_PASSWORD: \$\{\{ secrets\.SUPABASE_DB_PASSWORD \}\}/g,
    ) ?? []
  ).length,
  2,
);
assert.match(
  workflow,
  /supabase-rls-fresh:[\s\S]*?BLUNDR_RLS_FRESH_PROJECT_REF:[\s\S]*?BLUNDR_RLS_UPGRADE_PROJECT_REF:[\s\S]*?BLUNDR_RLS_TEST_PROJECT_REF:/,
);
assert.match(
  workflow,
  /supabase-rls-upgrade:[\s\S]*?BLUNDR_RLS_FRESH_PROJECT_REF:[\s\S]*?BLUNDR_RLS_UPGRADE_PROJECT_REF:[\s\S]*?BLUNDR_RLS_TEST_PROJECT_REF:/,
);
assertInOrder(
  "BLUNDR_PR01_REMOTE_MIGRATION_HISTORY_MODE=fresh-empty",
  "run_supabase db push --dry-run",
  "BLUNDR_PR01_REMOTE_MIGRATION_HISTORY_MODE=fresh-final",
);
assertInOrder(
  "BLUNDR_PR01_REMOTE_MIGRATION_HISTORY_MODE=upgrade-initial",
  'hidden_migrations_dir="$(mktemp -d)"',
  "trap restore_pr01_migrations EXIT",
  "BLUNDR_PR01_REMOTE_MIGRATION_HISTORY_MODE=upgrade-prior21",
  "npm run pr01:upgrade-preservation:seed",
  "BLUNDR_PR01_REMOTE_MIGRATION_HISTORY_MODE=upgrade-final",
  "npm run pr01:upgrade-preservation:verify",
  "Run non-skippable upgraded authority matrix",
  "Always clean scoped upgrade preservation snapshot",
);
assert.match(
  workflow,
  /if: always\(\)[\s\S]*?\[ ! -f "\$BLUNDR_PR01_SNAPSHOT_PATH" \][\s\S]*?npm run pr01:upgrade-preservation:cleanup/,
);

console.log("PR-01 Journey A/B workflow static assertions passed.");
