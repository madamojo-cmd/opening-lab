import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

type Packet = Record<string, any>;

const PATCH_PATH = path.join(process.cwd(), "data/blundr/stage2-approved-content-copy-polish-patch-v1/copy-patch.jsonl");
const BASE_PATHS = [
  path.join(process.cwd(), "data/blundr/stage2-approved-content-approved-5openings-v1/approved-packets.jsonl"),
  path.join(process.cwd(), "data/blundr/stage2-approved-content-approved-batches2to4-16openings-v1/approved-packets.jsonl"),
];

function readJsonl(filePath: string): Packet[] {
  return fs
    .readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line) as Packet);
}

function stripCopyFields(packet: Packet): Packet {
  const clone = JSON.parse(JSON.stringify(packet)) as Packet;
  if (clone.coachCard) {
    for (const key of ["title", "body", "why", "principle"]) delete clone.coachCard[key];
  }
  if (clone.surfaces) {
    for (const surface of ["assisted", "plain_hint", "plain_show_more", "review"]) {
      if (!clone.surfaces[surface]) continue;
      for (const key of ["title", "body"]) delete clone.surfaces[surface][key];
    }
  }
  return clone;
}

export function testStage2ApprovedCoachCardCopyPatchIntegrity(): void {
  assert.equal(fs.existsSync(PATCH_PATH), true, "copy_patch_missing");
  const patchPackets = readJsonl(PATCH_PATH);
  const basePackets = BASE_PATHS.flatMap((filePath) => readJsonl(filePath));
  const baseById = new Map(basePackets.map((packet) => [String(packet.packetId), packet]));

  assert.equal(patchPackets.length, 20, "copy_patch_packet_count_mismatch");
  assert.equal(new Set(patchPackets.map((packet) => packet.packetId)).size, 20, "copy_patch_packet_ids_must_be_unique");

  for (const patch of patchPackets) {
    const base = baseById.get(String(patch.packetId));
    assert.ok(base, `copy_patch_packet_not_found:${patch.packetId}`);
    assert.equal(patch.status, "approved", `copy_patch_status_changed:${patch.packetId}`);
    assert.equal(patch.approvalReadiness, "app_validated", `copy_patch_readiness_changed:${patch.packetId}`);
    assert.equal(patch.packetId, base.packetId, `packet_id_changed:${patch.packetId}`);
    assert.equal(patch.openingId, base.openingId, `opening_id_changed:${patch.packetId}`);
    assert.equal(patch.lineId, base.lineId, `line_id_changed:${patch.packetId}`);
    assert.equal(patch.playKey, base.playKey, `play_key_changed:${patch.packetId}`);
    assert.equal(JSON.stringify(patch.playSequenceUci), JSON.stringify(base.playSequenceUci), `play_sequence_changed:${patch.packetId}`);
    assert.equal(JSON.stringify(patch.normalizedPlaySequenceUci ?? null), JSON.stringify(base.normalizedPlaySequenceUci ?? null), `normalized_play_sequence_changed:${patch.packetId}`);
    assert.equal(patch.moveUci, base.moveUci, `move_uci_changed:${patch.packetId}`);
    assert.equal(patch.normalizedMoveUci ?? null, base.normalizedMoveUci ?? null, `normalized_move_uci_changed:${patch.packetId}`);
    assert.equal(patch.sourceRuntimeMoveUci ?? null, base.sourceRuntimeMoveUci ?? null, `source_runtime_move_uci_changed:${patch.packetId}`);
    assert.equal(patch.moveSan, base.moveSan, `move_san_changed:${patch.packetId}`);
    assert.equal(patch.learnerSide, base.learnerSide, `learner_side_changed:${patch.packetId}`);
    assert.equal(patch.sideToMove, base.sideToMove, `side_to_move_changed:${patch.packetId}`);
    assert.equal(patch.ply, base.ply, `ply_changed:${patch.packetId}`);
    assert.equal(patch.runtimeSource, base.runtimeSource, `runtime_source_changed:${patch.packetId}`);
    assert.equal(patch.runtimePackageId, base.runtimePackageId, `runtime_package_changed:${patch.packetId}`);
    assert.equal(patch.runtimeMatched, base.runtimeMatched, `runtime_matched_changed:${patch.packetId}`);
    assert.equal(patch.targetMatched, base.targetMatched, `target_matched_changed:${patch.packetId}`);
    assert.equal(patch.plainViewSafe, base.plainViewSafe, `plain_view_safe_changed:${patch.packetId}`);
    assert.equal(JSON.stringify(patch.visualRecipe), JSON.stringify(base.visualRecipe), `visual_recipe_changed:${patch.packetId}`);
    assert.equal(JSON.stringify(stripCopyFields(patch)), JSON.stringify(stripCopyFields(base)), `non_copy_fields_changed:${patch.packetId}`);
  }
}

testStage2ApprovedCoachCardCopyPatchIntegrity();
console.log("stage2ApprovedCoachCardCopyPatchIntegrity ok");
