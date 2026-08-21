import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

function countOccurrences(source, needle) {
  return source.split(needle).length - 1;
}

function extractSection(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert.notEqual(start, -1, "section_start_not_found");
  assert.notEqual(end, -1, "section_end_not_found");
  return source.slice(start, end);
}

function testStage2TrainLayoutPolish() {
  const pageSource = fs.readFileSync(path.join(REPO_ROOT, "app/page.tsx"), "utf8");
  const trainSection = extractSection(
    pageSource,
    '{activeTab === "train" && (',
    '{isActiveTab(activeTab, "review") && (',
  );

  assert.equal(
    trainSection.includes("<PipelineStatus"),
    false,
    "train_section_still_renders_pipeline_status",
  );
  assert.equal(
    countOccurrences(trainSection, "data-train-board-column"),
    1,
    "train_section_should_have_one_board_column_wrapper",
  );
  assert.equal(
    countOccurrences(trainSection, "data-train-aside"),
    1,
    "train_section_should_have_one_right_aside_wrapper",
  );
  assert.equal(
    countOccurrences(trainSection, "data-train-board-workspace"),
    1,
    "train_section_should_have_one_board_workspace_wrapper",
  );
  assert.equal(
    trainSection.includes('lg:col-start-2'),
    false,
    "train_section_still_uses_per_card_column_start",
  );

  const boardColumnStart = trainSection.indexOf("data-train-board-column");
  const asideStart = trainSection.indexOf("<aside data-train-aside");
  const boardWorkspaceStart = trainSection.indexOf("data-train-board-workspace");
  const asideEnd = trainSection.indexOf("</aside>", asideStart);

  assert.notEqual(boardColumnStart, -1, "board_column_wrapper_not_found");
  assert.notEqual(asideStart, -1, "right_aside_wrapper_not_found");
  assert.notEqual(boardWorkspaceStart, -1, "board_workspace_wrapper_not_found");
  assert.notEqual(asideEnd, -1, "right_aside_close_not_found");
  assert.ok(boardColumnStart < asideStart, "board_column_should_precede_aside");

  const boardWorkspaceSlice = trainSection.slice(boardWorkspaceStart, asideStart);
  const asideSection = trainSection.slice(asideStart, asideEnd);

  assert.equal(
    pageSource.includes(
      "resolveTrainBoardWorkspaceMaxWidth(settings.showEvalBar)",
    ),
    true,
    "board_workspace_missing_viewport_height_helper",
  );
  assert.equal(
    boardWorkspaceSlice.includes("TapChessboard") &&
      boardWorkspaceSlice.includes("HistoryControls"),
    true,
    "board_workspace_missing_board_or_history_controls",
  );
  assert.equal(
    boardWorkspaceSlice.includes("evaluationBar={evaluationBarDisplay}"),
    true,
    "board_workspace_missing_eval_bar_mount",
  );
  assert.equal(
    pageSource.includes("resolveTrainBoardWorkspaceMaxWidth(settings.showEvalBar)") &&
      pageSource.includes("settings.showEvalBar ?") &&
      pageSource.includes("evaluationBar={evaluationBarDisplay}"),
    true,
    "board_workspace_should_gate_eval_bar_only_on_show_setting",
  );

  const assistedIndex = asideSection.indexOf('handleTrainerViewChange("assisted")');
  const coachCardIndex = asideSection.indexOf("<CoachCard");
  const sessionIndex = asideSection.indexOf("Authoritative daily rings for this training run.");
  const taskIndex = asideSection.indexOf('? "Your move"');

  assert.notEqual(assistedIndex, -1, "right_aside_toggle_not_found");
  assert.notEqual(coachCardIndex, -1, "right_aside_coach_card_not_found");
  assert.notEqual(sessionIndex, -1, "right_aside_session_card_not_found");
  assert.notEqual(taskIndex, -1, "right_aside_task_card_not_found");
  assert.ok(assistedIndex < coachCardIndex, "toggle_should_precede_coach_card");
  assert.ok(coachCardIndex < sessionIndex, "coach_card_should_precede_session_card");
  assert.ok(sessionIndex < taskIndex, "session_card_should_precede_task_card");
  assert.equal(
    asideSection.includes("dailyRingSnapshot.tempo.current") &&
      asideSection.includes("dailyRingSnapshot.tempo.target") &&
      asideSection.includes("dailyRingSnapshot.battery.current") &&
      asideSection.includes("dailyRingSnapshot.battery.target"),
    true,
    "right_aside_should_use_daily_ring_snapshot_source",
  );
  assert.equal(
    asideSection.includes("lg:col-start-2"),
    false,
    "right_aside_should_not_use_grid_column_start",
  );
}

testStage2TrainLayoutPolish();
console.log("stage2TrainLayoutPolish ok");
