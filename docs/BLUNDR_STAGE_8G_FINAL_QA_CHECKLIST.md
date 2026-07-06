# Blundr Stage 8G Final QA Checklist

Use this checklist for launch-readiness verification after Stage 8G.

## 1. Account and Local Demo QA

- [ ] Open `/onboarding` with Supabase env vars missing.
- [ ] Confirm local demo remains usable without auth credentials.
- [ ] Confirm account save progress screens still load.
- [ ] Confirm auth failure shows a safe Tempo fallback message.
- [ ] Confirm local demo copy is clear and not alarming.

## 2. Supabase Migration QA

- [ ] Confirm Stage 8F migration `supabase/migrations/20260706_001_blundr_rewards_tempo_cache.sql` is already applied.
- [ ] Confirm no new migration was added for Stage 8G.
- [ ] Confirm authenticated flows still compile and do not expose service-role keys in client code.
- [ ] Confirm live schema validation was not required for the 8G polish pass.

## 3. Onboarding QA

- [ ] Open `/onboarding`.
- [ ] Confirm welcome, account, rating, goal, and starter pack steps load.
- [ ] Confirm the starter pack selector shows all four starter pack art assets.
- [ ] Confirm the real-game-data illustration renders.
- [ ] Confirm the opening-plus-continuation illustration renders.
- [ ] Confirm the assisted/plain/daily illustration renders.
- [ ] Confirm mobile text remains readable and images do not crowd the cards.

## 4. Daily BLUNDR QA

- [ ] Open `/daily`.
- [ ] Confirm the page loads without horizontal scrolling.
- [ ] Confirm the loading state renders safely before data is ready.
- [ ] Confirm the empty state renders safely when no cards are present.
- [ ] Confirm a complete session still works end to end.
- [ ] Confirm rewards do not block deck completion.

## 5. Daily Rings QA

- [ ] Open the home page and confirm Daily Rings still render.
- [ ] Confirm Tempo callouts remain compact on mobile.
- [ ] Confirm completion banners render cleanly after ring closure.
- [ ] Confirm all-rings completion state is visually distinct but not oversized.
- [ ] Confirm reward and streak surfaces remain within card bounds.

## 6. Streak and XP QA

- [ ] Confirm streak increments still appear after valid daily completion.
- [ ] Confirm XP gain still appears in completion flows.
- [ ] Confirm streak milestone surfaces still render.
- [ ] Confirm reward and XP summaries remain readable on small screens.

## 7. Repertoire Unlock QA

- [ ] Open `/repertoire`.
- [ ] Confirm unlocked and locked opening cards still render.
- [ ] Confirm repertoire points still apply through the existing point economy.
- [ ] Confirm empty-repertoire fallback renders safely if applicable.
- [ ] Confirm error fallback renders safely if unlock flow fails.

## 8. Reward and Tempo Cache QA

- [ ] Confirm Tempo Cache closed state renders.
- [ ] Confirm Tempo Cache reveal state renders.
- [ ] Confirm reward history renders.
- [ ] Confirm common, uncommon, rare, and epic badges render.
- [ ] Confirm reward points float stays dynamic and does not bake point values into media.
- [ ] Confirm no branch reward logic exists.
- [ ] Confirm no instant full opening unlock exists.

## 9. Asset Manifest QA

- [ ] Confirm `lib/blundr/assets/blundrAssetManifest.ts` only uses canonical public asset paths.
- [ ] Confirm no manifest path points into `public/assets/_incoming/`.
- [ ] Confirm no manifest path contains spaces.
- [ ] Confirm no manifest path contains `__MACOSX`.
- [ ] Confirm required asset keys exist for Tempo, rewards, onboarding, empty states, and brand assets.

## 10. Asset Sizing QA

- [ ] Confirm Tempo avatar is not oversized in callouts.
- [ ] Confirm Tempo full-body does not dominate onboarding cards.
- [ ] Confirm reward tokens stay icon-sized in lists.
- [ ] Confirm Tempo Cache and reward reveal art stay contained on mobile.
- [ ] Confirm starter pack art does not crowd the text.
- [ ] Confirm empty-state art fits cleanly inside cards.
- [ ] Confirm brand wordmark is crisp and not stretched.

## 11. Mobile QA

- [ ] Test `/`, `/onboarding`, `/daily`, `/repertoire`, and `/dev/admin` on a narrow viewport.
- [ ] Confirm no horizontal overflow.
- [ ] Confirm buttons remain visible above the fold.
- [ ] Confirm reward modal fits without clipping.
- [ ] Confirm onboarding cards stack vertically on mobile.
- [ ] Confirm images do not crop Tempo or reward art unexpectedly.

## 12. Reduced Motion QA

- [ ] Enable `prefers-reduced-motion`.
- [ ] Confirm reward videos fall back to static images.
- [ ] Confirm the Tempo Cache reveal still reads clearly without animation.
- [ ] Confirm no motion-dependent core behavior is blocked.

## 13. Brand Icon and Manifest QA

- [ ] Confirm `public/favicon.png` exists.
- [ ] Confirm `public/apple-touch-icon.png` exists.
- [ ] Confirm `public/android-chrome-192x192.png` exists.
- [ ] Confirm `public/android-chrome-512x512.png` exists.
- [ ] Confirm `public/manifest.json` points at the brand icons.
- [ ] Confirm the app metadata still references the brand favicon and apple touch icon.

## 14. Analytics Event QA

- [ ] Confirm analytics constants exist for onboarding, daily rings, streaks, rewards, and Tempo Cache.
- [ ] Confirm analytics remains a safe no-op if no SDK is configured.
- [ ] Confirm no PII or Supabase secrets are emitted in analytics payloads.
- [ ] Confirm reward and Tempo Cache events are emitted where expected.

## 15. Production Env Safety QA

- [ ] Confirm local demo still works without Supabase credentials.
- [ ] Confirm authenticated mode remains wired.
- [ ] Confirm service-role credentials are server-only.
- [ ] Confirm no payment or subscription logic exists.
- [ ] Confirm no casino, jackpot, loot-box, or spin language leaked into UI or docs.

## 16. Manual Smoke Routes

- [ ] `/`
- [ ] `/onboarding`
- [ ] `/daily`
- [ ] `/repertoire`
- [ ] `/dev/admin`
- [ ] `/api/blundr/account/bootstrap`
- [ ] `/api/blundr/account/sync-local`
- [ ] `/api/blundr/daily-rings/sync`
- [ ] `/api/blundr/onboarding/complete`
- [ ] `/api/blundr/repertoire/sync`
- [ ] `/api/blundr/rewards/sync`
- [ ] `/api/blundr/dev/validation-report`

## 17. Known Non-Blocking Follow-ups

- [ ] Create a true SVG wordmark later.
- [ ] Review the Tempo Cache modal in a real mobile browser before launch.
- [ ] Decide later whether rare choice-token rewards need a dedicated target picker.
- [ ] Keep the separate `tsc --noEmit` production cleanup noted if it remains a preexisting follow-up.

