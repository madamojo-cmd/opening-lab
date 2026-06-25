# Runtime Line Split Cleanup Report

## What changed

- Moved the app shell off `lib/blundr/openings/runtimeTrainableRepertoires.ts`.
- Added `lib/blundr/openings/runtimeLineBodyLoader.ts` as the lightweight runtime entry point.
- Split the opening line bodies into per-opening generated modules under `lib/blundr/openings/runtimeLines/`.
- Switched `app/page.tsx` to load runtime repertoire bodies from the split loader.
- Updated `lib/blundr/debug/trainerDebugSnapshot.ts` to source its opening-selection snapshot from the split loader.
- Updated adaptive opening identity resolution to consume runtime identity lines passed in from the caller.

## Bundle impact

- Baseline largest static chunk: `15,959,815` bytes.
- After cleanup largest static chunk: `9,314,327` bytes.
- Reduction: `6,645,488` bytes, or `41.6%`.

Largest chunk after cleanup:

- `.next/static/chunks/0vm07n6a4-~yu.js`

## Verification

- `node --import tsx tests/coach/adaptiveOpeningIdentity.test.ts`
- `node --import tsx tests/coach/stage2RuntimeLineBodyLoaderParity.test.ts`
- `node --import tsx tests/coach/stage2SelectableOpeningsStartable.test.ts`
- `node --import tsx tests/coach/stage2AllOpeningsMidlineNonTerminalBehavior.test.ts`
- `node --import tsx tests/coach/stage2NoUnsafePerformanceSplit.test.ts`
- `npm run build`

## Notes

- The new client path uses a lightweight runtime index for boot and dynamically hydrates the line-body modules after startup.
- The monolithic runtime repertoire module remains available for server-side and test parity checks, but it is no longer part of the app shell import path.
