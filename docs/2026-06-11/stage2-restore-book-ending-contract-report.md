# Stage 2 Restore Book Ending Contract Report

## Scope

- Restore the previous working book-ending logic so `branch_complete` only appears when the selected line is truly exhausted.
- Keep move authority, runtime-book authority, continuation flow, Plain View, approved content, and runtime data unchanged.
- Leave unrelated untracked workspace artifacts untouched.

## Branch and Commit Context

- Branch: `work/stage2-approved-content-activation-phase5`
- Starting commit: `f648431` - `Repair Stage 2 live browser premature branch complete`
- Previous working commit/branch/tag inspected: `5096d10` - `Restore branch-complete controls at restricted line exhaustion`

## What the Old Book-Ending Logic Was

- The book/line resolver determined whether a selected line was exhausted.
- `branch_complete` rendered only when the resolver said the line was truly exhausted.
- If a valid expected user move still existed, the frame remained instructional.
- `Continue From Here` only appeared at true end-of-line.
- Continuation only started after the user clicked `Continue From Here`.

## What Regressed

- A stale/over-broad branch-complete path could still win before the selected line was truly exhausted.
- The browser path for Italian White after `e2e4, e7e5` was still able to show `Line complete` even though the resolver knew `Nf3` was next.
- The board-truth main path still used an incorrect Brain call path and returned null king squares.

## Why `f648431` Was Insufficient

- It added additional surface-level protection, but it did not restore the resolver as the single source of truth.
- The exhaustion latch could still outrank a live expected move.
- The Brain board-truth path still needed a direct fix so main-path king squares would report truthfully.

## Files Changed

- `lib/blundr/runtime/selectedLineExhaustion.ts`
- `lib/blundr/brain/analyzeBlundrPosition.ts`
- `tests/coach/stage2RestorePreviousBookEndingContract.test.ts`
- `tests/coach/stage2ItalianWhiteE4E5RendersNf3NotLineComplete.test.ts`
- `tests/coach/stage2ExpectedMovePreventsBookEnding.test.ts`
- `tests/coach/stage2TrueBookEndStillRendersBranchComplete.test.ts`
- `tests/coach/stage2ContinueFromHereOnlyAtTrueBookEnd.test.ts`
- `tests/coach/stage2FeatureTraceFrameKindFollowsFinalInstructionalFrame.test.ts`
- `tests/coach/stage2BrainBoardTruthKingSquaresMainPath.test.ts`

## Restored Book-Ending Contract

- Valid expected moves block branch ending.
- The line-exhaustion resolver no longer lets a branch-complete latch override a live next move.
- A selected line can still end normally when the resolver proves it is exhausted.
- `Continue From Here` remains reserved for true end-of-line.

## Italian White e4/e5 Result

- After `e2e4, e7e5`, the frame remains instructional.
- `instructionTargetUci` is `g1f3`.
- The coach card shows `Nf3` instructional copy.
- `Line complete` does not render.
- `Continue From Here` does not render.
- `branchTransitionSurfaceRendered` is `false`.
- `continueFromHereAvailable` is `false`.
- `featureTrace.frameKind` is not `branch_complete`.
- `runtimeBook.bookExhausted` remains `false`.
- `criticalIssues` does not include `premature_branch_complete_rendered`.

## True Book-End Result

- At the actual end of the selected line, `branch_complete` still renders.
- `Continue From Here` appears only at true end-of-line.
- The true end-of-line regression test still passes.

## Continue From Here Result

- Before true book end, `Continue From Here` is absent.
- At true book end, `Continue From Here` is present.
- Continuation still requires an explicit user click.

## FeatureTrace Result

- `featureTrace.frameKind` follows the final instructional frame.
- It does not report `branch_complete` for the Italian White e4/e5 instructional frame.
- Feature-trace target and final rendered coach copy remain aligned.

## BoardTruth King Squares Result

- Main-path Brain board truth now reports the king squares from the actual frame path.
- After Italian White `e2e4, e7e5`, `kingSquares.white` is `e1` and `kingSquares.black` is `e8`.

## Tests Run

Focused tests:

- `node --import tsx tests/coach/stage2RestorePreviousBookEndingContract.test.ts`
- `node --import tsx tests/coach/stage2ItalianWhiteE4E5RendersNf3NotLineComplete.test.ts`
- `node --import tsx tests/coach/stage2ExpectedMovePreventsBookEnding.test.ts`
- `node --import tsx tests/coach/stage2TrueBookEndStillRendersBranchComplete.test.ts`
- `node --import tsx tests/coach/stage2ContinueFromHereOnlyAtTrueBookEnd.test.ts`
- `node --import tsx tests/coach/stage2FeatureTraceFrameKindFollowsFinalInstructionalFrame.test.ts`
- `node --import tsx tests/coach/stage2BrainBoardTruthKingSquaresMainPath.test.ts`

Related regressions:

- `node --import tsx tests/coach/stage2PrematureBranchCompleteBrowserSnapshotRegression.test.ts`
- `node --import tsx tests/coach/stage2ItalianWhiteE4E5FinalSurfaceTarget.test.ts`
- `node --import tsx tests/coach/stage2BranchCompleteForbiddenWhenExpectedMoveExists.test.ts`
- `node --import tsx tests/coach/stage2RuntimeBookNotExhaustedWhenExpectedMoveExists.test.ts`
- `node --import tsx tests/coach/stage2RestrictedFrameNoContinuationFallbackWarning.test.ts`
- `node --import tsx tests/coach/stage2NoTargetBoardTruthKingSquares.test.ts`
- `node --import tsx tests/coach/stage2TerminalDebugTruth.test.ts`
- `node --import tsx tests/coach/stage2ProviderWarningDebugTruth.test.ts`
- `node --import tsx tests/coach/stage2AppPageContinuationParity.test.ts`
- `node --import tsx tests/coach/effectiveContinuationCandidateAuthority.test.ts`
- `node --import tsx tests/coach/plainViewNoLeakBeforeShowMore.test.ts`
- `node --import tsx tests/coach/runtimeCanonical21Openings.test.ts`
- `node --import tsx tests/coach/runtime21OpeningTrainability.test.ts`
- `node --import tsx tests/coach/noLiveLichessRuntimeCalls.test.ts`
- `node --import tsx tests/coach/runtimeDataSourceDebug.test.ts`

Quality and build:

- `npm run test:trainer-debug`
- `npm run test:coach-quality`
- `npm run test:multi-move-qa`
- `npm run build`

## Browser Verification Result

- `curl -I http://localhost:3000/` returned `HTTP/1.1 200 OK`.
- The Italian White browser regression is covered by the focused live-snapshot tests, which now show `Nf3` instead of `Line complete`.

## Remaining Limitations

- Unrelated untracked workspace artifacts remain present and intentionally unstaged.
- No broader Stage 3 or product-expansion work was started.

## Whether Final Browser QA Can Resume

- Yes.
- The premature branch-complete browser regression is repaired, the true book end still renders correctly, and the main-path Brain board truth is now aligned with the real frame state.
