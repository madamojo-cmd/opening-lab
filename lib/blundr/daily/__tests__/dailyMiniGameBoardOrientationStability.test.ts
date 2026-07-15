import assert from "node:assert/strict";

import { buildLegacyTestScenario } from "../miniGames/runner/legacyTestScenarioAdapter";
import {
  resetLocalAccountState,
  setLocalAccountCurrentUserId,
} from "../../accounts/localAccountStorage";
import { buildBoardRenderConfig } from "../../board/boardRenderConfig";
import { waitForPracticeBundle } from "./dailyValidationFixtures";

void (async () => {
  const lockedWhite = buildBoardRenderConfig({
    boardThemeId: "default",
    boardOrientation: "auto",
  });

  const explicitBlack = buildBoardRenderConfig({
    boardThemeId: "default",
    boardOrientation: "auto",
    openingColor: "black",
  });

  assert.equal(lockedWhite.boardOrientation, "white");
  assert.equal(explicitBlack.boardOrientation, "black");

  const userId = "mini-game-orientation-user";
  resetLocalAccountState(userId);
  setLocalAccountCurrentUserId(userId);

  const bundle = await waitForPracticeBundle("king_race", 0, [], userId);
  assert.ok(bundle);

  const scenario = buildLegacyTestScenario(bundle!.card);
  assert.ok(scenario);
  assert.equal(scenario?.board.lockedOrientation, true);
  assert.equal(scenario?.board.orientation, bundle?.card.miniGame.learnerSide);

  console.log("dailyMiniGameBoardOrientationStability.test.ts passed");
})();
