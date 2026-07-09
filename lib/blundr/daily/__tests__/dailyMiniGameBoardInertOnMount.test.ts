import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { DailyBlundrBoard } from "@/components/daily/DailyBlundrBoard";
import { buildMiniGameRunnerScenarioFromCard } from "@/components/review/MiniGamePracticeRunner";
import { resetLocalAccountState, setLocalAccountCurrentUserId } from "../../accounts/localAccountStorage";
import { buildMiniGameBoardFeedback } from "../miniGames/runner/miniGameBoardFeedbackAdapter";
import { createInitialMiniGameRunnerState } from "../miniGames/runner/miniGameRunnerState";
import { waitForPracticeBundle } from "./dailyValidationFixtures";

void (async () => {
const userId = "mini-game-board-inert-user";

resetLocalAccountState(userId);
setLocalAccountCurrentUserId(userId);

const bundle = await waitForPracticeBundle("king_race", 0, [], userId);
assert.ok(bundle, "Expected a practice bundle for king_race");

const scenario = buildMiniGameRunnerScenarioFromCard(bundle!.card);
assert.ok(scenario, "Expected a runner scenario for king_race");
const idleFeedback = buildMiniGameBoardFeedback(scenario!, createInitialMiniGameRunnerState(scenario));

let squareClicks = 0;
let moveAttempts = 0;
const markup = renderToStaticMarkup(
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

assert.ok(markup.includes("White at bottom") || markup.includes("Black at bottom"));
assert.equal(squareClicks, 0, "Expected board render to stay inert on mount");
assert.equal(moveAttempts, 0, "Expected board render to stay inert on mount");

console.log("dailyMiniGameBoardInertOnMount.test.ts passed");
})();
