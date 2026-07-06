# Blundr Transparent Asset Replacement Report

## Source Folder Used

- `assets/Blundr Assets/Blundr Assets Transparent`

## Canonical Files Replaced

### Tempo

- `public/assets/tempo/tempo-avatar.png`
- `public/assets/tempo/tempo-full-body.png`
- `public/assets/tempo/tempo-pointing.png`
- `public/assets/tempo/tempo-thinking.png`
- `public/assets/tempo/tempo-success.png`
- `public/assets/tempo/tempo-reward.png`
- `public/assets/tempo/tempo-celebrate.png`
- `public/assets/tempo/tempo-sad.png`
- `public/assets/tempo/tempo-coach.png`

### Rewards

- `public/assets/rewards/tempo-cache-closed.png`
- `public/assets/rewards/tempo-cache-open.png`
- `public/assets/rewards/tempo-cache-glow.png`
- `public/assets/rewards/reward-points-token.png`
- `public/assets/rewards/reward-opening-fragment.png`
- `public/assets/rewards/reward-choice-token.png`
- `public/assets/rewards/reward-epic-bonus.png`
- `public/assets/rewards/reward-card-background.png`
- `public/assets/rewards/reward-card-back-wide.png`
- `public/assets/rewards/reward-card-back-portrait.png`
- `public/assets/rewards/reward-rarity-common.png`
- `public/assets/rewards/reward-rarity-uncommon.png`
- `public/assets/rewards/reward-rarity-rare.png`
- `public/assets/rewards/reward-rarity-epic.png`

### Reward Animation Fallbacks

- `public/assets/rewards/animations/tempo-cache-open-fallback.png`
- `public/assets/rewards/animations/reward-pop-fallback.png`
- `public/assets/rewards/animations/points-float-fallback.png`
- `public/assets/rewards/animations/streak-flare-fallback.png`

### Onboarding

- `public/assets/onboarding/onboarding-real-game-data.png`
- `public/assets/onboarding/onboarding-opening-continuation.png`
- `public/assets/onboarding/onboarding-assisted-plain-daily.png`
- `public/assets/onboarding/starter-pack-solid-builder.png`
- `public/assets/onboarding/starter-pack-classical-attacker.png`
- `public/assets/onboarding/starter-pack-dynamic-fighter.png`
- `public/assets/onboarding/starter-pack-flexible-strategist.png`

### Empty, Loading, and Error States

- `public/assets/empty-states/empty-review-queue.png`
- `public/assets/empty-states/empty-daily-blundr.png`
- `public/assets/empty-states/empty-repertoire.png`
- `public/assets/empty-states/loading-tempo.png`
- `public/assets/empty-states/offline-local-demo.png`
- `public/assets/empty-states/error-safe-fallback.png`

### Brand and Root Aliases

- `public/assets/brand/blundr-logo-wordmark.png`
- `public/assets/brand/blundr-app-icon.png`
- `public/assets/brand/blundr-favicon.png`
- `public/assets/brand/apple-touch-icon.png`
- `public/assets/brand/android-chrome-192x192.png`
- `public/assets/brand/android-chrome-512x512.png`
- `public/favicon.png`
- `public/apple-touch-icon.png`
- `public/android-chrome-192x192.png`
- `public/android-chrome-512x512.png`

## Files Intentionally Not Replaced

- `assets/Blundr Assets/Blundr Assets Transparent/.DS_Store`
- `assets/Blundr Assets/Blundr Assets Transparent/tempo-cache-open__from_webp.png`
- `assets/Blundr Assets/Blundr Assets Transparent/tempo-cache-open2.mp4`
- The legacy non-transparent source folder `assets/Blundr Assets/` was not copied into `public/`.

## Manifest Changes

- `lib/blundr/assets/blundrAssetManifest.ts` now points reward card-back paths at PNG files instead of JPG files.
- `lib/blundr/assets/blundrAssetManifest.ts` now points animation fallback paths at PNG files instead of WebP files.
- No manifest path points into the source drop or `_incoming`.

## Files With True Alpha Detected

- `public/assets/tempo/tempo-avatar.png`
- `public/assets/tempo/tempo-full-body.png`
- `public/assets/tempo/tempo-pointing.png`
- `public/assets/tempo/tempo-thinking.png`
- `public/assets/tempo/tempo-success.png`
- `public/assets/tempo/tempo-reward.png`
- `public/assets/tempo/tempo-celebrate.png`
- `public/assets/tempo/tempo-sad.png`
- `public/assets/tempo/tempo-coach.png`
- `public/assets/rewards/tempo-cache-closed.png`
- `public/assets/rewards/tempo-cache-open.png`
- `public/assets/rewards/tempo-cache-glow.png`
- `public/assets/rewards/reward-points-token.png`
- `public/assets/rewards/reward-opening-fragment.png`
- `public/assets/rewards/reward-choice-token.png`
- `public/assets/rewards/reward-epic-bonus.png`
- `public/assets/rewards/reward-card-background.png`
- `public/assets/rewards/reward-card-back-wide.png`
- `public/assets/rewards/reward-card-back-portrait.png`
- `public/assets/rewards/reward-rarity-common.png`
- `public/assets/rewards/reward-rarity-uncommon.png`
- `public/assets/rewards/reward-rarity-rare.png`
- `public/assets/rewards/reward-rarity-epic.png`
- `public/assets/rewards/animations/tempo-cache-open-fallback.png`
- `public/assets/rewards/animations/reward-pop-fallback.png`
- `public/assets/rewards/animations/points-float-fallback.png`
- `public/assets/rewards/animations/streak-flare-fallback.png`
- `public/assets/brand/blundr-logo-wordmark.png`
- `public/assets/brand/blundr-app-icon.png`
- `public/assets/brand/blundr-favicon.png`
- `public/assets/brand/apple-touch-icon.png`
- `public/assets/brand/android-chrome-192x192.png`
- `public/assets/brand/android-chrome-512x512.png`
- `public/favicon.png`
- `public/apple-touch-icon.png`
- `public/android-chrome-192x192.png`
- `public/android-chrome-512x512.png`

## Files Without Alpha But Visually Accepted

- `public/assets/onboarding/onboarding-real-game-data.png`
- `public/assets/onboarding/onboarding-opening-continuation.png`
- `public/assets/onboarding/onboarding-assisted-plain-daily.png`

## Manual Review Notes

- `tempo-cache-open2.mp4` remains unused and was not copied into canonical public paths.
- The onboarding illustrations are intentionally RGB assets with clean backgrounds, not transparent cutouts.
- The transparent source drop still contains raw staging variants that are not part of the live manifest.
