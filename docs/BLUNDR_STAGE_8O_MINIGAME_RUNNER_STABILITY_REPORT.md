# BLUNDR Stage 8O Minigame Runner Stability Report

## Summary

- Branch: `work/v2.10.7o-minigame-runner-stability`
- Commit: `Fix minigame runner autoplay and board interaction stability`
- Tag: `checkpoint-v2.10.7o-minigame-runner-stability`
- Starting checkpoint: `6ef6a9b` on `work/v2.10.7n-true-minigame-generators`

This pass fixed the standalone minigame runner so `/review/minigames/[miniGameId]` is idle on load, requires explicit user input for every move, and no longer reuses the Daily Blundr replay path for standalone practice.

## Why this pass was needed

Manual browser QA exposed a release blocker: standalone minigames were glitching, auto-playing, or auto-advancing instead of waiting for user interaction. That made the runner non-deterministic and prevented real QA on the board interaction path.

The Stage 8N procedural generator work was not the problem. The problem was the runner/orchestration layer around the generated scenarios.

## Root cause of autoplay / glitching

The standalone minigame route had been funneling practice through the Daily Blundr player stack. The practice bundle was also being regenerated from state that was itself updated through an effect, which made the scenario selection loop vulnerable to repeated refreshes and Strict Mode double-effect behavior.

That meant the practice surface could keep rebuilding the bundle and replay-like state instead of staying inert until the player clicked a piece and then a destination.

The fix replaced that route-level orchestration with a dedicated standalone reducer-driven runner:

- immutable scenario data
- explicit interaction state
- separate display state
- no automatic move application
- no automatic scenario advancement

## Files changed

### Production surfaces

- [components/review/MiniGamePracticeRunner.tsx](../components/review/MiniGamePracticeRunner.tsx)
- [components/daily/DailyBlundrBoard.tsx](../components/daily/DailyBlundrBoard.tsx)
- [components/daily/DailyBlundrCardPlayer.tsx](../components/daily/DailyBlundrCardPlayer.tsx)
- [lib/blundr/daily/dailyBlundrPlayerTypes.ts](../lib/blundr/daily/dailyBlundrPlayerTypes.ts)

### Runner state and helpers

- [lib/blundr/daily/miniGames/runner/miniGameRunnerState.ts](../lib/blundr/daily/miniGames/runner/miniGameRunnerState.ts)

### Regression tests

- [lib/blundr/daily/__tests__/dailyMiniGameRunnerStateMachine.test.ts](../lib/blundr/daily/__tests__/dailyMiniGameRunnerStateMachine.test.ts)
- [lib/blundr/daily/__tests__/dailyMiniGameNoAutoplayRegression.test.ts](../lib/blundr/daily/__tests__/dailyMiniGameNoAutoplayRegression.test.ts)
- [lib/blundr/daily/__tests__/dailyMiniGameBoardInertOnMount.test.ts](../lib/blundr/daily/__tests__/dailyMiniGameBoardInertOnMount.test.ts)
- [lib/blundr/daily/__tests__/dailyMiniGameStandalonePractice.test.ts](../lib/blundr/daily/__tests__/dailyMiniGameStandalonePractice.test.ts)
- [lib/blundr/daily/__tests__/dailyMiniGameBoardOrientationStability.test.ts](../lib/blundr/daily/__tests__/dailyMiniGameBoardOrientationStability.test.ts)
- [lib/blundr/daily/__tests__/dailyGeneratedMiniGameSourceGuards.test.ts](../lib/blundr/daily/__tests__/dailyGeneratedMiniGameSourceGuards.test.ts)

## State machine created / updated

The standalone runner now uses a pure reducer with these states:

- `idle`
- `piece_selected`
- `submitted`
- `correct`
- `incorrect`
- `revealed`

Key guardrails:

- `LOAD_SCENARIO` resets to the original scenario FEN and clears interaction state.
- `USER_SUBMIT_MOVE` requires explicit `from` / `to`.
- `VALIDATION_RESULT` is ignored unless the state is already `submitted`.
- `BOARD_ANIMATION_COMPLETE` is ignored.
- `USER_NEXT_SCENARIO` is only triggered by a click handler.
- `USER_TRY_AGAIN` resets display state without replaying the solution.

## Board inertness fixes

- Standalone practice no longer uses `DailyBlundrPlayer` for the minigame route.
- The board is now driven directly by the standalone runner.
- The board orientation is locked via `forcedOrientation` for mini-games.
- `onSquareClick` is emitted without implying a move submission.
- The board does not apply `solution.primaryMoveUci` automatically.

## useEffect / autoplay paths removed

- Removed the `recentScenarioKeys` state loop that could regenerate practice bundles repeatedly.
- Removed the standalone route dependency on the Daily replay/adaptive player stack.
- Removed any route-level behavior that could derive an attempted move from the scenario on render.
- Added a validation lock so duplicate submits do not slip through while validation is in flight.
- Strict Mode double-load is now harmless because `LOAD_SCENARIO` just resets to idle.

## Reveal behavior

Reveal now stays visual-only:

- it shows the answer card
- it shows the solution from/to squares
- it shows accepted move UCI pills
- it shows a non-interactive solution arrow overlay
- it does not apply the move to the board
- it does not advance the scenario
- it does not trigger rewards or Daily completion

## Next Scenario behavior

- only the explicit button click advances to a new scenario
- it resets selected square, feedback, reveal state, and board FEN
- it updates the recent scenario key cooldown list through a ref
- it does not fire from an effect

## Source guard verification

The standalone route still forces `source === "standalone_review"`, and the daily deck path still uses `source === "daily_deck"`.

The updated tests verify:

- standalone practice cards remain standalone-only
- daily deck cards remain daily-deck-only
- both runner states load idle from the canonical scenario FEN
- standalone completion does not leak into Daily Blundr state

## Tests created

- `dailyMiniGameRunnerStateMachine.test.ts`
- `dailyMiniGameNoAutoplayRegression.test.ts`
- `dailyMiniGameBoardInertOnMount.test.ts`

## Tests updated

- `dailyMiniGameStandalonePractice.test.ts`
- `dailyMiniGameBoardOrientationStability.test.ts`
- `dailyGeneratedMiniGameSourceGuards.test.ts`

## Tests run

Passed:

- `node --import tsx lib/blundr/daily/__tests__/dailyMiniGameRunnerStateMachine.test.ts`
- `node --import tsx lib/blundr/daily/__tests__/dailyMiniGameNoAutoplayRegression.test.ts`
- `node --import tsx lib/blundr/daily/__tests__/dailyMiniGameBoardInertOnMount.test.ts`
- `node --import tsx lib/blundr/daily/__tests__/dailyMiniGameStandalonePractice.test.ts`
- `node --import tsx lib/blundr/daily/__tests__/dailyGeneratedMiniGameSourceGuards.test.ts`
- `node --import tsx lib/blundr/daily/__tests__/dailyMiniGameBoardOrientationStability.test.ts`

## Build result

`npm run build` passed.

The build compiled successfully and completed static page generation and route tracing for the app, including `/review/minigames/[miniGameId]`.

## Explicit answers

- Did minigames auto-play moves before the fix? Yes.
- What caused the auto-play / glitching? The standalone runner was coupled to the Daily player path and a bundle regeneration loop driven by effect-updated recent scenario state.
- Is the board inert on scenario load now? Yes.
- Can a move be submitted without explicit user input? No.
- Does Reveal auto-play the solution? No.
- Does Next Scenario fire without a click? No.
- Does standalone Review complete Daily Blundr? No.
- Does `boardFen` change on mount? No.
- Does `boardFen` change from overlays? No.
- Does board orientation stay stable? Yes.
- Do all 8 minigames work manually? Not yet verified in browser in this pass.
- Did tests pass? Yes.
- Did `npm run build` pass? Yes.
- Did manual browser QA pass? No.
- Did you avoid `package.json` / `package-lock.json` unless required? Yes.
- Did you avoid `git add .`? Yes.

## Manual browser QA result

Not run in this pass.

This fix was verified with reducer tests, static-render regressions, and a production build, but the requested browser interaction pass is still pending.

## Protected path audit

No files were modified under the protected paths:

- `components/board/*`
- `lib/blundr/board/*`
- `lib/blundr/openings/*`
- `lib/blundr/engine/*`
- `lib/blundr/coach/*`
- `lib/blundr/presentation/*`
- `lib/blundr/visual/*`
- `lib/blundr/maia/*`
- `lib/blundr/rewards/rewardGrantService.ts`
- `public/stockfish/*`
- `supabase/*`
- `app/api/blundr/*`

## Current limitations

- Manual browser QA is still required.
- The board-level reveal overlay is intentionally presentation-only; it does not mutate board state.
- There is no dedicated jsdom-style component interaction harness in this repo, so the inertness checks are reducer-based plus static render regressions.

## Recommended next step

Run manual browser QA on the standalone minigame routes at 375px, 390px, and 414px widths, then stage, commit, tag, and push this branch if the board stays idle and fully user-controlled.
