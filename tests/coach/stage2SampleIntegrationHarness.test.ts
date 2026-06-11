import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { buildSampleStage2Packet } from "../../lib/blundr/stage2/sample";

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const SAMPLE_DIR = path.join(REPO_ROOT, "tests", "fixtures", "stage2", "sample");
const CRAWL_PATH = path.join(SAMPLE_DIR, "sample-crawl-bundle.json");
const COPY_PATH = path.join(SAMPLE_DIR, "sample-copy-bundle.json");

function loadJson(filePath: string): any {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export function testStage2SampleIntegrationHarness(): void {
  const crawlBundle = loadJson(CRAWL_PATH);
  const copyBundle = loadJson(COPY_PATH);

  // 1. returns no match for unknown opening
  const unknownOpening = buildSampleStage2Packet({
    crawlBundle,
    copyBundle,
    targetContext: { openingId: "unknown-opening", nodeKey: "x", moveUci: "e2e4", mode: "assisted" },
  });
  assert.equal(unknownOpening.status, "no_match");

  // 2. returns no match/blocker for unknown node
  const unknownNode = buildSampleStage2Packet({
    crawlBundle,
    copyBundle,
    targetContext: { openingId: "colle-white", nodeKey: "missing-node", moveUci: "e2e4", mode: "assisted" },
  });
  assert.equal(unknownNode.status, "blocked");
  assert.equal(unknownNode.blockers?.includes("node_not_in_sample_crawl"), true);

  // 3. returns no match/blocker for wrong moveUci at a valid node
  const wrongMove = buildSampleStage2Packet({
    crawlBundle,
    copyBundle,
    targetContext: { openingId: "colle-white", nodeKey: "8b67ae21160fe194d99c3002c756d8a726dff197", moveUci: "h2h4", mode: "assisted" },
  });
  assert.equal(wrongMove.status, "blocked");
  assert.equal(wrongMove.blockers?.includes("target_move_not_in_node_candidates"), true);

  // 4. never changes the requested moveUci
  assert.equal(wrongMove.moveUci, "h2h4");

  // 5. returns matched packet for valid node + candidate + approved copy
  const matched = buildSampleStage2Packet({
    crawlBundle,
    copyBundle,
    targetContext: {
      openingId: "colle-white",
      nodeKey: "8b67ae21160fe194d99c3002c756d8a726dff197",
      playKey: "d2d4,d7d5",
      moveUci: "g1f3",
      mode: "assisted",
    },
  });
  assert.equal(matched.status, "matched");
  assert.equal(matched.copy?.entryId, "sample_colle_nf3_001");

  // 6. does not return draft/disabled copy as visible copy
  const draftOnly = buildSampleStage2Packet({
    crawlBundle,
    copyBundle,
    targetContext: {
      openingId: "colle-white",
      nodeKey: "18b7943c8145495f9cc5cdb652ad16a44ea53da3",
      playKey: "d2d4,d7d5,g1f3,g8f6",
      moveUci: "b1d2",
      mode: "assisted",
    },
  });
  assert.equal(draftOnly.status, "no_match");
  assert.equal(draftOnly.copy, undefined);

  // 7. returns no generated copy when no entry exists
  const noCopy = buildSampleStage2Packet({
    crawlBundle,
    copyBundle,
    targetContext: {
      openingId: "colle-white",
      nodeKey: "b8d754ad4cedc702d6deaa8369c60d23ea1b56fc",
      playKey: "d2d4",
      moveUci: "d7d5",
      mode: "assisted",
    },
  });
  assert.equal(noCopy.status, "no_match");
  assert.equal(noCopy.copy, undefined);

  // 8. Assisted View may return full matched copy
  assert.equal(typeof matched.copy?.body, "string");
  assert.equal(Boolean(matched.copy?.body && matched.copy.body.length > 0), true);

  // 9. Plain View before Show More does not leak full answer/body
  const plainBeforeShowMore = buildSampleStage2Packet({
    crawlBundle,
    copyBundle,
    targetContext: {
      openingId: "colle-white",
      nodeKey: "8b67ae21160fe194d99c3002c756d8a726dff197",
      playKey: "d2d4,d7d5",
      moveUci: "g1f3",
      mode: "plain",
      showMoreRevealed: false,
    },
  });
  assert.equal(plainBeforeShowMore.status, "matched");
  assert.equal(plainBeforeShowMore.copy?.body, undefined);
  assert.equal(plainBeforeShowMore.copy?.title, undefined);

  // 10. Plain View after Show More returns target-aligned copy
  const plainAfterShowMore = buildSampleStage2Packet({
    crawlBundle,
    copyBundle,
    targetContext: {
      openingId: "colle-white",
      nodeKey: "8b67ae21160fe194d99c3002c756d8a726dff197",
      playKey: "d2d4,d7d5",
      moveUci: "g1f3",
      mode: "plain",
      showMoreRevealed: true,
    },
  });
  assert.equal(plainAfterShowMore.status, "matched");
  assert.equal(plainAfterShowMore.moveUci, "g1f3");
  assert.equal(plainAfterShowMore.copy?.entryId, "sample_colle_nf3_001");
  assert.equal(Boolean(plainAfterShowMore.copy?.body), true);

  // 11. visualRecipeRefs are metadata only
  assert.equal(Array.isArray(matched.visualRecipeRefs), true);
  assert.equal((matched as any).visuals, undefined);

  // 12. all returned packets include sampleOnly: true
  for (const packet of [
    unknownOpening,
    unknownNode,
    wrongMove,
    matched,
    draftOnly,
    noCopy,
    plainBeforeShowMore,
    plainAfterShowMore,
  ]) {
    assert.equal(packet.sampleOnly, true);
  }

  // 13. matched packets preserve openingId, nodeKey/playKey, moveUci
  for (const packet of [matched, plainBeforeShowMore, plainAfterShowMore]) {
    assert.equal(packet.status, "matched");
    assert.equal(packet.openingId, "colle-white");
    assert.equal(packet.nodeKey, "8b67ae21160fe194d99c3002c756d8a726dff197");
    assert.equal(packet.playKey, "d2d4,d7d5");
    assert.equal(packet.moveUci, "g1f3");
  }
}

testStage2SampleIntegrationHarness();
console.log("stage2SampleIntegrationHarness ok");
