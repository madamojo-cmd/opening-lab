import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const REPO_ROOT = path.resolve(__dirname, "..", "..");

export function testStage2PlainViewLegalMoveDotsParity(): void {
  const pageSource = fs.readFileSync(path.join(REPO_ROOT, "app", "page.tsx"), "utf8");

  assert.equal(
    /if\(\s*!instructionTarget\?\.uci\s*&&\s*!selectedSquare\s*&&\s*selectedLegalMoves\.length===0\)/.test(pageSource),
    true,
    "app_page_missing_selection_safe_visibility_gate",
  );
  assert.equal(
    /suppressPlainPreTargetHighlights\s*\?\s*null\s*:\s*instructionTarget\?\.from\s*\?\?\s*null/.test(pageSource),
    true,
    "app_page_missing_plain_view_target_from_suppression",
  );
  assert.equal(
    /suppressPlainPreTargetHighlights\s*\?\s*null\s*:\s*instructionTarget\?\.to\s*\?\?\s*null/.test(pageSource),
    true,
    "app_page_missing_plain_view_target_to_suppression",
  );
  assert.equal(
    /if\(\s*suppressPlainPreTargetHighlights\s*\|\|/.test(pageSource),
    false,
    "app_page_reintroduced_plain_view_clear_all_gate",
  );
}

testStage2PlainViewLegalMoveDotsParity();
console.log("stage2PlainViewLegalMoveDotsParity ok");
