# Stage 2 Browser QA Approved Content Inventory Boundary Fix Report

## Branch

- `work/stage2-approved-content-activation-phase5`

## Starting Commit

- The boundary-fix work started from the post-provider-warning state on branch `work/stage2-approved-content-activation-phase5`.
- Relevant pre-fix commit baseline: `8497354` (`Add Stage 2 provider warning policy`).

## Root Cause

- `lib/blundr/stage2Coaching/stage2ApprovedContentInventory.ts` read approved packet JSONL files through `node:fs` / `eval("require")`.
- That inventory module was reachable from browser/runtime code through:
  - `app/page.tsx`
  - `lib/blundr/openings/openingAvailability.ts`
  - `lib/blundr/stage2Coaching/index.ts`
- Next.js 16/Turbopack then attempted to evaluate the `require` path in a client bundle, producing `ReferenceError: require is not defined`.

## Failing Browser Import Chain

- `app/page.tsx`
- `lib/blundr/openings/openingAvailability.ts`
- `lib/blundr/stage2Coaching/stage2ApprovedContentInventory.ts`
- `eval("require")("node:fs")`

## Files Changed

- `lib/blundr/stage2Coaching/stage2ApprovedContentInventory.generated.ts`
- `lib/blundr/stage2Coaching/stage2ApprovedContentInventory.ts`
- `lib/blundr/openings/openingAvailability.ts`
- `lib/blundr/debug/trainerDebugSnapshot.ts`
- `lib/blundr/stage2Coaching/index.ts`
- `tests/coach/stage2AppPageClientBoundary.test.ts`
- `tests/coach/stage2ApprovedContentInventoryServerReader.test.ts`
- `tests/coach/stage2OpeningAvailabilityClientSafeImport.test.ts`

## Server / Build-Time Reader Path

- `lib/blundr/stage2Coaching/stage2ApprovedContentInventory.ts`
- This remains the JSONL-reading path for server/build-time inventory parsing.
- It is now explicitly treated as server-only and guarded so a browser import fails before reaching the `fs` reader.

## Client-Safe Generated Manifest Path

- `lib/blundr/stage2Coaching/stage2ApprovedContentInventory.generated.ts`
- This is the app/runtime-safe manifest consumed by browser-reachable code.
- It preserves the accepted 21-opening inventory truth without reading JSONL at runtime.

## OpeningAvailability Import After Fix

- `lib/blundr/openings/openingAvailability.ts` now imports from `../stage2Coaching/stage2ApprovedContentInventory.generated`.
- `lib/blundr/debug/trainerDebugSnapshot.ts` also imports the generated manifest.
- `lib/blundr/stage2Coaching/index.ts` re-exports the generated manifest instead of the server reader.

## Proof No Node FS / Require Is Client-Reachable Through App/Page

- `tests/coach/stage2AppPageClientBoundary.test.ts` verifies `app/page.tsx` does not import the server reader path.
- `tests/coach/stage2OpeningAvailabilityClientSafeImport.test.ts` verifies `openingAvailability` can be imported in a client-like environment without crashing.
- `npm run build` succeeded after the split, which is the strongest repo-local proof that the browser bundle no longer pulls the `require`-based reader into the app runtime path.

## Approved Packet Count After Fix

- Approved packet count remains `2515` for the accepted Stage 2 approved-content set.
- The 21-opening inventory remains a separate opening-coverage/truth table and is unchanged by this boundary repair.

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

- Focused browser-boundary regression tests passed.
- Production build passed after the generated manifest typing fix.
- Dev-server/browser smoke verification is ready to resume once the app is launched; this repair specifically removes the client-reachable `require`/`node:fs` path that caused the runtime overlay.

## Tests Run

- `npx tsx tests/coach/stage2ApprovedContentInventoryServerReader.test.ts`
- `npx tsx tests/coach/stage2OpeningAvailabilityClientSafeImport.test.ts`
- `npx tsx tests/coach/stage2AppPageClientBoundary.test.ts`
- `npx tsx tests/coach/stage2ApprovedContentInventory.test.ts`
- `npx tsx tests/coach/stage2ApprovedContentAvailabilityMatchesBundles.test.ts`
- `npx tsx tests/coach/stage2OpeningAvailabilityProductReadiness.test.ts`
- `npx tsx tests/coach/stage2OpeningVisibilityNoPublicByAccident.test.ts`
- `npx tsx tests/coach/stage2OpeningVisibilityDebugTruth.test.ts`
- `npx tsx tests/coach/stage2ApprovedLiveRenderingExactMatch.test.ts`
- `npx tsx tests/coach/stage2ApprovedLiveRenderingPlainView.test.ts`
- `npx tsx tests/coach/stage2ApprovedLiveRenderingShowMore.test.ts`
- `npx tsx tests/coach/stage2ApprovedLiveRenderingFallback.test.ts`
- `npx tsx tests/coach/stage2ApprovedLiveRenderingCastlingNormalization.test.ts`
- `npx tsx tests/coach/stage2ApprovedLiveRenderingNoAuthorityOverride.test.ts`
- `npx tsx tests/coach/runtimeCanonical21Openings.test.ts`
- `npx tsx tests/coach/runtime21OpeningTrainability.test.ts`
- `npx tsx tests/coach/noLiveLichessRuntimeCalls.test.ts`
- `npx tsx tests/coach/runtimeDataSourceDebug.test.ts`
- `npm run test:coach-quality`
- `npm run test:trainer-debug`
- `npm run test:multi-move-qa`

## Build Result

- `npm run build` -> pass

## Remaining Limitations

- Browser smoke verification still needs an interactive forwarded port session to visually confirm the absence of the old overlay.
- The approved-content inventory boundary repair is structural; it does not alter approved packet content or opening coverage.

## Whether Final Browser QA Can Resume

- Yes. The browser crash boundary is repaired at the import layer, and the app should now be able to load without the `require is not defined` inventory crash.

STAGE_2_BROWSER_QA_APPROVED_CONTENT_INVENTORY_BOUNDARY_FIX_STATUS: BLOCKER_REPAIRED
