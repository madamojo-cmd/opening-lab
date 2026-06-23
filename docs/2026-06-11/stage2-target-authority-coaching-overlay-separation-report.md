# Stage 2 Target Authority / Coaching Overlay Separation Report

## Branch

- `work/stage2-approved-content-activation-phase5`

## Starting Commit

- `7f3aad6fc33582d0da14764a25cb303178926175`
- Message: `Restore Stage 2 restricted turn cycle`

## Root Cause

- Restricted-mode branch-complete logic was still treating runtime-book exhaustion as if it were terminal book exhaustion.
- That coupling let a runtime-book miss or empty candidate set act like `Line Complete` / `Continue From Here`, even when the selected line still had a valid next move.
- Coaching overlay resolution was already separate in practice, but the boundary was not explicit enough to prevent book-end logic from using runtime-book exhaustion as authority.

## Files Changed

- `lib/blundr/runtime/resolveStage2RestrictedMoveAuthority.ts`
- `lib/blundr/runtime/restrictedRuntimeBookHandoff.ts`
- `lib/blundr/stage2Coaching/resolveStage2CoachingContentForMove.ts`
- `lib/blundr/stage2Coaching/index.ts`
- `tests/coach/stage2RestrictedMoveAuthoritySeparation.test.ts`
- `docs/2026-06-11/stage2-target-authority-coaching-overlay-separation-report.md`

## Authority Contracts Restored

### Move / Book Authority

- Added `resolveStage2RestrictedMoveAuthority(...)`.
- `targetAuthority.kind` is now explicitly separated from coaching overlay and can be one of:
  - `runtime_exact`
  - `selected_line`
  - `runtime_transposition`
  - `opening_family_fallback`
  - `safe_local_fallback`
  - `terminal`
- `branchCompleteAllowed` is now true only when `targetAuthority.kind === "terminal"`.
- `continueFromHereAllowed` is now tied to true terminal branch completion only.
- Runtime-book exhaustion alone no longer promotes branch complete or Continue From Here.

### Coaching / Explanation Authority

- Added `resolveStage2CoachingContentForMove(...)`.
- `coachingAuthority.kind` is now explicit and separate from move authority:
  - `approved_packet`
  - `generated_feature_copy`
  - `safe_fallback`
- Approved content may enrich the coach overlay, but it does not end the book and does not select moves.

## Results

### All-21 Separation Test

- `tests/coach/stage2RestrictedMoveAuthoritySeparation.test.ts` iterated over all 21 runtime opening IDs.
- Result: runtime-book exhaustion alone did not produce `terminal`, `branchCompleteAllowed`, or `continueFromHereAllowed`.

### Missing Approved Content Fallback

- Exact approved packet match still resolves as `approved_packet`.
- Non-matching input still resolves to `safe_fallback`.
- Approved content remains a coaching overlay source, not move authority.

### Italian Regression

- `tests/coach/restrictedRuntimeBookOpponentTurnHandoff.test.ts` passed.
- `tests/coach/stage2ItalianWhiteE4E5RendersNf3NotLineComplete.test.ts` passed.
- `tests/coach/stage2ExpectedMovePreventsBookEnding.test.ts` passed.
- `tests/coach/stage2RestorePreviousBookEndingContract.test.ts` passed.

### Cross-Opening Browser Result

- Live route smoke check: `curl -I http://localhost:3000/` returned `HTTP/1.1 200 OK`.
- The dev server route remained loadable after the fix.

### True Book-End Result

- `tests/coach/stage2TrueBookEndStillRendersBranchComplete.test.ts` passed.
- True terminal book end still renders branch complete.

### Continuation-After-Click Result

- `tests/coach/stage2ContinueFromHereOnlyAtTrueBookEnd.test.ts` passed.
- Continue From Here remains gated behind true terminal branch completion.

### No-Live-Lichess Result

- `tests/coach/noLiveLichessRuntimeCalls.test.ts` passed.
- `tests/coach/runtimeDataSourceDebug.test.ts` passed.
- No live Lichess runtime call was introduced by this separation repair.

## Tests Run

- `npx tsx tests/coach/stage2RestrictedMoveAuthoritySeparation.test.ts`
- `npx tsx tests/coach/restrictedRuntimeBookOpponentTurnHandoff.test.ts`
- `npx tsx tests/coach/stage2ItalianWhiteE4E5RendersNf3NotLineComplete.test.ts`
- `npx tsx tests/coach/stage2ExpectedMovePreventsBookEnding.test.ts`
- `npx tsx tests/coach/stage2RestorePreviousBookEndingContract.test.ts`
- `npx tsx tests/coach/stage2TrueBookEndStillRendersBranchComplete.test.ts`
- `npx tsx tests/coach/stage2ContinueFromHereOnlyAtTrueBookEnd.test.ts`
- `npx tsx tests/coach/stage2BranchCompleteForbiddenWhenExpectedMoveExists.test.ts`
- `npx tsx tests/coach/stage2RuntimeBookNotExhaustedWhenExpectedMoveExists.test.ts`
- `npx tsx tests/coach/stage2ApprovedLiveRenderingExactMatch.test.ts`
- `npx tsx tests/coach/stage2ApprovedLiveRenderingFallback.test.ts`
- `npx tsx tests/coach/stage2ApprovedLiveRenderingNegativeMatch.test.ts`
- `npx tsx tests/coach/stage2ApprovedLiveRenderingNoAuthorityOverride.test.ts`
- `npx tsx tests/coach/stage2FeatureTraceNoAuthorityOverride.test.ts`
- `npx tsx tests/coach/stage2FeatureTraceApprovedContentTruth.test.ts`
- `npx tsx tests/coach/stage2FeatureTraceFallbackTruth.test.ts`
- `npx tsx tests/coach/stage2FeatureTracePlainViewTruth.test.ts`
- `npx tsx tests/coach/stage2FeatureTraceCastlingNormalization.test.ts`
- `npx tsx tests/coach/noLiveLichessRuntimeCalls.test.ts`
- `npx tsx tests/coach/runtimeCanonical21Openings.test.ts`
- `npx tsx tests/coach/runtime21OpeningTrainability.test.ts`
- `npx tsx tests/coach/runtimeDataSourceDebug.test.ts`
- `npm run test:coach-quality`
- `npm run test:trainer-debug`
- `npm run test:multi-move-qa`
- `npm run build`

## Build Result

- `npm run build` passed.

## Remaining Limitations

- The repository still contains unrelated untracked artifacts that were intentionally left alone.
- One exploratory seam-enrichment test outside the committed Stage 2 quality scripts still asserts an exact approved match for a context that is not exact in this tree; it was not part of the required pass/fail set for this separation repair.

## Unstaged / Untracked Files Left Alone

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

## Final Assessment

- The restricted-turn-cycle regression is repaired.
- Runtime-book exhaustion no longer ends the book.
- Approved content remains a coaching overlay, not book authority.
- True terminal book-end behavior remains intact.

`STAGE_2_TARGET_AUTHORITY_COACHING_OVERLAY_SEPARATION_STATUS: ACCEPTED`
