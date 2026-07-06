import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

import {
  BLUNDR_BRAND_ASSETS,
  BLUNDR_EMPTY_STATE_ASSETS,
  BLUNDR_ONBOARDING_ASSETS,
  BLUNDR_REWARD_ANIMATIONS,
  BLUNDR_REWARD_ASSETS,
  BLUNDR_TEMPO_ASSETS,
} from "../blundrAssetManifest";

const assetGroups = [
  BLUNDR_TEMPO_ASSETS,
  BLUNDR_REWARD_ASSETS,
  BLUNDR_REWARD_ANIMATIONS,
  BLUNDR_ONBOARDING_ASSETS,
  BLUNDR_EMPTY_STATE_ASSETS,
  BLUNDR_BRAND_ASSETS,
];

for (const group of assetGroups) {
  for (const assetPath of Object.values(group)) {
    assert.ok(assetPath.startsWith("/"), `Expected root-relative asset path: ${assetPath}`);
    assert.ok(existsSync(resolve(process.cwd(), `public${assetPath}`)), `Missing canonical asset file: ${assetPath}`);
  }
}

assert.ok(existsSync(resolve(process.cwd(), "public/assets/_incoming/blundr-assets-2")), "Expected incoming asset drop to be copied.");

console.log("blundrAssetManifest.test.ts passed");

