import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

function testStage2TrainLayoutPolish() {
  const pageSource = fs.readFileSync(path.join(REPO_ROOT, "app/page.tsx"), "utf8");
  const trainStart = pageSource.indexOf('{activeTab === "train" && (');
  const reviewStart = pageSource.indexOf('{isActiveTab(activeTab, "review") && (');

  assert.notEqual(trainStart, -1, "train_section_not_found");
  assert.notEqual(reviewStart, -1, "review_section_not_found");

  const trainSection = pageSource.slice(trainStart, reviewStart);

  assert.equal(
    trainSection.includes("Teaching cue ready."),
    false,
    "train_section_still_exposes_old_teaching_copy",
  );
  assert.equal(
    trainSection.includes("Restricted runtime authority"),
    false,
    "train_section_still_exposes_runtime_authority_copy",
  );
  assert.equal(
    trainSection.includes("Ready"),
    false,
    "train_section_still_exposes_ready_relic",
  );
  assert.equal(
    trainSection.includes("Authoritative daily rings for this training run."),
    true,
    "train_session_card_missing_daily_ring_copy",
  );
  assert.equal(
    pageSource.includes("calc(100vh - 16rem)") &&
      pageSource.includes("maxWidth: \"min(100%"),
    true,
    "train_board_wrapper_missing_viewport_height_limit",
  );

  const assistedIndex = trainSection.indexOf('handleTrainerViewChange("assisted")');
  const coachCardIndex = trainSection.indexOf("<CoachCard");
  const sessionIndex = trainSection.indexOf("Authoritative daily rings for this training run.");
  const taskIndex = trainSection.indexOf("Your move");

  assert.notEqual(assistedIndex, -1, "train_toggle_not_found");
  assert.notEqual(coachCardIndex, -1, "train_coach_card_not_found");
  assert.notEqual(sessionIndex, -1, "train_session_card_not_found");
  assert.notEqual(taskIndex, -1, "train_task_card_not_found");
  assert.ok(assistedIndex < coachCardIndex, "toggle_should_precede_coach_card");
  assert.ok(coachCardIndex < sessionIndex, "coach_card_should_precede_session_card");
  assert.ok(sessionIndex < taskIndex, "session_card_should_precede_task_card");
}

testStage2TrainLayoutPolish();
console.log("stage2TrainLayoutPolish ok");
