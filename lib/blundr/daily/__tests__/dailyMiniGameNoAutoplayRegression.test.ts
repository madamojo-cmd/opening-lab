import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { DailyBlundrBoard } from "@/components/daily/DailyBlundrBoard";
import { buildLegacyTestScenario } from "../miniGames/runner/legacyTestScenarioAdapter";
import { resetLocalAccountState, setLocalAccountCurrentUserId } from "../../accounts/localAccountStorage";
import { DAILY_MINI_GAME_REGISTRY } from "../miniGames/dailyMiniGameRegistry";
import { buildMiniGameBoardFeedback } from "../miniGames/runner/miniGameBoardFeedbackAdapter";
import { createInitialMiniGameRunnerState, miniGameRunnerReducer } from "../miniGames/runner/miniGameRunnerState";
import { waitForPracticeBundle } from "./dailyValidationFixtures";

void (async () => {
const userId = "mini-game-no-autoplay-user";

resetLocalAccountState(userId);
setLocalAccountCurrentUserId(userId);

for (const definition of DAILY_MINI_GAME_REGISTRY) {
  const bundle = await waitForPracticeBundle(definition.id, 0, [], userId);
  assert.ok(bundle, `Expected a practice bundle for ${definition.id}`);

  const miniGame = bundle!.card.miniGame;
  assert.equal(miniGame.scenario?.source, "standalone_review");
  assert.equal(miniGame.completed, false, `Expected ${definition.id} to start incomplete`);
  assert.equal(miniGame.currentFen, miniGame.startFen, `Expected ${definition.id} to load from the initial FEN`);
  assert.equal(miniGame.lastMoveUci ?? null, null, `Expected ${definition.id} to start without replayed moves`);

  const scenario = buildLegacyTestScenario(bundle!.card);
  assert.ok(scenario, `Expected a runner scenario for ${definition.id}`);

  const initialState = createInitialMiniGameRunnerState(scenario);
  assert.equal(initialState.status, "idle");
  assert.equal(initialState.boardFen, scenario!.board.fen);
  assert.equal(initialState.revealed, false);

  const idleFeedback = buildMiniGameBoardFeedback(scenario!, initialState);
  assert.equal(Object.keys(idleFeedback.squareStyles).length, 0, `Expected ${definition.id} idle feedback to stay visual-only`);
  assert.equal(idleFeedback.boardVisuals, null, `Expected ${definition.id} idle feedback to hide answer visuals`);
  assert.equal(idleFeedback.animationClassName, null, `Expected ${definition.id} idle feedback to stay inert`);

  const loadedState = miniGameRunnerReducer(initialState, { type: "LOAD_SCENARIO", scenario: scenario! });
  assert.equal(loadedState.status, "idle");
  assert.equal(loadedState.boardFen, scenario!.board.fen);
  assert.equal(loadedState.revealed, false);
  assert.equal(loadedState.selectedSquare, null);
  assert.equal(loadedState.attemptedMove, null);

  let squareClicks = 0;
  let moveAttempts = 0;
  const boardMarkup = renderToStaticMarkup(
    createElement(DailyBlundrBoard, {
      fen: scenario!.board.fen,
      forcedOrientation: scenario!.board.orientation,
      openingColor: scenario!.board.orientation,
      boardVisuals: idleFeedback.boardVisuals,
      squareStyles: idleFeedback.squareStyles,
      animationClassName: idleFeedback.animationClassName,
      onSquareClick: () => {
        squareClicks += 1;
      },
      onMoveAttempt: () => {
        moveAttempts += 1;
      },
    }),
  );
  assert.ok(boardMarkup.includes("White at bottom") || boardMarkup.includes("Black at bottom"));
  assert.equal(squareClicks, 0, `Expected ${definition.id} board render to stay inert on mount`);
  assert.equal(moveAttempts, 0, `Expected ${definition.id} board render to stay inert on mount`);
}

console.log("dailyMiniGameNoAutoplayRegression.test.ts passed");
})();
