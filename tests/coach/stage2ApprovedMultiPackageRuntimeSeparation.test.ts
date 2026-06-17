import assert from "node:assert/strict";

import {
  getStage2OpeningAvailabilitySummary,
  getStage2OpeningAvailability,
} from "../../lib/blundr/openings/openingAvailability";
import { getStage2RuntimeTrainableRepertoire } from "../../lib/blundr/openings/runtimeTrainableRepertoires";

async function main(): Promise<void> {
  const summary = getStage2OpeningAvailabilitySummary();
  assert.equal(summary.runtimeDataSource, "local_crawled_package");
  assert.equal(summary.liveLichessCalled, false);
  assert.equal(summary.openingCount, 21);
  assert.equal(summary.visibleOpeningCount, 21);
  assert.equal(summary.runtimeAvailableCount, 21);
  assert.equal(summary.approvedContentAvailableCount, 0);

  const opening = getStage2OpeningAvailability("italian-black");
  assert.equal(opening?.runtimeAvailable, true);
  assert.equal(opening?.approvedContentAvailable, false);
  assert.equal(getStage2RuntimeTrainableRepertoire("italian-black")?.id, "italian-black");
}

main()
  .then(() => {
    console.log("stage2ApprovedMultiPackageRuntimeSeparation ok");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
