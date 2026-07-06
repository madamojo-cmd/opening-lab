import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  BLUNDR_BRAND_ASSETS,
  BLUNDR_EMPTY_STATE_ASSETS,
  BLUNDR_ONBOARDING_ASSETS,
  BLUNDR_REWARD_ASSETS,
  BLUNDR_TEMPO_ASSETS,
} from "../blundrAssetManifest";

type AssetCheck = {
  label: string;
  path: string;
  expectAlpha: boolean;
};

const ROOT_ALIAS_ASSETS = [
  { label: "root favicon", path: "/favicon.png" },
  { label: "root apple touch icon", path: "/apple-touch-icon.png" },
  { label: "root android chrome 192", path: "/android-chrome-192x192.png" },
  { label: "root android chrome 512", path: "/android-chrome-512x512.png" },
] as const;

const TRANSPARENT_EXPECTED: AssetCheck[] = [
  { label: "tempo avatar", path: BLUNDR_TEMPO_ASSETS.avatar, expectAlpha: true },
  { label: "tempo full body", path: BLUNDR_TEMPO_ASSETS.fullBody, expectAlpha: true },
  { label: "tempo pointing", path: BLUNDR_TEMPO_ASSETS.pointing, expectAlpha: true },
  { label: "tempo thinking", path: BLUNDR_TEMPO_ASSETS.thinking, expectAlpha: true },
  { label: "tempo success", path: BLUNDR_TEMPO_ASSETS.success, expectAlpha: true },
  { label: "tempo reward", path: BLUNDR_TEMPO_ASSETS.reward, expectAlpha: true },
  { label: "tempo celebrate", path: BLUNDR_TEMPO_ASSETS.celebrate, expectAlpha: true },
  { label: "tempo sad", path: BLUNDR_TEMPO_ASSETS.sad, expectAlpha: true },
  { label: "tempo coach", path: BLUNDR_TEMPO_ASSETS.coach, expectAlpha: true },
  { label: "tempo cache closed", path: BLUNDR_REWARD_ASSETS.tempoCacheClosed, expectAlpha: true },
  { label: "tempo cache open", path: BLUNDR_REWARD_ASSETS.tempoCacheOpen, expectAlpha: true },
  { label: "tempo cache glow", path: BLUNDR_REWARD_ASSETS.tempoCacheGlow, expectAlpha: true },
  { label: "reward points token", path: BLUNDR_REWARD_ASSETS.pointsToken, expectAlpha: true },
  { label: "reward opening fragment", path: BLUNDR_REWARD_ASSETS.openingFragment, expectAlpha: true },
  { label: "reward choice token", path: BLUNDR_REWARD_ASSETS.choiceToken, expectAlpha: true },
  { label: "reward epic bonus", path: BLUNDR_REWARD_ASSETS.epicBonus, expectAlpha: true },
  { label: "reward card background", path: BLUNDR_REWARD_ASSETS.cardBackground, expectAlpha: true },
  { label: "reward card back wide", path: BLUNDR_REWARD_ASSETS.cardBackWide, expectAlpha: true },
  { label: "reward card back portrait", path: BLUNDR_REWARD_ASSETS.cardBackPortrait, expectAlpha: true },
  { label: "reward rarity common", path: BLUNDR_REWARD_ASSETS.rarityCommon, expectAlpha: true },
  { label: "reward rarity uncommon", path: BLUNDR_REWARD_ASSETS.rarityUncommon, expectAlpha: true },
  { label: "reward rarity rare", path: BLUNDR_REWARD_ASSETS.rarityRare, expectAlpha: true },
  { label: "reward rarity epic", path: BLUNDR_REWARD_ASSETS.rarityEpic, expectAlpha: true },
  { label: "empty review queue", path: BLUNDR_EMPTY_STATE_ASSETS.emptyReviewQueue, expectAlpha: true },
  { label: "empty daily blundr", path: BLUNDR_EMPTY_STATE_ASSETS.emptyDailyBlundr, expectAlpha: true },
  { label: "empty repertoire", path: BLUNDR_EMPTY_STATE_ASSETS.emptyRepertoire, expectAlpha: true },
  { label: "loading tempo", path: BLUNDR_EMPTY_STATE_ASSETS.loadingTempo, expectAlpha: true },
  { label: "offline local demo", path: BLUNDR_EMPTY_STATE_ASSETS.offlineLocalDemo, expectAlpha: true },
  { label: "error safe fallback", path: BLUNDR_EMPTY_STATE_ASSETS.errorSafeFallback, expectAlpha: true },
  { label: "brand logo wordmark", path: BLUNDR_BRAND_ASSETS.logoWordmark, expectAlpha: true },
  { label: "brand app icon", path: BLUNDR_BRAND_ASSETS.appIcon, expectAlpha: true },
  { label: "brand favicon", path: BLUNDR_BRAND_ASSETS.favicon, expectAlpha: true },
  { label: "brand apple touch icon", path: BLUNDR_BRAND_ASSETS.brandAppleTouchIcon, expectAlpha: true },
  { label: "brand android chrome 192", path: BLUNDR_BRAND_ASSETS.brandAndroidChrome192, expectAlpha: true },
  { label: "brand android chrome 512", path: BLUNDR_BRAND_ASSETS.brandAndroidChrome512, expectAlpha: true },
  { label: "root favicon", path: "/favicon.png", expectAlpha: true },
  { label: "root apple touch icon", path: "/apple-touch-icon.png", expectAlpha: true },
  { label: "root android chrome 192", path: "/android-chrome-192x192.png", expectAlpha: true },
  { label: "root android chrome 512", path: "/android-chrome-512x512.png", expectAlpha: true },
];

const FORMAT_ONLY_EXPECTED = [
  { label: "onboarding real game data", path: BLUNDR_ONBOARDING_ASSETS.realGameData },
  { label: "onboarding opening continuation", path: BLUNDR_ONBOARDING_ASSETS.openingContinuation },
  { label: "onboarding assisted plain daily", path: BLUNDR_ONBOARDING_ASSETS.assistedPlainDaily },
  { label: "starter pack solid builder", path: BLUNDR_ONBOARDING_ASSETS.starterPackSolidBuilder },
  { label: "starter pack classical attacker", path: BLUNDR_ONBOARDING_ASSETS.starterPackClassicalAttacker },
  { label: "starter pack dynamic fighter", path: BLUNDR_ONBOARDING_ASSETS.starterPackDynamicFighter },
  { label: "starter pack flexible strategist", path: BLUNDR_ONBOARDING_ASSETS.starterPackFlexibleStrategist },
] as const;

function assertNoSourceDropReference(path: string, label: string) {
  assert.ok(path.startsWith("/"), `Expected root-relative asset path for ${label}: ${path}`);
  assert.ok(!path.includes(" "), `Expected no spaces in asset path for ${label}: ${path}`);
  assert.ok(!path.includes("_incoming"), `Expected no incoming-drop reference for ${label}: ${path}`);
  assert.ok(!path.includes("assets/Blundr Assets"), `Expected no source-drop reference for ${label}: ${path}`);
  assert.ok(!path.includes("BNlundr assets transparetnt"), `Expected no source-drop reference for ${label}: ${path}`);
  assert.ok(!path.includes("__MACOSX"), `Expected no macOS metadata reference for ${label}: ${path}`);
}

function readPngColorType(assetPath: string): number {
  const filePath = resolve(process.cwd(), `public${assetPath}`);
  const buffer = readFileSync(filePath);
  assert.equal(buffer.subarray(0, 8).toString("hex"), "89504e470d0a1a0a", `Expected PNG signature for ${assetPath}`);
  assert.equal(buffer.subarray(12, 16).toString("ascii"), "IHDR", `Expected PNG IHDR chunk for ${assetPath}`);
  return buffer.readUInt8(25);
}

for (const { label, path, expectAlpha } of TRANSPARENT_EXPECTED) {
  assertNoSourceDropReference(path, label);
  assert.ok(path.endsWith(".png"), `Expected PNG asset for ${label}: ${path}`);
  assert.ok(readPngColorType(path) === 4 || readPngColorType(path) === 6, `Expected alpha-capable PNG for ${label}: ${path}`);
  if (expectAlpha) {
    assert.ok(readPngColorType(path) === 4 || readPngColorType(path) === 6, `Expected alpha-capable PNG for ${label}: ${path}`);
  }
}

for (const { label, path } of FORMAT_ONLY_EXPECTED) {
  assertNoSourceDropReference(path, label);
  assert.ok(path.endsWith(".png") || path.endsWith(".webp"), `Expected PNG or WebP asset for ${label}: ${path}`);
  assert.ok(readFileSync(resolve(process.cwd(), `public${path}`)).length > 0, `Expected file contents for ${label}: ${path}`);
}

for (const { label, path } of ROOT_ALIAS_ASSETS) {
  assertNoSourceDropReference(path, label);
  assert.ok(path.endsWith(".png"), `Expected PNG root alias for ${label}: ${path}`);
  assert.ok(readPngColorType(path) === 4 || readPngColorType(path) === 6, `Expected alpha-capable root alias for ${label}: ${path}`);
}

console.log("transparentAssetQuality.test.ts passed");
