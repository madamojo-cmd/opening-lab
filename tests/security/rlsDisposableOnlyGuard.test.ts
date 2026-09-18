import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const guardedSuites = [
  "tests/security/dailyTaskEvidenceAuthority.integration.test.ts",
  "tests/security/pr01MigrationAuthority.integration.test.ts",
  "tests/security/pr02LearningDailyAuthority.integration.test.ts",
  "tests/security/pr03RewardsAuthority.integration.test.ts",
  "tests/security/trainerCompletionRemoteAuthority.integration.test.ts",
] as const;

test("remote RLS authority suites reject staging before Supabase clients are created", () => {
  for (const file of guardedSuites) {
    const source = readFileSync(file, "utf8");
    const guardIndex = source.indexOf(
      'process.env.BLUNDR_RLS_TEST_ENVIRONMENT_ROLE',
    );
    const disposableIndex = source.indexOf('"disposable"', guardIndex);
    const firstClientIndex = source.indexOf("createClient(");

    assert.ok(guardIndex >= 0, `${file} must inspect the RLS environment role`);
    assert.ok(disposableIndex > guardIndex, `${file} must require disposable`);
    assert.ok(
      firstClientIndex === -1 || disposableIndex < firstClientIndex,
      `${file} must reject staging before creating a Supabase client`,
    );
    assert.doesNotMatch(
      source.slice(0, firstClientIndex === -1 ? source.length : firstClientIndex),
      /"staging"|'staging'/,
      `${file} must not allow staging in its pre-network guard`,
    );
  }
});
