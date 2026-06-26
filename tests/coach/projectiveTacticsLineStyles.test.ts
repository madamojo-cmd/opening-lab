import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(__dirname, "..", "..");
const css = fs.readFileSync(path.join(repoRoot, "app", "globals.css"), "utf8");
const overlay = fs.readFileSync(path.join(repoRoot, "components", "board", "ProjectiveTacticalOverlay.tsx"), "utf8");
const page = fs.readFileSync(path.join(repoRoot, "app", "page.tsx"), "utf8");

assert.equal(css.includes(".projective-tactic-line--straight{stroke-dasharray:"), true);
assert.equal(css.includes(".projective-tactic-line--knight line{"), true);
assert.equal(css.includes("projective-tactic-target"), false);
assert.equal(overlay.includes("projective-tactic-target"), false);
assert.equal(overlay.includes("showLines"), true);
assert.equal(overlay.includes("showLabels"), true);
assert.equal(overlay.includes("projective-tactic-tag"), true);
assert.equal(overlay.includes("projective-tactic-line"), true);
assert.equal(page.includes("const dash=transient"), false);
assert.equal(page.includes("strokeDasharray={dash}"), false);

console.log("projectiveTacticsLineStyles ok");
