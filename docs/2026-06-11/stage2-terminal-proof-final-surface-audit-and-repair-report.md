# Stage 2 Terminal Proof Final Surface Audit and Repair Report

## Branch / Commit

- Branch: `work/stage2-approved-content-activation-phase5`
- Starting commit: `9ec4280` (`Separate Stage 2 target authority from coaching overlay`)

## Root Cause

- The final visible surface was still treating `runtimeBook.bookExhausted` as enough evidence for `Line complete`.
- That made the branch-complete surface fire on the Italian White `e2e4, e7e5, g1f3` frame even when the selected line cursor was null and no terminal proof existed.
- In other words, the code was using terminal-by-absence instead of terminal-by-proof.

## Why `runtimeBook.bookExhausted` Was Insufficient

- Runtime-book exhaustion only says the local runtime lookup had no continuation candidates for the current frame key.
- It does not prove that the selected instructional line is terminal.
- A frame can be exhausted in the runtime-book sense while the selected training line still has an opponent reply expected, or while the selected line cursor is unavailable.

## Why a Null Selected-Line Cursor Could Not Prove Terminal

- The selected-line cursor is the actual proof signal for line completion.
- If the cursor is null, the app cannot prove that the current frame has reached the end of the selected line.
- That means the final surface must not render `Line complete` from runtime-book exhaustion alone.

## Implementation

- Added `lib/blundr/runtime/terminalProof.ts`.
- Added a pure terminal-proof resolver that derives proof from:
  - selected-line cursor confirmation
  - selected-line exhaustion evidence
  - explicit curated terminal nodes
  - valid branch-complete latches
- Runtime-book exhaustion is tracked as debug truth only when it is not accompanied by terminal proof.
- Wired `app/page.tsx` to gate final surface behavior on `stage2TerminalProof.proven` instead of runtime-book exhaustion.
- Updated frame-resolution and debug layers to carry terminal-proof truth through the app state.

## Final Surface Gate

- `hardEndOfBookGate` now depends on terminal proof instead of runtime-book exhaustion.
- The branch-complete surface and continue-from-here availability are only reached when the terminal-proof gate passes.
- `runtimeBook.bookExhausted` remains visible in debug output, but it no longer drives the final visible `Line complete` surface by itself.

## Copy Everything Fields

- Added terminal-proof truth to the debug snapshot and Copy Everything payload:
  - `terminalProof.proven`
  - `terminalProof.source`
  - `terminalProof.reason`
  - `terminalProof.blockedReasons`
  - `terminalProof.runtimeBookExhaustionObserved`
  - `terminalProof.runtimeBookExhaustionTreatedAsDebugOnly`
  - `finalSurfaceAuthority.branchCompleteAllowedByTerminalProof`
  - `finalSurfaceAuthority.continueFromHereAllowedByTerminalProof`
  - `finalSurfaceAuthority.runtimeBookExhaustionTreatedAsDebugOnly`
  - `finalSurfaceAuthority.finalSurfaceBlockedReasons`

## Files Changed

- `app/page.tsx`
- `lib/blundr/runtime/terminalProof.ts`
- `lib/blundr/debug/buildTrainerFrameResolution.ts`
- `lib/blundr/debug/trainerFrameResolutionTypes.ts`
- `lib/blundr/debug/trainerDebugSnapshot.ts`
- `lib/blundr/debug/buildStage2FeatureTrace.ts`
- `lib/blundr/debug/stage2FeatureTraceTypes.ts`
- `tests/coach/stage2TerminalProofRequiredForBranchComplete.test.ts`
- `tests/coach/stage2CopyEverythingReportsTerminalProof.test.ts`

## Verification

- Italian White browser-path regression:
  - `tests/coach/stage2TerminalProofRequiredForBranchComplete.test.ts` confirmed that the blocked frame does not render `Line complete` or `Continue From Here`.
- True book-end regression:
  - The same test confirmed that a real terminal proof still renders `Line complete` and exposes `continue_from_here`.
- Copy Everything regression:
  - `tests/coach/stage2CopyEverythingReportsTerminalProof.test.ts` confirmed terminal-proof fields are present in the serialized debug payload.

## Tests Run

- `npx tsx tests/coach/stage2TerminalProofRequiredForBranchComplete.test.ts`
- `npx tsx tests/coach/stage2CopyEverythingReportsTerminalProof.test.ts`
- `npx tsx tests/coach/stage2ItalianWhiteE4E5RendersNf3NotLineComplete.test.ts`
- `npx tsx tests/coach/stage2TrueBookEndStillRendersBranchComplete.test.ts`
- `npx tsx tests/coach/stage2ContinueFromHereOnlyAtTrueBookEnd.test.ts`
- `npx tsx tests/coach/stage2TrueLineEndStillAllowsContinuationClick.test.ts`
- `npx tsx tests/coach/restrictedRuntimeBookOpponentTurnHandoff.test.ts`
- `npx tsx tests/coach/restrictedLineExhaustedBranchCompleteButtons.test.ts`
- `npx tsx tests/coach/runtimeBookBeforeContinuation.test.ts`
- `npx tsx tests/coach/runtimeBookExhaustionContinuation.test.ts`
- `npx tsx tests/coach/effectiveContinuationCandidateAuthority.test.ts`
- `npx tsx tests/coach/plainViewNoLeakBeforeShowMore.test.ts`
- `npx tsx tests/coach/stage2FeatureTrace.test.ts`
- `npx tsx tests/coach/stage2FeatureTraceNoAuthorityOverride.test.ts`
- `npm run test:coach-quality`
- `npm run test:trainer-debug`
- `npm run test:multi-move-qa`
- `npm run build`

## Live Smoke

- `npm run dev -- --hostname 0.0.0.0 --port 3000`
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.

## Remaining Limitations

- The app still reports runtime-book exhaustion in debug state, but now only as non-authoritative evidence.
- The final surface is still controlled by the existing branch-complete and continuation structure, which now requires terminal proof to activate.
- I could not directly inspect the browser overlay with the available tooling; the live smoke confirms the app root serves successfully on the dev server.

## Status

STAGE_2_TERMINAL_PROOF_REPAIR_STATUS: ACCEPTED
