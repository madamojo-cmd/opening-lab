import assert from "node:assert/strict";

import { resetLocalAccountState, setLocalAccountCurrentUserId } from "../../accounts/localAccountStorage";
import { DAILY_MINI_GAME_REGISTRY } from "../miniGames/dailyMiniGameRegistry";
import { buildMiniGameRunnerScenarioFromCard, buildPracticeBundle } from "@/components/review/MiniGamePracticeRunner";
import {
  canSubmitMove,
  createInitialMiniGameRunnerState,
  miniGameRunnerReducer,
  shouldAllowRetry,
  shouldShowReveal,
} from "../miniGames/runner/miniGameRunnerState";

const userId = "mini-game-runner-state-machine-user";

resetLocalAccountState(userId);
setLocalAccountCurrentUserId(userId);

for (const definition of DAILY_MINI_GAME_REGISTRY) {
  const bundle = buildPracticeBundle(definition.id, 0, [], userId);
  assert.ok(bundle, `Expected a practice bundle for ${definition.id}`);
  assert.equal(bundle?.card.miniGame.scenario?.source, "standalone_review");

  const scenario = buildMiniGameRunnerScenarioFromCard(bundle!.card);
  assert.ok(scenario, `Expected a runner scenario for ${definition.id}`);

  const initial = createInitialMiniGameRunnerState(scenario);
  assert.equal(initial.status, "idle");
  assert.equal(initial.boardFen, scenario.board.fen);
  assert.equal(initial.selectedSquare, null);
  assert.equal(initial.attemptedMove, null);
  assert.equal(initial.revealed, false);
  assert.equal(initial.disabledDuringValidation, false);
  assert.equal(initial.attemptCount, 0);

  const loaded = miniGameRunnerReducer(initial, { type: "LOAD_SCENARIO", scenario });
  assert.equal(loaded.status, "idle");
  assert.equal(loaded.boardFen, scenario.board.fen);
  assert.equal(loaded.selectedSquare, null);
  assert.equal(loaded.attemptedMove, null);
  assert.equal(loaded.revealed, false);
  assert.equal(canSubmitMove(loaded), false);
  assert.equal(shouldShowReveal(loaded), true);
  assert.equal(shouldAllowRetry(loaded), false);

  const ignoredValidation = miniGameRunnerReducer(loaded, {
    type: "VALIDATION_RESULT",
    status: "correct",
    boardFen: "changed-fen",
    feedback: { message: "ignored", tone: "complete" },
    reason: "ignored_before_submit",
  });
  assert.deepEqual(ignoredValidation, loaded);

  const selected = miniGameRunnerReducer(loaded, { type: "USER_SELECT_SQUARE", square: scenario.solution.from });
  assert.equal(selected.status, "piece_selected");
  assert.equal(selected.selectedSquare, scenario.solution.from.toLowerCase());
  assert.equal(canSubmitMove(selected), true);
  assert.equal(shouldShowReveal(selected), false);

  const ignoredSubmit = miniGameRunnerReducer(selected, {
    type: "USER_SUBMIT_MOVE",
    from: "",
    to: "",
    uci: "",
    san: null,
  });
  assert.deepEqual(ignoredSubmit, selected);

  const submitted = miniGameRunnerReducer(selected, {
    type: "USER_SUBMIT_MOVE",
    from: scenario.solution.from,
    to: scenario.solution.to,
    uci: scenario.solution.primaryMoveUci,
    san: null,
  });
  assert.equal(submitted.status, "submitted");
  assert.equal(submitted.disabledDuringValidation, true);
  assert.equal(submitted.attemptCount, 1);

  const duplicateSubmit = miniGameRunnerReducer(submitted, {
    type: "USER_SUBMIT_MOVE",
    from: scenario.solution.from,
    to: scenario.solution.to,
    uci: scenario.solution.primaryMoveUci,
    san: null,
  });
  assert.deepEqual(duplicateSubmit, submitted);

  const animationIgnored = miniGameRunnerReducer(submitted, { type: "BOARD_ANIMATION_COMPLETE" });
  assert.deepEqual(animationIgnored, submitted);

  const correct = miniGameRunnerReducer(submitted, {
    type: "VALIDATION_RESULT",
    status: "correct",
    boardFen: scenario.board.fen,
    feedback: { message: "Correct", tone: "complete" },
    reason: "best_known_route",
  });
  assert.equal(correct.status, "correct");
  assert.equal(correct.disabledDuringValidation, false);
  assert.equal(correct.boardFen, scenario.board.fen);
  assert.equal(correct.selectedSquare, null);
  assert.equal(correct.revealed, false);

  const revealed = miniGameRunnerReducer(correct, { type: "USER_REVEAL" });
  assert.equal(revealed.status, "revealed");
  assert.equal(revealed.boardFen, scenario.board.fen);
  assert.equal(revealed.revealed, true);
  assert.equal(shouldShowReveal(revealed), false);
  assert.equal(shouldAllowRetry(revealed), false);

  const nextScenario = miniGameRunnerReducer(revealed, { type: "USER_NEXT_SCENARIO" });
  assert.equal(nextScenario.status, "idle");
  assert.equal(nextScenario.boardFen, scenario.board.fen);
  assert.equal(nextScenario.selectedSquare, null);
  assert.equal(nextScenario.attemptedMove, null);
  assert.equal(nextScenario.feedback, null);
  assert.equal(nextScenario.revealed, false);
  assert.equal(nextScenario.attemptCount, 0);

  const wrongLoad = miniGameRunnerReducer(loaded, { type: "USER_SELECT_SQUARE", square: scenario.solution.from });
  const wrongSubmitted = miniGameRunnerReducer(wrongLoad, {
    type: "USER_SUBMIT_MOVE",
    from: scenario.solution.from,
    to: scenario.solution.to,
    uci: scenario.solution.primaryMoveUci,
    san: null,
  });
  const incorrect = miniGameRunnerReducer(wrongSubmitted, {
    type: "VALIDATION_RESULT",
    status: "incorrect",
    boardFen: scenario.board.fen,
    feedback: { message: "Incorrect", tone: "warning" },
    reason: "try_again",
  });
  assert.equal(incorrect.status, "incorrect");
  assert.equal(shouldAllowRetry(incorrect), true);

  const retry = miniGameRunnerReducer(incorrect, { type: "USER_TRY_AGAIN" });
  assert.equal(retry.status, "idle");
  assert.equal(retry.boardFen, scenario.board.fen);
  assert.equal(retry.selectedSquare, null);
  assert.equal(retry.attemptedMove, null);
  assert.equal(retry.feedback, null);
  assert.equal(retry.revealed, false);

  const revealFromIdle = miniGameRunnerReducer(retry, { type: "USER_REVEAL" });
  assert.equal(revealFromIdle.status, "revealed");
  assert.equal(revealFromIdle.boardFen, scenario.board.fen);
  assert.equal(revealFromIdle.revealed, true);

  const strictModeLoad = miniGameRunnerReducer(
    miniGameRunnerReducer(createInitialMiniGameRunnerState(scenario), { type: "LOAD_SCENARIO", scenario }),
    { type: "LOAD_SCENARIO", scenario },
  );
  assert.equal(strictModeLoad.status, "idle");
  assert.equal(strictModeLoad.boardFen, scenario.board.fen);
  assert.equal(strictModeLoad.attemptCount, 0);
}

console.log("dailyMiniGameRunnerStateMachine.test.ts passed");
