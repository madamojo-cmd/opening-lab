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
  /BLUNDR_RLS_TEST_URL\|BLUNDR_RLS_TEST_ANON_KEY\|BLUNDR_RLS_TEST_SERVICE_ROLE_KEY\)[\s\S]*?export "\$generated_name=\$generated_value"[\s\S]*?done < "\$GITHUB_ENV"/,
);
assert.match(
  workflow,
  /BLUNDR_RLS_TEST_PROJECT_REF="\$BLUNDR_RLS_FRESH_PROJECT_REF" npm run test:pr03-remote-authority/,
);
assert.equal((workflow.match(/supabase@2\.111\.0/g) ?? []).length, 4);
assert.equal(
  (workflow.match(/require_dry_run_migrations\(\)/g) ?? []).length,
  2,
);
assert.equal((workflow.match(/grep -q '\"_tag\":\"Error\"'/g) ?? []).length, 2);
assert.match(
  workflow,
  /grep -oE '\[0-9\]\{8\}\(\[0-9\]\{6\}\)\?_[^\n]+tail -n "\$expected_count" >"\$actual_file"/,
);
assert.match(workflow, /Journey A preflight and fresh zero-to-46 rebuild/);
assert.match(workflow, /Journey B preflight and exact 25-to-46 upgrade/);
assert.match(
  workflow,
  /BLUNDR_EXPECTED_MIGRATION_COUNT=46 BLUNDR_EXPECTED_MIGRATION_HEAD=20260904135434/,
);
assert.match(workflow, /tail -n 21 >"\$expected_pr03_migration"/);
assert.doesNotMatch(workflow, /zero-to-44|25-to-44/);
assert.doesNotMatch(
  workflow,
  /BLUNDR_EXPECTED_MIGRATION_COUNT=40 BLUNDR_EXPECTED_MIGRATION_HEAD=20260820203000/,
);
assert.doesNotMatch(workflow, /command_log" \| sort/);
assert.equal(
  (workflow.match(/cmp -s "\$expected_file" "\$actual_file"/g) ?? []).length,
  2,
);
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
  "Journey A preflight and fresh zero-to-46 rebuild",
  'run_supabase link --project-ref "$BLUNDR_RLS_FRESH_PROJECT_REF" --password "$SUPABASE_DB_PASSWORD"',
  "run_supabase --yes db reset --linked --no-seed",
  "BLUNDR_EXPECTED_MIGRATION_COUNT=46 BLUNDR_EXPECTED_MIGRATION_HEAD=20260904135434",
);
assertInOrder(
  "Journey B preflight and exact 25-to-46 upgrade",
  "BLUNDR_EXPECTED_MIGRATION_COUNT=25 BLUNDR_EXPECTED_MIGRATION_HEAD=20260805150000",
  'require_dry_run_migrations "$expected_pr03_migration"',
  "run_supabase db push",
  "BLUNDR_EXPECTED_MIGRATION_COUNT=46 BLUNDR_EXPECTED_MIGRATION_HEAD=20260904135434",
  "Run non-skippable upgraded authority matrix",
);

console.log("PR-03 Journey A/B workflow static assertions passed.");
