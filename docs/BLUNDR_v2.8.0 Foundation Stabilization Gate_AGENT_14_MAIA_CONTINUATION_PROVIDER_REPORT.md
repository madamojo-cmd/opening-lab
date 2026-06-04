# BLUNDR v2.8.0 Foundation Stabilization Gate — Agent 14
## Package 14: Maia Continuation Provider

- Branch: `v2.8.0-intelligent-coach-live`
- Baseline commit: `2019a20`
- Scope: Continuation-only opponent reply provider path with strict authority isolation.

## Files Changed
- `app/page.tsx`
- `lib/blundr/maia/maiaTypes.ts`
- `lib/blundr/maia/maiaProvider.ts`
- `lib/blundr/maia/maiaOpponentProvider.ts`
- `lib/blundr/debug/maiaTimeline.ts`
- `lib/blundr/debug/trainerDebugSnapshot.ts`
- `lib/blundr/debug/trainerDebugTypes.ts`
- `components/debug/BlundrDiagnosticsPanel.tsx`
- `tests/coach/maiaContinuationProvider.test.ts`
- `tests/coach/continuationFlowStability.test.ts`
- `tests/coach/browserContract.test.ts`
- `tests/coach/liveChainSmoke.test.ts`
- `tests/coach/stockfishValidationGate.test.ts`
- `tests/coach/moveStrengthBadge.test.ts`
- `tests/coach/branchCompleteRegressionAfterStockfish.test.ts`
- `lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts`

## Provider Architecture
- Added explicit Maia provider contracts and unavailable-safe default provider.
- Added continuation adapter utilities:
  - skill mapping
  - decision gating
  - legal candidate selection
  - timeout helper
  - optional sanity guard contract

## Continuation-Only Enforcement
- Maia gating denies restricted mode and pre-continue frames.
- Maia path is only called inside continuation opponent reply branch in `playOpponentMove`.

## Fallback Behavior
- Unavailable/timeout/illegal/stale/no-candidate all fall back to existing continuation opponent mechanism.
- No user-visible provider error messaging.

## Isolation Guarantees
- CurrentInstructionFrame target authority unchanged.
- VisibleTeachingSurface ownership unchanged.
- Stockfish continuation suggestion validation unchanged.
- MultiPV 32 user rating path unchanged.
- Branch-complete logic unchanged.

## Stale + Legality Guards
- Added Maia request id/fen4 tracking.
- Added stale checks prior to applying Maia result.
- Added legality check and illegal-candidate rejection path.

## Debug/Diagnostics
- Added `maiaTimeline` events and debug snapshot `maia` section.
- Added diagnostics panel Maia badge, Maia section, and Maia timeline export.
- Added warnings/critical checks for forbidden Maia influence.

## Automated Results
- `npm run build`: PASS
- Required Package 14 test list: PASS (including new `maiaContinuationProvider.test.ts`)

## Manual QA
- Dev server runtime smoke check passed (HTTP 200, no loop/reference crash in startup log).
- Full interactive scenario matrix not fully executed in this run.

## Remaining Risks
- Full manual scenario acceptance matrix pending.

## Gate Verdict
- BLOCKED (manual QA matrix incomplete for PASS criteria).
