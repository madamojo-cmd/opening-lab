import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { getStage2OpeningAvailabilitySummary } from "../../lib/blundr/openings/openingAvailability";

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const APP_PAGE = path.join(REPO_ROOT, "app", "page.tsx");

export function testNoLiveLichessRuntimeCalls(): void {
  const source = fs.readFileSync(APP_PAGE, "utf8");
  assert.equal(source.includes("async function loadExplorer"), true, "loadExplorer_function_not_found");
  assert.equal(source.includes("/api/explorer"), false, "loadExplorer_must_not_fetch_api_explorer");
  assert.equal(source.includes("explorer.lichess.org"), false, "loadExplorer_must_not_call_liv_lichess");
  assert.equal(source.includes("local_crawled_package"), true, "loadExplorer_must_use_local_crawled_package");
  assert.equal(source.includes("runtimePackageId:STAGE2_RUNTIME_PACKAGE_ID"), true, "runtime_package_id_debug_missing");

  const summary = getStage2OpeningAvailabilitySummary();
  assert.equal(summary.runtimeDataSource, "local_crawled_package");
  assert.equal(summary.liveLichessCalled, false);
}

testNoLiveLichessRuntimeCalls();
console.log("noLiveLichessRuntimeCalls ok");
