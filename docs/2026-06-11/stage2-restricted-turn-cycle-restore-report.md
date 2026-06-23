# Stage 2 Restricted Turn Cycle Restore Report

## Branch

- `work/stage2-approved-content-activation-phase5`

## Starting Commit

- `33cec2de5b45bb043786f71496658c21f91f2d60`

## Previous Working Commit Inspected

- `5096d10 - Restore branch-complete controls at restricted line exhaustion`

## Files Changed

- `app/page.tsx`
- `tests/coach/stage2RestrictedTurnCycleAfterFirstMove.test.ts`
- `tests/coach/stage2OpponentReplyPromotesNextBookTarget.test.ts`
- `tests/coach/stage2RestrictedModeNeverUsesContinuationBeforeBookEnd.test.ts`
- `tests/coach/stage2NoContinuationPauseAfterOpponentReply.test.ts`
- `tests/coach/stage2ItalianWhiteE4E5LiveFlowNf3.test.ts`
- `tests/coach/stage2ContinueFromHereOnlyAfterTrueLineExhaustion.test.ts`
- `tests/coach/stage2TrueLineEndStillAllowsContinuationClick.test.ts`

## Old Restricted Turn-Cycle Logic

- Restricted mode should keep training the line until the selected book line truly ends.
- After `e4` and Black `e5`, Italian White should immediately show the next book move `Nf3`.
- The trainer should remain in instructional/assisted mode with no continuation pause at that point.

## What Regressed

- The restricted pause path started treating a low-Lichess end heuristic as a mandatory book break.
- That caused a premature continuation pause after the first opponent reply even though the book line still had the next instructed move.

## Restored Implementation

- `app/page.tsx` now uses the restricted runtime-book exhaust handoff as the pause trigger instead of the low-Lichess heuristic.
- Restricted pause / branch-complete prompting only activates when the selected line is actually exhausted or the runtime-book exhaust handoff is truly eligible.
- The true book-end path still renders `Line complete` and `Continue From Here`.

## Italian White e4/e5 Result

- After `e4` and Black `e5`, the app now immediately shows `Nf3`.
- `trainingMode` stays `restricted`.
- `trainerPhase` stays `ready_for_user`.
- `instructionTargetUci` is `g1f3`.
- `instructionTargetSan` is `Nf3`.
- Coach copy remains about `Nf3`.

## No Continuation Pause Result

- No `Finding continuation`.
- No `continuation_analyzing`.
- No `Continue From Here` button.
- No `line_complete` surface.
- No `userExplicitlyEnteredContinuation`.
- No `pendingOpponentRequest`.
- No critical issues in the restored restricted after-reply frame.

## No Premature Continue From Here Result

- The first opponent reply no longer opens the continuation flow.
- `continueFromHereAvailable` remains `false` until a true line end is reached.

## True Book-End Result

- A true exhausted line still renders `Line complete`.
- `Continue From Here` and `Restart Line` still appear at the actual end of book.

## Continuation-After-Click Result

- After an explicit `Continue From Here` click on a true book end, continuation still starts.
- That path remains separate from the normal restricted opening turn cycle.

## Browser Verification Result

- `npm run dev -- --hostname 0.0.0.0 --port 3001` started successfully.
- `curl -I http://localhost:3001/` returned `HTTP/1.1 200 OK`.
- Live HTML inspection showed no `require is not defined`, `ReferenceError`, `node:fs`, or `stage2ApprovedContentInventory` crash text.

## Tests Run

- `node --import tsx tests/coach/stage2RestrictedTurnCycleAfterFirstMove.test.ts`
- `node --import tsx tests/coach/stage2OpponentReplyPromotesNextBookTarget.test.ts`
- `node --import tsx tests/coach/stage2RestrictedModeNeverUsesContinuationBeforeBookEnd.test.ts`
- `node --import tsx tests/coach/stage2NoContinuationPauseAfterOpponentReply.test.ts`
- `node --import tsx tests/coach/stage2ItalianWhiteE4E5LiveFlowNf3.test.ts`
- `node --import tsx tests/coach/stage2ContinueFromHereOnlyAfterTrueLineExhaustion.test.ts`
- `node --import tsx tests/coach/stage2TrueLineEndStillAllowsContinuationClick.test.ts`
- `node --import tsx tests/coach/stage2RestorePreviousBookEndingContract.test.ts`
- `node --import tsx tests/coach/stage2ItalianWhiteE4E5RendersNf3NotLineComplete.test.ts`
- `node --import tsx tests/coach/stage2ExpectedMovePreventsBookEnding.test.ts`
- `node --import tsx tests/coach/stage2TrueBookEndStillRendersBranchComplete.test.ts`
- `node --import tsx tests/coach/stage2ContinueFromHereOnlyAtTrueBookEnd.test.ts`
- `node --import tsx tests/coach/stage2FeatureTraceFrameKindFollowsFinalInstructionalFrame.test.ts`
- `node --import tsx tests/coach/stage2BrainBoardTruthKingSquaresMainPath.test.ts`
- `node --import tsx tests/coach/stage2PrematureBranchCompleteBrowserSnapshotRegression.test.ts`
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
- `npm run test:trainer-debug`
- `npm run test:coach-quality`
- `npm run test:multi-move-qa`
- `npm run build`

## Build Result

- Passed.

## Remaining Untracked Files

- Left intentionally unstaged:
  - `create_blundr_review_bundle.sh`
  - `create_blundr_review_bundle_zip.sh`
  - `docs/2026-06-11/stage2-21opening-crawled-filtered5to2-runtime-source-v1/`
  - `docs/roadmaps/`
  - `docs30/`
  - `imports/stage2-sample/canonical-21opening-depth-audit.csv`
  - `imports/stage2-sample/canonical-all23-moves-by-opening.csv`
  - `imports/stage2-sample/canonical-all23-nodes-by-opening.csv`
  - `imports/stage2-sample/canonical-all23-summary.csv`
  - `imports/stage2-sample/content-base/`
  - `stage2-canonical-all23-12ply/`

## Status

- Restore accepted for the restricted turn cycle.

