# Agent 4 Report: CurrentInstructionFrame Runtime Authority

## Scope
Hardened runtime authority contracts so `CurrentInstructionFrame.target` can serve as canonical target truth for future visible teaching flow, while preserving current app compatibility and avoiding UI wiring changes.

## Package 3 Tests Consumed
- `tests/coach/goldenPositions.test.ts`
- `tests/coach/targetInvariant.test.ts`
- `tests/coach/continuationFlow.test.ts`
- `tests/coach/plainLeak.test.ts`
- `tests/coach/showMoreVisualReveal.test.ts`
- `tests/coach/providerFailure.test.ts`
- `tests/coach/antiHallucination.test.ts`
- `tests/coach/browserContract.test.ts`

## Files Inspected
- Agent 1 authority audit + legacy bypass map
- Agent 2 core contracts report
- Agent 3 ground-truth harness report
- latest Package 3 state/risk files
- runtime files under `lib/blundr/runtime/`
- tests under `tests/coach/`

## Files Changed
- `lib/blundr/runtime/currentInstructionTarget.ts`
- `lib/blundr/runtime/currentInstructionFrame.ts`
- `lib/blundr/runtime/instructionFrameLock.ts`
- `lib/blundr/runtime/continuationRuntimeState.ts`
- `tests/coach/currentInstructionFrame.test.ts` (new)
- `tests/coach/targetInvariant.test.ts`
- `tests/coach/continuationFlow.test.ts`
- `tests/coach/goldenPositions.test.ts`

## New Files Created
- `tests/coach/currentInstructionFrame.test.ts`

## Runtime Helpers Added
- In `currentInstructionTarget.ts`:
  - `splitUciMove`
  - `getTargetSignature`
  - `normalizeBlundrColor`
- In `currentInstructionFrame.ts`:
  - Canonical build-path support for explicit frame contract input
  - Deterministic canonical frame key generation
  - strengthened `assertLockedInstructionTarget` (requires locked confidence)
  - hardened role helpers across frame kinds
- In `instructionFrameLock.ts`:
  - `lockInstructionTarget`
  - `assertFrameTargetLocked`
  - `createTargetMismatchIssue`

## Continuation Helpers Added
- In `continuationRuntimeState.ts`:
  - `ContinuationRuntimePhase`
  - `ContinuationRuntimeStateV2`
  - `buildContinuationRuntimeState(...)`
- Enforced continuation constraints:
  - pre-continue branch complete state has null candidate
  - post-continue locks exactly one structurally valid candidate
  - non-`continuation_policy` sources (`maia`, `stockfish`, etc.) cannot lock target

## Invariants Enforced
- Guided/branch/continuation teaching kinds require target (with critical issue if missing).
- `continuation_candidate` requires explicit `candidateLocked`.
- `opponent_replying` / `transitioning` / `branch_complete` / `terminal` force null target and emit critical issues when target is provided.
- `debug.targetSignature` is derived from target signature.
- Canonical frame key is deterministic from `fenBefore`, `ply`, `kind`, `mode`, `source`, and target signature.

## Tests Added or Updated
- Added `tests/coach/currentInstructionFrame.test.ts` with 18 required runtime-authority checks.
- Updated:
  - `tests/coach/targetInvariant.test.ts`
  - `tests/coach/continuationFlow.test.ts`
  - `tests/coach/goldenPositions.test.ts`

## Commands Run
- Step A inspection commands from package instructions.
- `npm run build` (first failed on typing issue, then passed after fix).
- Required targeted test commands via `node --import tsx`:
  - `currentInstructionFrame.test.ts`
  - `typeContracts.test.ts`
  - `goldenPositions.test.ts`
  - `targetInvariant.test.ts`
  - `continuationFlow.test.ts`
  - `plainLeak.test.ts`
  - `showMoreVisualReveal.test.ts`
  - `providerFailure.test.ts`
  - `antiHallucination.test.ts`
  - `browserContract.test.ts`

## Results
- Build: pass.
- All required targeted tests: pass.
- `npm test` and `npm run lint` scripts still unavailable in `package.json`.

## Product Behavior Changed?
No intentional UI/product behavior change. Runtime authority contracts/helpers and tests were hardened only.

## Known Remaining Risks
- Dual legacy + canonical `buildCurrentInstructionFrame` input paths coexist until migration is complete.
- Legacy bypass rendering/action paths remain active in `app/page.tsx` by design.
- Continuation legality is structural only in this package (board-truth legality deferred).

## Handoff Notes for Package 5
- Use canonical frame path and lock helpers as runtime authority source for downstream compiler/safety wiring.
- Keep non-authority providers (Stockfish/Maia/opening knowledge) evidence-only.
- Start reducing dual-path drift by migrating callers from legacy build input to canonical input where safe.
