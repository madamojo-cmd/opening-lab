# Step C Preflight Cleanup Report

## Summary

This pass kept runtime authority intact and made a small, safe bundle cleanup by lazy-loading the debug-only diagnostics panel from `app/page.tsx` while leaving Stage 2 runtime repertoire selection and training-line initialization eager and static. The main runtime path still resolves `runtimeOpeningSelection` synchronously from `selectRuntimeWeightedOpeningSelection`, and the initial training-line selection still comes from `buildRuntimeTrainingLineSelection(runtimeOpeningSelection.selectedOpeningId, [], runtimeTrainingSessionId)`.

## What Changed

- Moved `BlundrDiagnosticsPanel` behind a client-side dynamic import so the main app shell no longer pays for debug panel code on first load.
- Added regression coverage for:
  - selectable Stage 2 openings being startable,
  - midline ply-6 non-terminal behavior,
  - unsafe performance splits that would lazy-load runtime authority modules.
- Kept the runtime repertoire and opening identity imports static in `app/page.tsx`.

## Verification

Passed:

- `npm run build`
- `npm run test:trainer-debug`
- `npm run test:coach-quality`
- `npm run test:multi-move-qa`
- `node --import tsx tests/coach/adaptiveOpeningIdentity.test.ts`
- `node --import tsx tests/coach/lichessOpeningIdentity.test.ts`
- `node --import tsx tests/coach/stage2AllOpeningsNoContinuationAtPly6Of12.test.ts`
- `node --import tsx tests/coach/stage2AllOpeningsCompleteAtPly12Of12.test.ts`
- `node --import tsx tests/coach/stage2BookEndTransitionsToContinuationOnlyAfterUserClick.test.ts`
- `node --import tsx tests/coach/stage2SelectableOpeningsStartable.test.ts`
- `node --import tsx tests/coach/stage2AllOpeningsMidlineNonTerminalBehavior.test.ts`
- `node --import tsx tests/coach/stage2NoUnsafePerformanceSplit.test.ts`

## Measurement Notes

- Largest static chunk before: `15.26 MB`.
- Largest static chunk after: `15.22 MB`.
- Net change: about `0.04 MB` smaller.
- `app/page.tsx`: `6927` lines, `428K`.

The dev-curl probes could not produce a trustworthy live sample in this sandbox because `next dev` binding attempts failed with `listen EPERM` for both `127.0.0.1:3001` and `0.0.0.0:3001`. The before/after timing notes are still recorded in the same directory for traceability.

## Key Files

- [app/page.tsx](/workspaces/opening-lab/app/page.tsx)
- [tests/coach/stage2SelectableOpeningsStartable.test.ts](/workspaces/opening-lab/tests/coach/stage2SelectableOpeningsStartable.test.ts)
- [tests/coach/stage2AllOpeningsMidlineNonTerminalBehavior.test.ts](/workspaces/opening-lab/tests/coach/stage2AllOpeningsMidlineNonTerminalBehavior.test.ts)
- [tests/coach/stage2NoUnsafePerformanceSplit.test.ts](/workspaces/opening-lab/tests/coach/stage2NoUnsafePerformanceSplit.test.ts)
- [docs/2026-06-25/step-c-preflight-cleanup/import-audit-after.txt](/workspaces/opening-lab/docs/2026-06-25/step-c-preflight-cleanup/import-audit-after.txt)
- [docs/2026-06-25/step-c-preflight-cleanup/largest-static-chunks-after.txt](/workspaces/opening-lab/docs/2026-06-25/step-c-preflight-cleanup/largest-static-chunks-after.txt)
