import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const settings = readFileSync(
  path.join(root, "components/settings/SettingsPage.tsx"),
  "utf8",
);
const preferencesRoute = readFileSync(
  path.join(root, "app/api/blundr/account/preferences/route.ts"),
  "utf8",
);

assert.match(settings, />\s*Rating band\s*</);
assert.match(settings, /getAllRatingBands\(\)\.map/);
assert.match(settings, /\/api\/blundr\/account\/preferences/);
assert.match(settings, /ratingBandId: nextBand/);
assert.match(preferencesRoute, /getCurrentBlundrUser/);
assert.match(preferencesRoute, /updateOwnedTrainingPreferences/);
assert.match(preferencesRoute, /validation\.ok === false/);
assert.doesNotMatch(preferencesRoute, /allowLocalFallback:\s*true/);

console.log("settings rating-band contract ok");
