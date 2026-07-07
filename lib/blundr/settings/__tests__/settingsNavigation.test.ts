import assert from "node:assert/strict";

import {
  BLUNDR_MAJOR_APP_LINKS,
  BLUNDR_SETTINGS_BOARD_PIECE_OPTIONS,
  BLUNDR_SETTINGS_BOARD_THEME_OPTIONS,
  BLUNDR_SETTINGS_SECTION_IDS,
} from "../settingsNavigation";

assert.deepEqual(BLUNDR_MAJOR_APP_LINKS.map((link) => link.id), ["home", "daily", "repertoire", "progress", "review"]);
assert.deepEqual(BLUNDR_SETTINGS_BOARD_THEME_OPTIONS.map((option) => option.id), ["default", "blue", "walnut"]);
assert.deepEqual(BLUNDR_SETTINGS_BOARD_PIECE_OPTIONS.map((option) => option.id), ["unicode", "neo", "letters"]);
assert.ok(BLUNDR_SETTINGS_SECTION_IDS.includes("account"));
assert.ok(BLUNDR_SETTINGS_SECTION_IDS.includes("developer_tools"));

console.log("settingsNavigation.test.ts passed");
