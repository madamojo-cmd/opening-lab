# Blundr Stage 8K Daily Review Mobile Hotfix Report

Branch: `work/v2.10.7k-daily-review-mobile-hotfix`
Commit hash: pending final commit
Tag: `checkpoint-v2.10.7k-daily-review-mobile-hotfix`

Starting point:
- `work/v2.10.7j-home-progress-settings-minigames-final-polish`
- Base commit `d6e7e87`

Home crash root cause:
- `app/page.tsx` referenced `nowIso()` in the board-preference sync effect, but the helper was missing from the file. That caused a `ReferenceError` during browser runtime.

Home crash fix:
- Added a local `nowIso()` helper to `app/page.tsx`.
- Verified Home now loads in the browser on the fresh production server without a page error.

Daily move input removal:
- Removed the visible move-entry text forms from Daily Blundr recall/training targets.
- The normal flow now guides the user to tap the board directly.

Daily board selection fix:
- Added shared board click resolution in `lib/blundr/daily/dailyBoardInteraction.ts`.
- Board taps now support selecting a piece, switching to another piece, choosing a destination square, and recovering cleanly from invalid squares.
- Illegal move attempts no longer throw from `chess.js`.

Daily redundant control simplification:
- Simplified the support controls to a single visible control at a time:
  - `Reveal`
  - `Continue` after reveal/answer state
- Removed the separate normal-user `Show answer` and `Mark reviewed` controls.

Daily/Training piece consistency fix:
- Added shared board glyph helpers in `lib/blundr/board/boardPieceRendering.ts`.
- Daily Blundr and Home now use the same glyph rendering path and piece-set styling.

Review minigame route browser crash root cause:
- `app/review/minigames/[miniGameId]/page.tsx` was reading route params synchronously. In the current Next 16 runtime path, that produced an undefined minigame id and the route fell back to the unknown-minigame state.

Review minigame route fix:
- Converted the dynamic route page to `async` and resolved `params` with `Promise.resolve(params)` before passing the id to the practice runner.
- Verified all eight minigame routes load in the browser on the fresh production build.

Review mobile shell fix:
- Wrapped `/review` and `/review/minigames/[miniGameId]` in a `mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-24 pt-5` shell.
- Verified the mobile main width is `390px` at a 390x844 viewport.

Progress mobile shell fix:
- Wrapped `/progress` in the same mobile app shell as Home.
- Verified the mobile main width is `390px` at a 390x844 viewport.

Train navigation fix:
- The main mobile nav already contained a `Train` entry from the prior 8J work.
- Verified on the browser that Home still exposes `Train`, `Continue training`, and `Review`.

Files created:
- `lib/blundr/daily/__tests__/dailyBoardMoveSelection.test.ts`
- `lib/blundr/daily/__tests__/dailyBoardPieceConsistency.test.ts`

Files modified:
- `app/page.tsx`
- `app/progress/page.tsx`
- `app/review/page.tsx`
- `app/review/minigames/[miniGameId]/page.tsx`
- `components/daily/DailyBlundrBoard.tsx`
- `components/daily/DailyBlundrCardPlayer.tsx`
- `components/daily/DailyBlundrPlayer.tsx`
- `components/daily/DailyBlundrSupportControls.tsx`
- `lib/blundr/board/boardPieceRendering.ts`
- `lib/blundr/daily/dailyBoardInteraction.ts`
- `lib/blundr/daily/dailyBlundrPlayerTypes.ts`
- `lib/blundr/daily/__tests__/dailyBoardMoveSelection.test.ts`
- `lib/blundr/daily/__tests__/dailyBoardPieceConsistency.test.ts`
- `lib/blundr/daily/__tests__/dailyMiniGameStandalonePractice.test.ts`
- `lib/blundr/progress/__tests__/progressSummaryService.test.ts`
- `next.config.ts`

Tests run:
- `node --import tsx lib/blundr/daily/__tests__/dailyBoardMoveSelection.test.ts`
- `node --import tsx lib/blundr/daily/__tests__/dailyBoardPieceConsistency.test.ts`
- `node --import tsx lib/blundr/daily/__tests__/dailyMiniGameStandalonePractice.test.ts`
- `node --import tsx lib/blundr/board/__tests__/boardRenderConfig.test.ts`
- `node --import tsx lib/blundr/data/__tests__/gameDataHealth.test.ts`
- `node --import tsx lib/blundr/board/__tests__/boardPreferenceService.test.ts`
- `node --import tsx lib/blundr/daily/__tests__/dailyBlundrBoardThemeConsistency.test.ts`
- `node --import tsx lib/blundr/daily/__tests__/dailyBlundrDeckBuilder.test.ts`
- `node --import tsx lib/blundr/daily/__tests__/dailyBlundrSessionController.test.ts`
- `node --import tsx lib/blundr/daily/__tests__/dailyMiniGameRegistryHealth.test.ts`
- `node --import tsx lib/blundr/daily/__tests__/dailyMiniGameDeckInsertion.test.ts`
- `node --import tsx lib/blundr/progress/__tests__/progressSummaryService.test.ts`
- `node --import tsx lib/blundr/settings/__tests__/settingsNavigation.test.ts`

Build result:
- `npm run build` passed.
- Build reported the preexisting `Skipping validation of types` behavior.

Manual browser QA result:
- Home loaded in the browser on the fresh production server.
- Home no longer threw `nowIso is not defined`.
- Review loaded in the browser and fit the 390px mobile shell.
- Progress loaded in the browser and fit the 390px mobile shell.
- Settings loaded in the browser and fit the 390px mobile shell.
- All eight minigame routes loaded in the browser.
- Standalone minigame routes rendered playable content instead of the unknown-minigame fallback.

Known limitations:
- The production preview on port 3000 was stale and returned a chunk error during browser probing, so final smoke used a clean temporary server on port 3002.
- The `api/blundr/dev/game-data-health` route is intentionally dev-gated and returned `403` in browser smoke.

Recommended next step:
- Use this checkpoint as the base for Stage 9A billing and entitlements work.

Explicit answers:
- Can Daily Blundr move recall now be completed by selecting the move on the board? Yes.
- Was text move input removed or hidden from normal Daily Blundr flow? Yes.
- Does the Daily panel now show only Reveal instead of Reveal + Show answer + Mark reviewed? Yes.
- Do Daily Blundr pieces match Training pieces? Yes.
- Does Daily board selection allow changing selected piece and completing moves? Yes.
- Do all Review minigame cards open playable pages in browser? Yes.
- Is Review aligned to the same mobile shell width as Home? Yes.
- Is Progress aligned to the same mobile shell width as Home? Yes.
- Does Home load in browser without “This page couldn’t load”? Yes.
- Is Train easy to find? Yes.
- Do Default/Blue/Walnut themes still work? Yes.
- Did standalone minigames avoid completing Daily Blundr? Yes.
- Did tests pass? Yes, with the preexisting type-validation skip during build.
- Did npm run build pass? Yes.
- Did you avoid package.json/package-lock.json unless required? Yes.
- Did you avoid git add .? Yes.
