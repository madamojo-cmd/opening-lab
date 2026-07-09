import assert from "node:assert/strict";

import { buildMiniGameBoardFeedback } from "../miniGames/runner/miniGameBoardFeedbackAdapter";
import { createInitialMiniGameRunnerState, miniGameRunnerReducer } from "../miniGames/runner/miniGameRunnerState";
import { buildMiniGameRunnerScenarioFromCard } from "@/components/review/MiniGamePracticeRunner";
import { resetLocalAccountState, setLocalAccountCurrentUserId } from "../../accounts/localAccountStorage";
import { waitForPracticeBundle } from "./dailyValidationFixtures";

void (async () => {
  const userId = "mini-game-trainer-board-consistency-user";

  resetLocalAccountState(userId);
  setLocalAccountCurrentUserId(userId);

  const bundle = await waitForPracticeBundle("tactic_shots", 0, [], userId);
  assert.ok(bundle, "Expected a practice bundle for tactic_shots");

  const scenario = buildMiniGameRunnerScenarioFromCard(bundle!.card);
  assert.ok(scenario, "Expected a runner scenario for tactic_shots");

  const idle = createInitialMiniGameRunnerState(scenario);
  const idleFeedback = buildMiniGameBoardFeedback(scenario, idle);
  assert.equal(Object.keys(idleFeedback.squareStyles).length, 0);
  assert.equal(idleFeedback.boardVisuals, null);
  assert.equal(idleFeedback.animationClassName, null);

  const selected = miniGameRunnerReducer(idle, { type: "USER_SELECT_SQUARE", square: scenario.solution.from });
  const submitted = miniGameRunnerReducer(selected, {
    type: "USER_SUBMIT_MOVE",
    from: scenario.solution.from,
    to: scenario.solution.to,
    uci: scenario.solution.primaryMoveUci,
    san: null,
  });
  const correct = miniGameRunnerReducer(submitted, {
    type: "VALIDATION_RESULT",
    status: "correct",
    boardFen: scenario.board.fen,
    feedback: { message: "Correct", tone: "complete" },
    reason: "trainer_board_consistency",
  });
  const correctFeedback = buildMiniGameBoardFeedback(scenario, correct);
  assert.equal(Boolean(correctFeedback.animationClassName?.startsWith("blundr-anim-")), true);
  assert.equal(Boolean(correctFeedback.squareStyles[scenario.solution.from]), true);
  assert.equal(Boolean(correctFeedback.squareStyles[scenario.solution.to]), true);
  assert.equal(Boolean(correctFeedback.boardVisuals), true);

  const revealed = miniGameRunnerReducer(correct, { type: "USER_REVEAL" });
  const revealFeedback = buildMiniGameBoardFeedback(scenario, revealed);
  assert.equal(Boolean(revealFeedback.boardVisuals), true);
  assert.equal(Boolean(revealFeedback.boardVisuals?.visualRecipes.some((recipe) => recipe.from === scenario.solution.from && recipe.to === scenario.solution.to)), true);
  assert.equal(Boolean(revealFeedback.boardVisuals?.visualRecipes.some((recipe) => Array.isArray(recipe.squares) && recipe.squares.includes(scenario.solution.from))), true);

  const incorrect = miniGameRunnerReducer(submitted, {
    type: "VALIDATION_RESULT",
    status: "incorrect",
    boardFen: scenario.board.fen,
    feedback: { message: "Incorrect", tone: "warning" },
    reason: "trainer_board_consistency_wrong",
  });
  const incorrectFeedback = buildMiniGameBoardFeedback(scenario, incorrect);
  assert.equal(incorrectFeedback.boardVisuals, null);
  assert.equal(Boolean(incorrectFeedback.squareStyles[scenario.solution.from]), true);
  assert.equal(Boolean(incorrectFeedback.squareStyles[scenario.solution.to]), true);

  console.log("dailyMiniGameTrainerBoardConsistency.test.ts passed");
})();
