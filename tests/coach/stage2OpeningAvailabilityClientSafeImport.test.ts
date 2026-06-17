import assert from "node:assert/strict";

async function main(): Promise<void> {
  const openingAvailability = await import("../../lib/blundr/openings/openingAvailability");
  const summary = openingAvailability.getStage2OpeningAvailabilitySummary();
  assert.equal(openingAvailability.STAGE2_OPENING_AVAILABILITY_MATRIX.length, 21);
  assert.equal(summary.runtimeDataSource, "local_crawled_package");
  assert.equal(summary.openingCount, 21);
  assert.equal(summary.visibleOpeningCount, 21);
  assert.equal(summary.approvedContentAvailableCount, 21);
  assert.equal(summary.liveLichessCalled, false);
}

main()
  .then(() => {
    console.log("stage2OpeningAvailabilityClientSafeImport ok");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
