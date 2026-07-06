import assert from "node:assert/strict";

import { buildBoardRenderConfig, resolveBoardOrientation } from "../boardRenderConfig";
import { resolveBoardTheme } from "../boardThemeConfig";

const blue = buildBoardRenderConfig({
  boardThemeId: "blue",
  pieceSetId: "unicode",
  boardOrientation: "auto",
  openingColor: "white",
  showCoordinates: true,
  source: "local_demo",
});

const walnut = buildBoardRenderConfig({
  boardThemeId: "walnut",
  pieceSetId: "letters",
  boardOrientation: "auto",
  openingColor: "black",
  showCoordinates: false,
  source: "authenticated",
});

const defaultTheme = resolveBoardTheme("classic");

assert.equal(blue.boardThemeId, "blue");
assert.equal(blue.theme.squareDarkClassName, "bg-sky-700");
assert.equal(blue.theme.squareLightClassName, "bg-sky-100");
assert.equal(blue.boardOrientation, "white");
assert.equal(blue.showCoordinates, true);

assert.equal(walnut.boardThemeId, "walnut");
assert.equal(walnut.theme.squareDarkClassName, "bg-amber-800");
assert.equal(walnut.theme.squareLightClassName, "bg-amber-100");
assert.equal(walnut.boardOrientation, "black");
assert.equal(walnut.pieceSetId, "letters");
assert.equal(walnut.showCoordinates, false);

assert.equal(defaultTheme.themeId, "default");
assert.equal(defaultTheme.squareDarkClassName, "bg-[#779954]");
assert.equal(defaultTheme.squareLightClassName, "bg-[#edeed1]");
assert.equal(defaultTheme.coordinateToneClassName, "text-stone-600");

assert.equal(resolveBoardOrientation({ openingColor: "white" }), "white");
assert.equal(resolveBoardOrientation({ openingColor: "black" }), "black");
assert.equal(resolveBoardOrientation({ boardOrientation: "black", openingColor: "white" }), "black");

console.log("boardRenderConfig.test.ts passed");
