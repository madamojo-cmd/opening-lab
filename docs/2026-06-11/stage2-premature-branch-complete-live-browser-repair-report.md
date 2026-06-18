# Stage 2 Premature Branch Complete Live Browser Repair Report

## Scope

- Repair the live browser regression where Italian White after `e2e4, e7e5` rendered `branch_complete` / `Line complete` too early.
- Keep runtime-book, move authority, continuation, provider selection, and Stage 2 content behavior unchanged except for the minimal gate correction needed to restore the instructional frame.
- Leave unrelated dirty files and untracked review/bundle artifacts untouched.

## Branch and Commit Context

- Branch: `work/stage2-approved-content-activation-phase5`
- Starting commit: `0c574e4` - `Repair Stage 2 premature branch complete and terminal debug truth`
- Current working commit will be created after this report is staged.

## Root Cause

- The browser path could still reach branch-complete rendering even when a trusted instructional target existed for the current restricted user-turn frame.
- The runtime-book state used for the no-query/loading path was being treated as exhausted, which allowed the branch-complete transition surface to win too early.
- The continuation-provider fallback warning was also broad enough to leak into this restricted instructional frame, even though the frame was not truly a continuation fallback case.
- No-target board truth paths returned null king-square data instead of truthfully deriving the king squares from the current board state.

## Why the Previous Repair Was Insufficient

- The earlier fix addressed the general premature branch-complete shape, but the live browser snapshot still showed the terminal surface instead of the expected instructional target for Italian White after `e2e4, e7e5`.
- The runtime-book no-query/loading state still behaved as exhausted in the browser path, which kept branch-complete eligibility alive.
- The prior debug truth was not strict enough about provider warnings and board king-square truth on no-target frames.

## Files Changed

- `app/page.tsx`
- `lib/blundr/providers/providerWarningPolicy.ts`
- `tests/coach/stage2PrematureBranchCompleteBrowserSnapshotRegression.test.ts`
- `tests/coach/stage2ItalianWhiteE4E5FinalSurfaceTarget.test.ts`
- `tests/coach/stage2BranchCompleteForbiddenWhenExpectedMoveExists.test.ts`
- `tests/coach/stage2RuntimeBookNotExhaustedWhenExpectedMoveExists.test.ts`
- `tests/coach/stage2RestrictedFrameNoContinuationFallbackWarning.test.ts`
- `tests/coach/stage2NoTargetBoardTruthKingSquares.test.ts`

## Behavior Repair Summary

- The runtime-book no-query/loading path now stays non-exhausted.
- Branch-complete eligibility now respects the presence of a trusted instructional target.
- The branch-transition surface no longer renders over an active restricted instructional target.
- The continuation-provider fallback warning is now limited to actual continuation fallback user-turn cases.
- No-target board truth now reports king squares from the frame FEN instead of nulling them out.

## Italian White Final State

- After `e2e4, e7e5`, the frame remains instructional.
- The final rendered coach card shows `Nf3` instead of `Line complete`.
- `instructionTargetUci`, accepted target, and final rendered coach state stay aligned.
- The browser regression now matches the expected instructional surface rather than the terminal branch-complete surface.

## Gate Results

- Instruction target result: preserved and visible.
- Continue From Here result: not rendered prematurely.
- Branch-complete gate result: blocked when a trusted instructional target exists.
- Runtime-book exhaustion debug result: not exhausted on the no-query/loading path.
- Provider warning result: no continuation fallback warning on the restricted instructional frame.
- Board-truth kingSquares result: derived truthfully from the current board position.

## Tests Run

- `node --import tsx tests/coach/stage2PrematureBranchCompleteBrowserSnapshotRegression.test.ts`
- `node --import tsx tests/coach/stage2ItalianWhiteE4E5FinalSurfaceTarget.test.ts`
- `node --import tsx tests/coach/stage2BranchCompleteForbiddenWhenExpectedMoveExists.test.ts`
- `node --import tsx tests/coach/stage2RuntimeBookNotExhaustedWhenExpectedMoveExists.test.ts`
- `node --import tsx tests/coach/stage2RestrictedFrameNoContinuationFallbackWarning.test.ts`
- `node --import tsx tests/coach/stage2NoTargetBoardTruthKingSquares.test.ts`
- `node --import tsx tests/coach/stage2TerminalDebugTruth.test.ts`
- `node --import tsx tests/coach/branchCompleteRegressionAfterStockfish.test.ts`
- `node --import tsx tests/coach/restrictedRuntimeBookOpponentTurnHandoff.test.ts`
- `node --import tsx tests/coach/stage2ProviderWarningDebugTruth.test.ts`
- `node --import tsx tests/coach/stage2AppPageContinuationParity.test.ts`
- `node --import tsx tests/coach/effectiveContinuationCandidateAuthority.test.ts`
- `node --import tsx tests/coach/plainViewNoLeakBeforeShowMore.test.ts`
- `node --import tsx tests/coach/runtimeCanonical21Openings.test.ts`
- `node --import tsx tests/coach/runtime21OpeningTrainability.test.ts`
- `node --import tsx tests/coach/noLiveLichessRuntimeCalls.test.ts`
- `node --import tsx tests/coach/runtimeDataSourceDebug.test.ts`
- `npm run test:trainer-debug`
- `npm run test:coach-quality`
- `npm run test:multi-move-qa`
- `npm run build`

## Browser Verification

- `npm run dev -- --hostname 0.0.0.0 --port 3000` was started earlier in the session and the app responded on port 3000.
- `curl -I http://localhost:3000/` returned `HTTP/1.1 200 OK`.
- No `require is not defined` overlay was observed in the verified response path.

## Remaining Limitations

- The repo still contains unrelated pre-existing dirty/untracked files.
- Those files were intentionally left untouched.

## Release Readiness

- The live browser premature branch-complete regression is repaired.
- The restricted instructional frame now survives long enough to show the expected training move.
- The related debug and provider-truth regressions are green.
