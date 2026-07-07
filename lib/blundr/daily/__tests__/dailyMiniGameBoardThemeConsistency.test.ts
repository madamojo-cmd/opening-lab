import assert from "node:assert/strict";

import { buildBoardRenderConfig } from "../../board/boardRenderConfig";
import { resolveBoardPreferences } from "../../board/boardPreferenceService";

const shared = {
  pieceSetId: "unicode",
  showCoordinates: true,
  boardOrientation: "white",
  source: "local_demo",
  updatedAt: "2026-07-06T12:30:00.000Z",
};

const bluePrefs = resolveBoardPreferences({ ...shared, boardThemeId: "blue" });
const blueTrainingConfig = buildBoardRenderConfig({ ...bluePrefs, openingColor: "white", userColor: "white", fenTurn: "white" });
const blueDailyConfig = buildBoardRenderConfig({ ...bluePrefs, openingColor: "white", userColor: "white", fenTurn: "white" });
assert.deepEqual(blueTrainingConfig, blueDailyConfig);
assert.equal(blueTrainingConfig.theme.themeId, "blue");

const walnutPrefs = resolveBoardPreferences({ ...shared, boardThemeId: "walnut" });
const walnutTrainingConfig = buildBoardRenderConfig({ ...walnutPrefs, openingColor: "black", userColor: "black", fenTurn: "black" });
const walnutDailyConfig = buildBoardRenderConfig({ ...walnutPrefs, openingColor: "black", userColor: "black", fenTurn: "black" });
assert.deepEqual(walnutTrainingConfig, walnutDailyConfig);
assert.equal(walnutTrainingConfig.theme.themeId, "walnut");

const legacyDefault = resolveBoardPreferences({ ...shared, boardThemeId: "classic" });
assert.equal(legacyDefault.boardThemeId, "default");
assert.equal(buildBoardRenderConfig({ ...legacyDefault }).theme.themeId, "default");

console.log("dailyMiniGameBoardThemeConsistency.test.ts passed");
