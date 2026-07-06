import assert from "node:assert/strict";

import { buildGameDataHealthReport } from "../gameDataHealth";

(async () => {
  const report = await buildGameDataHealthReport("2026-07-06T12:00:00.000Z");

  assert.ok(report.runtimeBook.nodeCount > 0, "runtime book node count should be positive");
  assert.ok(report.runtimeBook.moveCount > 0, "runtime book move count should be positive");
  assert.equal(report.runtimeBook.parseErrors.length, 0, "runtime book should parse cleanly");
  assert.equal(report.runtimeTrainableRepertoires.count, 21, "expected trainable repertoire count");
  assert.equal(report.runtimeTrainableRepertoires.emptyOpeningIds.length, 0, "trainable repertoires should not be empty");
  assert.equal(report.openingAvailability.missingStarterPackOpenings.length, 0, "starter pack openings should resolve");
  assert.equal(report.starterPacks.missingOpeningIds.length, 0, "starter packs should cover available openings");
  assert.equal(report.starterPacks.joinErrors.length, 0, "starter pack join probes should succeed");
  assert.equal(report.joinChecks.joinErrors.length, 0, "runtime book join probes should succeed");
  assert.ok(report.dailyBlundr.syntheticDeckHasCards, "synthetic daily deck should build at least one card");

  console.log("gameDataHealth.test.ts passed");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
