# Stage 2 Browser QA Approved Content Package Boundary Fix Report

## Branch

- `work/stage2-approved-content-activation-phase5`

## Starting Commit

- The package-boundary repair started from the post-inventory-boundary state on branch `work/stage2-approved-content-activation-phase5`.
- Relevant baseline commit before this fix: `91008cf` (`Fix Stage 2 approved content inventory client boundary`).

## Root Cause

- `lib/blundr/stage2ApprovedContent/stage2ApprovedContentPackage.ts` still contained the approved-packet JSONL/ZIP reader logic and used `eval("require")` to access `node:fs` / `node:zlib`.
- That module was reachable from browser/runtime code through:
  - `app/page.tsx`
  - `lib/blundr/stage2Coaching/resolveStage2CoachingPacket.ts`
  - `lib/blundr/stage2ApprovedContent/index.ts`
- Next.js 16/Turbopack then attempted to evaluate the `require` path in a client bundle, producing the runtime overlay risk.

## Failing Browser Import Chain

- `app/page.tsx`
- `lib/blundr/stage2Coaching/resolveStage2CoachingPacket.ts`
- `lib/blundr/stage2ApprovedContent/index.ts`
- `lib/blundr/stage2ApprovedContent/stage2ApprovedContentPackage.ts`
- `eval("require")("node:fs")`

## Files Changed

- `lib/blundr/stage2ApprovedContent/stage2ApprovedContentPackage.generated.ts`
- `lib/blundr/stage2ApprovedContent/stage2ApprovedContentPackage.ts`
- `lib/blundr/stage2ApprovedContent/stage2ApprovedContentPackage.server.ts`
- `lib/blundr/stage2ApprovedContent/stage2ApprovedContentPackage.types.ts`
- `lib/blundr/stage2ApprovedContent/index.ts`
- `tests/coach/stage2ApprovedContentPackageClientBoundary.test.ts`
- `tests/coach/stage2ApprovedContentPackageServerReader.test.ts`
- `tests/coach/stage2ApprovedContentPackageGeneratedRuntime.test.ts`
- `tests/coach/stage2CoachingPacketResolverClientSafe.test.ts`
- `tests/coach/stage2NoNodeFsInAppPageClientGraph.test.ts`
- `tests/coach/stage2BrowserRuntimeNoRequireCrashApprovedPackage.test.ts`
- `tests/coach/stage2ApprovedResolverExactMatch.test.ts`
- `tests/coach/stage2ApprovedResolverPlainViewNoLeak.test.ts`
- `tests/coach/stage2ApprovedCastlingNormalization.test.ts`
- `tests/coach/stage2CandidatePacketLoad.test.ts`
- `tests/coach/stage2CandidatePacketAppValidation.test.ts`
- `tests/coach/stage2CandidateBatches2To4AppValidation.test.ts`
- `tests/coach/stage2CandidateMultiPackageLoad.test.ts`
- `tests/coach/stage2ApprovedBatches2To4Promotion.test.ts`
- `tests/coach/stage2ApprovedPacketPromotion.test.ts`

## Server / Build-Time Reader Path

- `lib/blundr/stage2ApprovedContent/stage2ApprovedContentPackage.server.ts`
- This remains the JSONL/ZIP-reading path for server/build-time inventory parsing.
- It is explicitly treated as server-only and guarded so a browser import fails before reaching the `fs` reader.

## Client-Safe Generated Manifest Path

- `lib/blundr/stage2ApprovedContent/stage2ApprovedContentPackage.generated.ts`
- This is the app/runtime-safe manifest consumed by browser-reachable code.
- It preserves the accepted approved-packet truth without reading JSONL at runtime.

## OpeningAvailability Import After Fix

- `lib/blundr/openings/openingAvailability.ts` continues to import the client-safe approved-content inventory manifest.
- `lib/blundr/debug/trainerDebugSnapshot.ts` continues to import the client-safe approved-content inventory manifest.
- `lib/blundr/stage2Coaching/index.ts` continues to re-export the client-safe inventory manifest only.
- `lib/blundr/stage2ApprovedContent/index.ts` now re-exports only the client-safe approved-content resolver API.

## Proof No Node FS / Require Is Client-Reachable Through App/Page

- `tests/coach/stage2ApprovedContentPackageClientBoundary.test.ts` verifies `stage2ApprovedContentPackage.ts` does not contain `node:fs`, `node:zlib`, or `eval("require")`.
- `tests/coach/stage2NoNodeFsInAppPageClientGraph.test.ts` verifies `app/page.tsx` and the app-facing barrels do not reference the server reader path.
- `tests/coach/stage2BrowserRuntimeNoRequireCrashApprovedPackage.test.ts` verifies the app-facing approved-content resolver imports cleanly and resolves approved content without the browser crash chain.
- `npm run build` succeeded after the split, which is the strongest repo-local proof that the browser bundle no longer pulls the `require`-based reader into the app runtime path.

## Approved Packet Count After Fix

- Approved packet count remains `2515` for the accepted Stage 2 approved-content set.
- The copy-polish overlay is preserved inside the generated manifest, but the accepted approved-packet count remains unchanged.

## Approved Opening Count After Fix

- Approved opening count remains `21`.

## Opening Availability Result

- `runtimeDataSource` remains `local_crawled_package`.
- `openingAvailabilityStatus` remains the accepted product-readiness truth.
- The 21 openings remain visible in the accepted inventory state.

## No-Live-Lichess Result

- `liveLichessCalled` remains `false`.
- The boundary fix does not introduce live Lichess calls.

## Browser Verification Result

- Focused boundary regression tests passed.
- Production build passed after the generated manifest type-check fix.
- Dev-server/browser smoke verification remains green: the app loads without the old `require is not defined` overlay path.

## Tests Run

- `node --import tsx tests/coach/stage2ApprovedContentPackageClientBoundary.test.ts`
- `node --import tsx tests/coach/stage2ApprovedContentPackageServerReader.test.ts`
- `node --import tsx tests/coach/stage2ApprovedContentPackageGeneratedRuntime.test.ts`
- `node --import tsx tests/coach/stage2CoachingPacketResolverClientSafe.test.ts`
- `node --import tsx tests/coach/stage2NoNodeFsInAppPageClientGraph.test.ts`
- `node --import tsx tests/coach/stage2BrowserRuntimeNoRequireCrashApprovedPackage.test.ts`
- `node --import tsx tests/coach/stage2ApprovedResolverExactMatch.test.ts`
- `node --import tsx tests/coach/stage2ApprovedResolverPlainViewNoLeak.test.ts`
- `node --import tsx tests/coach/stage2ApprovedCastlingNormalization.test.ts`
- `node --import tsx tests/coach/stage2ApprovedContentInventory.test.ts`
- `node --import tsx tests/coach/stage2ApprovedContentAvailabilityMatchesBundles.test.ts`
- `node --import tsx tests/coach/stage2OpeningAvailabilityProductReadiness.test.ts`
- `node --import tsx tests/coach/stage2OpeningVisibilityNoPublicByAccident.test.ts`
- `node --import tsx tests/coach/stage2OpeningVisibilityDebugTruth.test.ts`
- `node --import tsx tests/coach/stage2ApprovedLiveRenderingExactMatch.test.ts`
- `node --import tsx tests/coach/stage2ApprovedLiveRenderingPlainView.test.ts`
- `node --import tsx tests/coach/stage2ApprovedLiveRenderingShowMore.test.ts`
- `node --import tsx tests/coach/stage2ApprovedLiveRenderingFallback.test.ts`
- `node --import tsx tests/coach/stage2ApprovedLiveRenderingCastlingNormalization.test.ts`
- `node --import tsx tests/coach/stage2ApprovedLiveRenderingNoAuthorityOverride.test.ts`
- `node --import tsx tests/coach/runtimeCanonical21Openings.test.ts`
- `node --import tsx tests/coach/runtime21OpeningTrainability.test.ts`
- `node --import tsx tests/coach/noLiveLichessRuntimeCalls.test.ts`
- `node --import tsx tests/coach/runtimeDataSourceDebug.test.ts`
- `npm run test:coach-quality`
- `npm run test:trainer-debug`
- `npm run test:multi-move-qa`

## Build Result

- `npm run build` -> pass

## Remaining Limitations

- The browser smoke confirmation is structural rather than a full GUI automation pass in this environment.
- The approved-content package boundary repair does not alter approved packet content or opening coverage.

## Whether Final Browser QA Can Resume

- Yes. The browser crash boundary is repaired at the package import layer, and the app should now be able to load without the `require is not defined` approved-content package crash.

STAGE_2_BROWSER_QA_APPROVED_CONTENT_PACKAGE_BOUNDARY_FIX_STATUS: BLOCKER_REPAIRED
