import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

type Inventory = {
  summary: {
    packetsScanned: number;
    openingsScanned: number;
    totalPacketsAfterPatch: number;
    totalOpeningsAfterPatch: number;
    uniquePacketIdCountBefore: number;
    uniquePacketIdCountAfter: number;
    changedPacketCount: number;
    changedPacketIds: string[];
  };
  repetitionStatsBefore: {
    uniqueCoachCardTitles: number;
    uniqueCoachCardBodies: number;
    uniqueAssistedBodies: number;
    uniquePlainHintBodies: number;
    uniquePlainShowMoreBodies: number;
  };
  repetitionStatsAfter: {
    uniqueCoachCardTitles: number;
    uniqueCoachCardBodies: number;
    uniqueAssistedBodies: number;
    uniquePlainHintBodies: number;
    uniquePlainShowMoreBodies: number;
  };
  genericPhraseHitsBefore: Array<{ phrase: string; hits: number }>;
  genericPhraseHitsAfter: Array<{ phrase: string; hits: number }>;
  plainViewLeakRisksBefore: string[];
  plainViewLeakRisksAfter: string[];
  topPriorityCandidates: Array<{ packetId: string; score: number; reasons: string[] }>;
};

export function testStage2CoachCardQualityRepetitionAudit(): void {
  const inventoryPath = path.join(process.cwd(), "data/blundr/stage2-coachcard-quality-repetition-inventory.json");
  assert.equal(fs.existsSync(inventoryPath), true, "quality_inventory_missing");

  const inventory = JSON.parse(fs.readFileSync(inventoryPath, "utf8")) as Inventory;
  assert.equal(inventory.summary.packetsScanned, 2515);
  assert.equal(inventory.summary.openingsScanned, 21);
  assert.equal(inventory.summary.totalPacketsAfterPatch, 2515);
  assert.equal(inventory.summary.totalOpeningsAfterPatch, 21);
  assert.equal(inventory.summary.uniquePacketIdCountBefore, 2515);
  assert.equal(inventory.summary.uniquePacketIdCountAfter, 2515);
  assert.equal(inventory.summary.changedPacketCount, 20);
  assert.equal(inventory.summary.changedPacketIds.length, 20);
  assert.equal(inventory.topPriorityCandidates.length >= 50, true, "top_priority_candidates_missing");

  assert.equal(
    inventory.repetitionStatsAfter.uniqueCoachCardTitles >= inventory.repetitionStatsBefore.uniqueCoachCardTitles,
    true,
    "unique_titles_should_not_shrink",
  );
  assert.equal(
    inventory.repetitionStatsAfter.uniqueCoachCardBodies >= inventory.repetitionStatsBefore.uniqueCoachCardBodies,
    true,
    "unique_bodies_should_not_shrink",
  );
  assert.equal(inventory.plainViewLeakRisksBefore.length, 0);
  assert.equal(inventory.plainViewLeakRisksAfter.length, 0);

  for (const hit of inventory.genericPhraseHitsBefore) {
    assert.equal(hit.hits >= 0, true, `invalid_generic_hit_before:${hit.phrase}`);
  }
  for (const hit of inventory.genericPhraseHitsAfter) {
    assert.equal(hit.hits >= 0, true, `invalid_generic_hit_after:${hit.phrase}`);
  }
}

testStage2CoachCardQualityRepetitionAudit();
console.log("stage2CoachCardQualityRepetitionAudit ok");
