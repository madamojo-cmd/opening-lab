import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import { ONBOARDING_V11_STEPS } from "@/lib/blundr/onboarding/onboardingV11Contract";

const migrationFile =
  "20260903155151_blundr_onboarding_v11_step_constraint_repair.sql";
const migrationsDirectory = path.resolve("supabase/migrations");
const migrationSql = readFileSync(
  path.join(migrationsDirectory, migrationFile),
  "utf8",
);

function extractOnboardingStepConstraintValues(sql: string): string[] {
  const match = sql.match(
    /check\s*\(\s*onboarding_step\s+in\s*\(([\s\S]*?)\)\s*\)/i,
  );
  assert.ok(match, "migration must define onboarding_step check values");
  return [...match[1].matchAll(/'([^']+)'/g)].map((value) => value[1]);
}

describe("onboarding V11 migration contract", () => {
  it("keeps the database onboarding_step constraint aligned with the app contract", () => {
    const migrationSteps = extractOnboardingStepConstraintValues(migrationSql);

    assert.deepEqual(migrationSteps, [...ONBOARDING_V11_STEPS]);
    assert.ok(migrationSteps.includes("line-changes"));
    assert.ok(migrationSteps.includes("review"));
    assert.ok(!migrationSteps.includes("unknown"));
  });

  it("repairs only the narrow onboarding_step check constraint", () => {
    assert.match(
      migrationSql,
      /drop\s+constraint\s+if\s+exists\s+blundr_user_profiles_onboarding_step_check/i,
    );
    assert.match(
      migrationSql,
      /add\s+constraint\s+blundr_user_profiles_onboarding_step_check/i,
    );
    assert.doesNotMatch(
      migrationSql,
      /\b(?:drop\s+(?:table|column|schema|database)|truncate|delete\s+from)\b/i,
    );
    assert.doesNotMatch(
      migrationSql,
      /\b(?:insert\s+into|update\s+public\.|grant\s+|revoke\s+|alter\s+table\s+(?!public\.blundr_user_profiles\b))/i,
    );
  });

  it("keeps the Phase 3 repair present under the current migration head", () => {
    const migrations = readdirSync(migrationsDirectory)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    assert.equal(migrations.length, 46);
    assert.ok(migrations.includes(migrationFile));
    assert.equal(
      migrations.at(-1),
      "20260904135434_blundr_billing_entitlement_authority.sql",
    );
  });
});
