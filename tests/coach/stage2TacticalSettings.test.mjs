import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const pageSource = fs.readFileSync(path.join(REPO_ROOT, "app/page.tsx"), "utf8");

assert.equal(pageSource.includes("tacticalHighlightsEnabled: true"), true, "tactical_highlights_default_missing");
assert.equal(
  pageSource.includes("legacyHighlightsDisabled") &&
    pageSource.includes("DEFAULT_BOARD_SETTINGS.tacticalHighlightsEnabled") &&
    pageSource.includes("? false"),
  true,
  "tactical_highlights_legacy_fallback_missing",
);
assert.equal(
  pageSource.includes("PROJECTIVE_TACTICS_ENABLED ? ("),
  true,
  "projective_tactics_kill_switch_missing",
);
assert.equal(
  pageSource.includes("Show visual cues when Blundr detects tactical patterns such"),
  true,
  "tactical_highlights_settings_copy_missing",
);

console.log("stage2TacticalSettings ok");
