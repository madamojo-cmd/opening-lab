import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);

const pageSource = fs.readFileSync(
  path.join(REPO_ROOT, "app/page.tsx"),
  "utf8",
);
const globalCss = fs.readFileSync(
  path.join(REPO_ROOT, "app/globals.css"),
  "utf8",
);

function extractSection(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert.notEqual(start, -1, `${startMarker}_start_not_found`);
  assert.notEqual(end, -1, `${endMarker}_end_not_found`);
  return source.slice(start, end);
}

const boardSection = extractSection(
  pageSource,
  "function TapChessboard({",
  "function CapturedStrip({",
);
const evalSection = extractSection(
  pageSource,
  "function EvalBar({",
  "function temporalGateColor",
);

assert.equal(
  boardSection.includes('data-train-board-bleed'),
  true,
  "train_board_missing_mobile_bleed_wrapper",
);
assert.equal(
  globalCss.includes("@media (max-width: 639px)") &&
    globalCss.includes(".train-board-mobile-bleed") &&
    globalCss.includes("width: 100dvw") &&
    globalCss.includes("max-width: 100dvw") &&
    globalCss.includes("calc(50% - 50dvw)"),
  true,
  "mobile_board_bleed_css_missing",
);
assert.equal(
  boardSection.includes("rounded-none border-0") &&
    boardSection.includes("sm:rounded-[18px] sm:border"),
  true,
  "mobile_board_frame_should_be_removed_and_restored_at_tablet",
);
assert.equal(
  boardSection.includes("sm:max-w-[var(--train-board-unit-max-width)]") &&
    boardSection.includes("resolveTrainBoardWorkspaceMaxWidth"),
  true,
  "board_viewport_width_constraint_should_be_desktop_scoped",
);

assert.equal(
  evalSection.includes('orientation: "horizontal" | "vertical"'),
  true,
  "eval_bar_missing_explicit_responsive_orientation",
);
assert.equal(
  evalSection.includes("data-eval-bar-mobile") &&
    evalSection.includes("sm:hidden") &&
    evalSection.includes("h-[6px]") &&
    evalSection.includes("width: `${barDisplay.blackPercent}%`") &&
    evalSection.includes("width: `${barDisplay.whitePercent}%`"),
  true,
  "mobile_horizontal_eval_track_missing_or_not_proportional",
);
assert.equal(
  evalSection.includes("data-eval-bar-desktop") &&
    evalSection.includes("hidden w-5") &&
    evalSection.includes("sm:w-6") &&
    !evalSection.includes("w-8 shrink-0") &&
    !evalSection.includes("sm:w-9"),
  true,
  "desktop_eval_bar_should_be_slim_vertical_only",
);
assert.equal(
  evalSection.includes("Advantage evaluation:") &&
    evalSection.includes("display ?? ({ state: \"pending\", label: \"—\" }"),
  true,
  "eval_bar_should_keep_accessible_neutral_first_load",
);
assert.equal(
  evalSection.includes("compactEvaluationLabel") &&
    evalSection.includes("nextDisplay.label"),
  true,
  "eval_label_presentation_should_not_change_evaluation_lifecycle",
);

console.log("trainResponsiveBoardPresentation ok");
