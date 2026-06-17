import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

export function testStage2AppPagePolicyInventory(): void {
  const filePath = path.join(process.cwd(), "docs/architecture/STAGE2_APP_PAGE_POLICY_INVENTORY.md");
  assert.equal(fs.existsSync(filePath), true, "policy_inventory_report_missing");

  const text = fs.readFileSync(filePath, "utf8");
  const requiredAreas = [
    "CurrentInstructionFrame / target selection",
    "restricted vs continuation mode",
    "branch complete",
    "Continue From Here",
    "continuation candidate selection",
    "opponent reply / provider request",
    "promotion picker and promotion suffix",
    "move submission / accepted target",
    "CoachCard selection",
    "approved-content enrichment",
    "fallback CoachCard",
    "visual arrows / highlights",
    "Plain View hint / Show More gating",
    "opening availability / visibility",
    "provider warnings",
    "feature trace construction",
    "trainer debug snapshot / Copy Everything",
    "terminal / checkmate / draw frames",
    "error / loading / empty states",
    "diagnostics panel fields",
  ];

  for (const area of requiredAreas) {
    assert.equal(text.includes(area), true, `missing_policy_area:${area}`);
  }

  const requiredClassifications = [
    "page_state_only",
    "render_only",
    "should_move_to_resolution",
    "should_move_to_stage2_coaching",
    "should_move_to_opening_availability",
    "should_move_to_visual_resolution",
    "should_move_to_provider_policy",
    "should_remain_in_page_for_now",
    "already_resolved_elsewhere",
  ];
  for (const classification of requiredClassifications) {
    assert.equal(text.includes(`\`${classification}\``), true, `missing_classification:${classification}`);
  }
}

testStage2AppPagePolicyInventory();
console.log("stage2AppPagePolicyInventory ok");
