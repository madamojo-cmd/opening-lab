import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

import {
  BLUNDR_ASSET_IMAGE_VARIANTS,
  BLUNDR_ASSET_IMAGE_VARIANT_FRAME_CLASSES,
  BLUNDR_VIDEO_ASSET_VARIANT_FRAME_CLASSES,
} from "../../../../components/assets/blundrAssetVariants";
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

const requiredKeys = [
  ["tempo", ["avatar", "fullBody", "pointing", "thinking", "success", "reward", "celebrate", "sad", "coach"]],
  ["rewards", ["tempoCacheClosed", "tempoCacheOpen", "tempoCacheGlow", "pointsToken", "openingFragment", "choiceToken", "epicBonus", "cardBackground", "cardBackWide", "cardBackPortrait", "rarityCommon", "rarityUncommon", "rarityRare", "rarityEpic"]],
  ["animations", ["tempoCacheOpen", "tempoCacheOpenFallback", "rewardPop", "rewardPopFallback", "pointsFloat", "pointsFloatFallback", "streakFlare", "streakFlareFallback"]],
  ["onboarding", ["realGameData", "openingContinuation", "assistedPlainDaily", "starterPackSolidBuilder", "starterPackClassicalAttacker", "starterPackDynamicFighter", "starterPackFlexibleStrategist"]],
  ["empty-states", ["emptyReviewQueue", "emptyDailyBlundr", "emptyRepertoire", "loadingTempo", "offlineLocalDemo", "errorSafeFallback"]],
  ["brand", ["logoWordmark", "appIcon", "favicon", "appleTouchIcon", "brandAppleTouchIcon", "androidChrome192", "brandAndroidChrome192", "androidChrome512", "brandAndroidChrome512"]],
];

for (const group of assetGroups) {
  for (const assetPath of Object.values(group)) {
    assert.notEqual(assetPath.trim(), "", `Expected non-empty asset path: ${assetPath}`);
    assert.ok(assetPath.startsWith("/"), `Expected root-relative asset path: ${assetPath}`);
    assert.ok(!assetPath.includes(" "), `Expected asset path without spaces: ${assetPath}`);
    assert.ok(!assetPath.includes("_incoming"), `Expected canonical asset path without incoming drop reference: ${assetPath}`);
    assert.ok(!assetPath.includes("__MACOSX"), `Expected asset path without macOS metadata reference: ${assetPath}`);
    assert.ok(existsSync(resolve(process.cwd(), `public${assetPath}`)), `Missing canonical asset file: ${assetPath}`);
  }
}

for (const [groupName, keys] of requiredKeys) {
  const group = groupName === "tempo"
    ? BLUNDR_TEMPO_ASSETS
    : groupName === "rewards"
      ? BLUNDR_REWARD_ASSETS
      : groupName === "animations"
        ? BLUNDR_REWARD_ANIMATIONS
        : groupName === "onboarding"
          ? BLUNDR_ONBOARDING_ASSETS
          : groupName === "empty-states"
            ? BLUNDR_EMPTY_STATE_ASSETS
            : BLUNDR_BRAND_ASSETS;
  for (const key of keys) {
    assert.ok(key in group, `Missing required ${groupName} asset key: ${key}`);
  }
}

for (const variant of BLUNDR_ASSET_IMAGE_VARIANTS) {
  const frameClass = BLUNDR_ASSET_IMAGE_VARIANT_FRAME_CLASSES[variant];
  assert.ok(frameClass && frameClass.includes("rounded"), `Missing frame class for asset image variant: ${variant}`);
}

assert.ok(BLUNDR_VIDEO_ASSET_VARIANT_FRAME_CLASSES.rewardAnimation.includes("aspect"), "Expected reward animation video frame class.");

assert.ok(existsSync(resolve(process.cwd(), "public/favicon.png")), "Expected root favicon alias.");
assert.ok(existsSync(resolve(process.cwd(), "public/assets/_incoming/blundr-assets-2")), "Expected incoming asset drop to be copied.");

console.log("blundrAssetManifest.test.ts passed");
