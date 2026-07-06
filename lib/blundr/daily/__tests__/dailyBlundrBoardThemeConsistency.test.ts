import assert from "node:assert/strict";

import { buildBoardRenderConfig } from "../../board/boardRenderConfig";
import { resolveBoardPreferences } from "../../board/boardPreferenceService";

const legacyTrainingSettings = {
  boardTheme: "blue",
  pieceStyle: "neo",
  showCoordinates: true,
  boardOrientation: "white",
  source: "local_demo",
  updatedAt: "2026-07-06T12:00:00.000Z",
};

const normalized = resolveBoardPreferences(legacyTrainingSettings);
const trainingConfig = buildBoardRenderConfig(normalized);
const dailyConfig = buildBoardRenderConfig({
  boardThemeId: normalized.boardThemeId,
  pieceSetId: normalized.pieceSetId,
  showCoordinates: normalized.showCoordinates,
  boardOrientation: normalized.boardOrientation,
  source: normalized.source,
  updatedAt: normalized.updatedAt,
});

assert.deepEqual(dailyConfig, trainingConfig);
assert.equal(trainingConfig.theme.squareDarkClassName, "bg-sky-700");
assert.equal(buildBoardRenderConfig({ boardThemeId: "walnut", boardOrientation: "auto", openingColor: "black" }).boardOrientation, "black");
assert.equal(buildBoardRenderConfig({ boardThemeId: "default", boardOrientation: "auto", openingColor: "white" }).boardOrientation, "white");

console.log("dailyBlundrBoardThemeConsistency.test.ts passed");
