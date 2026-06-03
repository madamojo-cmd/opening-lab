import assert from "node:assert/strict";
import fs from "node:fs";

import { createMockStockfishTop10GateResult } from "../../lib/blundr/engine/mockEngineProvider";
import { createMockMaiaContinuationContext } from "../../lib/blundr/maia/mockMaiaProvider";
import type { OpeningKnowledgeContext } from "../../lib/blundr/knowledge/openingKnowledgeTypes";

function readJson(path: string): any {
  return JSON.parse(fs.readFileSync(new URL(path, import.meta.url), "utf8"));
}

export function testProviderFailure(): void {
  const engineData = readJson("../../data/goldenEngineFixtures.json");
  const maiaData = readJson("../../data/goldenMaiaFixtures.json");
  const openingData = readJson("../../data/goldenOpeningKnowledgeFixtures.json");

  const unavailable = engineData.fixtures.find((f: any) => f.id === "engine_unavailable");
  const timeout = engineData.fixtures.find((f: any) => f.id === "engine_timeout");

  const unavailableResult = createMockStockfishTop10GateResult(unavailable);
  const timeoutResult = createMockStockfishTop10GateResult(timeout);

  assert.equal(unavailableResult.claimPermissions.maySayEngineBacked, false);
  assert.equal(timeoutResult.claimPermissions.maySayEngineBacked, false);

  const maiaUnavailableFixture = maiaData.fixtures.find((f: any) => f.id === "maia_unavailable");
  const maiaUnavailable = createMockMaiaContinuationContext(maiaUnavailableFixture);
  assert.equal(maiaUnavailable.status, "unavailable");
  assert.equal(maiaUnavailableFixture.maiaOwnsTarget, false);

  const notFoundFixture = openingData.fixtures.find((f: any) => f.id === "opening_not_found_supported_nonfatal");
  const openingContext: OpeningKnowledgeContext = {
    provider: "opening_knowledge",
    status: notFoundFixture.status,
    items: notFoundFixture.items,
    matchedBy: notFoundFixture.matchedBy,
    warnings: notFoundFixture.warnings,
  };
  assert.equal(openingContext.status, "not_found");
  assert.equal(Array.isArray(openingContext.items), true);
}

testProviderFailure();
console.log("providerFailure ok");
