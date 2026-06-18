import assert from "node:assert/strict";
import { Module } from "node:module";

async function main(): Promise<void> {
  const moduleClass = Module as unknown as { _load: typeof Module._load };
  const originalLoad = moduleClass._load;
  moduleClass._load = function patchedLoad(request: string, parent: unknown, isMain: boolean) {
    if (request === "node:fs" || request === "fs") {
      throw new Error(`blocked_client_fs_import:${request}`);
    }
    return originalLoad.apply(this, [request, parent, isMain] as never);
  } as typeof Module._load;

  try {
    const openingAvailability = await import("../../lib/blundr/openings/openingAvailability");
    const summary = openingAvailability.getStage2OpeningAvailabilitySummary();
    assert.equal(openingAvailability.STAGE2_OPENING_AVAILABILITY_MATRIX.length, 21);
    assert.equal(summary.runtimeDataSource, "local_crawled_package");
    assert.equal(summary.openingCount, 21);
    assert.equal(summary.visibleOpeningCount, 21);
    assert.equal(summary.approvedContentAvailableCount, 21);
    assert.equal(summary.liveLichessCalled, false);
  } finally {
    moduleClass._load = originalLoad;
  }
}

main()
  .then(() => {
    console.log("stage2OpeningAvailabilityClientSafeImport ok");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
