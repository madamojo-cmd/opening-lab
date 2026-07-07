import assert from "node:assert/strict";

import {
  getDailyBlundrValidationConceptCount,
  getDailyBlundrValidationMiniGameCount,
  getDailyBlundrValidationTrainingTargetCount,
  runDailyBlundrGeneratedContentValidation,
  runDailyBlundrRegistryValidation,
  runDailyBlundrValidation,
} from "../validation/dailyValidationRunner";

export function testDailyValidationRunner(): void {
  assert.equal(getDailyBlundrValidationConceptCount(), 68);
  assert.equal(getDailyBlundrValidationMiniGameCount(), 8);
  assert.equal(getDailyBlundrValidationTrainingTargetCount(), 5);

  const registryReport = runDailyBlundrRegistryValidation();
  assert.ok(registryReport.valid);

  const contentReport = runDailyBlundrGeneratedContentValidation();
  assert.ok(contentReport.valid);
  assert.equal(contentReport.summary.conceptCount, 68);
  assert.equal(contentReport.difficultyCoverage.length, 6);
  assert.ok(contentReport.surfaceCoverage.some((bucket) => bucket.key === "mini_game"));
  assert.ok(contentReport.surfaceCoverage.some((bucket) => bucket.key === "training_target"));

  const fullReport = runDailyBlundrValidation();
  assert.ok(fullReport.valid);
  assert.equal(fullReport.summary.conceptCount, 68);
  assert.ok(fullReport.conceptCoverage.length > 0);
}

testDailyValidationRunner();
console.log("dailyValidationRunner ok");
