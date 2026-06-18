# Stage 2 Premature Branch Complete and Terminal Debug Repair Report

## Branch

- `work/stage2-approved-content-activation-phase5`

## Starting Commit

- `67c32cf`

## Root Cause

- The page-level restricted branch-complete latch in `app/page.tsx` was too eager.
- It allowed a shallow `selectedLineCompleteConfirmed` signal to participate in branch-complete promotion before the selected line was actually exhausted.
- That could incorrectly flip Italian White into `branch_complete` after `e2e4, e7e5` even though the guided line still had an instructional continuation.
- Terminal debug truth also dropped king-square detail when the frame had no target, which made terminal board truth less informative than it should have been.

## Files Changed

- `app/page.tsx`
- `lib/blundr/brain/providers/boardTruthProvider.ts`
- `tests/coach/stage2PrematureBranchCompleteRegression.test.ts`
- `tests/coach/stage2TerminalDebugTruth.test.ts`

## Fix Summary

- Tightened the restricted branch-complete latch so it only treats a line as cursor-complete when the selected line is actually exhausted.
- Kept the broader branch-complete contract intact.
- Preserved runtime-book, continuation, and promotion behavior outside this narrow repair.
- Updated terminal board truth so king-square information is still available even when the frame has no target.

## Italian White Result

- Italian White after `e2e4, e7e5` does not enter `branch_complete`.
- `branchCompleteEligible` remains `false`.
- `shouldPreventOpponentScheduling` remains `false`.
- `shouldRenderBranchCompleteSurface` remains `false`.

## Continue From Here Gate Result

- `Continue From Here` does not appear for the premature Italian White frame.
- The gate remains reserved for true end-of-line exhaustion.

## Branch-Complete Policy Result

- Branch completion now requires actual selected-line exhaustion rather than a shallow cursor-complete signal.
- The repair preserves the existing branch-complete contract for true line exhaustion.

## Continuation Gate Result

- Continuation behavior remains unchanged.
- The repair does not alter continuation promotion, continuation candidate authority, or continuation fallback flow.

## Terminal Coach Card Authority Result

- Terminal snapshot parity is preserved.
- The final rendered coach card matches the visible terminal coach card in the repaired terminal debug case.

## Terminal Button Parity Result

- Terminal coach buttons match between the actual rendered coach card and the visible terminal debug surface.

## Board Truth King Squares Result

- Terminal board truth now reports king squares even with a null target.
- In the terminal regression test, the board truth reported:
  - white king square: `g1`
  - black king square: `g8`

## Provider Warning Consistency Result

- Provider warning debug truth remains consistent.
- `stage2ProviderWarningDebugTruth.test.ts` passed, including local runtime and no-live-Lichess reporting.

## Terminal Quality Scoring Result

- Terminal debug quality scoring remains truthful.
- The repaired terminal snapshot did not produce `coach_low_quality`.

## Browser Verification Result

- `npm run dev -- --hostname 0.0.0.0 --port 3000` started successfully.
- `curl -I http://localhost:3000/` returned `HTTP/1.1 200 OK`.

## Tests Run

- `node --import tsx tests/coach/stage2PrematureBranchCompleteRegression.test.ts`
- `node --import tsx tests/coach/stage2TerminalDebugTruth.test.ts`
- `node --import tsx tests/coach/branchCompleteRegressionAfterStockfish.test.ts`
- `node --import tsx tests/coach/restrictedRuntimeBookOpponentTurnHandoff.test.ts`
- `node --import tsx tests/coach/stage2ProviderWarningDebugTruth.test.ts`
- `node --import tsx tests/coach/stage2FeatureTraceCastlingNormalization.test.ts`
- `npm run test:trainer-debug`
- `npm run test:coach-quality`
- `npm run test:multi-move-qa`
- `npm run build`

## Build Result

- Pass

## Remaining Limitations

- The repair is intentionally narrow and only addresses the premature branch-complete latch plus terminal truth visibility.
- Unrelated dirty worktree files remain untouched.

## Recommended Next Phase

- Continue with the next approved Stage 2 repair or release-handoff step after this regression is committed.

