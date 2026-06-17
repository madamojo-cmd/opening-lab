import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { loadLegacyNoBypassInventory } from "./stage2LegacyNoBypassTestHelpers";

export function testStage2LegacyNoBypassInventory(): void {
  const reportPath = path.join(process.cwd(), "docs/architecture/STAGE2_LEGACY_NO_BYPASS_AUDIT.md");
  const inventoryPath = path.join(process.cwd(), "data/blundr/stage2-legacy-no-bypass-inventory.json");

  assert.equal(fs.existsSync(reportPath), true, "legacy_audit_report_missing");
  assert.equal(fs.existsSync(inventoryPath), true, "legacy_audit_inventory_missing");

  const reportText = fs.readFileSync(reportPath, "utf8");
  const requiredAreas = [
    "app/page.tsx remaining page-local policy",
    "CurrentInstructionFrame construction",
    "TrainerFrameResolution",
    "Stage 2 coaching resolver",
    "approved-content resolver",
    "copy-polish patch loader",
    "safe fallback CoachCard",
    "legacy live coach / coachDecision path",
    "visible surface / current surface / `visible_surface_v28`",
    "board visual primitives",
    "approved visual recipe path",
    "generated visual recipe path",
    "fallback/current-surface visuals",
    "FeatureTrace",
    "TrainerDebugSnapshot",
    "Copy Everything payload",
    "Diagnostics Panel",
    "openingAvailability",
    "runtime book loader",
    "opening tree / repertoire line inputs",
    "branch complete",
    "Continue From Here",
    "continuation candidate selection",
    "Maia/opponent reply path",
    "Stockfish validation/gating path",
    "provider warning/fallback path",
    "promotion picker",
    "promotion suffix handling",
    "castling normalization",
    "Plain View hint / Show More gating",
    "terminal/checkmate/draw handling",
    "dead imports and unused sample paths",
  ];
  for (const area of requiredAreas) {
    assert.equal(reportText.includes(area), true, `missing_audit_area:${area}`);
  }

  const entries = loadLegacyNoBypassInventory();
  assert.ok(entries.length >= 20, "expected_audit_entries");

  const pathIds = new Set(entries.map((entry) => String(entry.pathId ?? "")));
  for (const requiredPathId of [
    "app_page_orchestration",
    "current_instruction_frame",
    "continuation_candidate_resolution",
    "restricted_runtime_book_handoff",
    "promotion_authority",
    "rendered_coach_copy_authority",
    "stage2_coach_render_state",
    "stage2_coaching_packet_resolver",
    "stage2_safe_fallback_packet",
    "approved_content_exact_match_resolver",
    "trainer_frame_resolution_builder",
    "stage2_feature_trace_builder",
    "trainer_debug_snapshot",
    "copy_everything_payload",
    "opening_availability_matrix",
    "legacy_sample_content_tree",
    "legacy_crawled_runtime_source_tree",
    "legacy_all23_snapshot",
  ]) {
    assert.equal(pathIds.has(requiredPathId), true, `missing_path_id:${requiredPathId}`);
  }

  for (const entry of entries) {
    assert.equal(typeof entry.classification === "string", true, `missing_classification:${String(entry.pathId ?? entry.file)}`);
    if (entry.classification === "needs_followup") {
      assert.equal(String(entry.notes ?? "").trim().length > 0, true, `missing_notes:${String(entry.pathId ?? entry.file)}`);
    }
  }
}

testStage2LegacyNoBypassInventory();
console.log("stage2LegacyNoBypassInventory ok");

