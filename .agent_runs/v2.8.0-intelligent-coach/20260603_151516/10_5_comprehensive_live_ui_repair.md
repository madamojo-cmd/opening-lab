# Agent 10.5 Report: Comprehensive Live UI Repair + Validation

## Scope
Repaired Package 10 v2.8 UI integration so canonical branch-complete/null-target states are treated as valid non-teaching states (not Safety Fallback failures), while preserving strict failure behavior on true teaching-frame integrity violations.

## Package 10 UI Integration Verified
Yes. Verified Package 10 feature-flagged v2.8 path was active and then repaired to remove null-target false failures.

## Live Failure Reproduced?
Partially reproduced in code-level diagnostics and integration logic:
- Non-canonical `currentInstructionFrame` branch-transition literals in `app/page.tsx`.
- Diagnostic classification treated null-target line-complete as `no_recipe` / `expected_move_missing` failures.
- v2.8 owner flags were active while visible coach source still mixed with legacy presentation fields.

## Root Cause
1. `app/page.tsx` created ad-hoc `branch_transition`/`thinking` frame objects outside canonical `buildCurrentInstructionFrame` contracts.
2. Valid null-target states (branch complete, opponent, terminal, transitioning) were classified by debug logic as teaching-frame failures.
3. Debug snapshot visible coach source preferred legacy presentation fields even when v2.8 owner was active.
4. Branch-complete copy path was not hard-locked to required line-complete messaging.

## Files Inspected
- `app/page.tsx`
- `lib/blundr/presentation/*`
- `lib/blundr/safety/*`
- `lib/blundr/runtime/*`
- `lib/blundr/debug/trainerDebugSnapshot.ts`
- `lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts`
- `tests/coach/*`
- Package 0–10 reports and latest state/risk artifacts

## Files Changed
- `app/page.tsx`
- `lib/blundr/presentation/copySurfaceBuilder.ts`
- `lib/blundr/debug/trainerDebugSnapshot.ts`
- `lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts`
- `tests/coach/uiSurfaceAdapter.test.ts`
- `tests/coach/visibleTeachingSurface.test.ts`
- `tests/coach/liveChainSmoke.test.ts`
- `tests/coach/browserContract.test.ts`
- `tests/coach/coachSafetyGate.test.ts`
- `.agent_runs/v2.8.0-intelligent-coach/20260603_151516/command_log.md`
- `.agent_runs/v2.8.0-intelligent-coach/20260603_151516/state.json`
- `.agent_runs/v2.8.0-intelligent-coach/20260603_151516/risk_register.md`

## Canonical Branch Complete Fix
- Replaced ad-hoc `branch_transition` frame literals in `app/page.tsx` with canonical `buildCurrentInstructionFrame(...)` branch-complete frames:
  - `kind: "branch_complete"`
  - `target: null`
  - `branchComplete.continueFromHereAvailable: true`
- Replaced ad-hoc `thinking` literal with canonical `transitioning` frame via runtime builder.

## Safety Fallback Fix
- Updated `copySurfaceBuilder` branch-complete copy to required canonical text:
  - Title: `Line complete`
  - Body: `You finished this training line. Continue from this position or train the line again.`
- Added tests ensuring valid branch-complete does not render Safety Fallback copy.

## Diagnostic Classification Fix
- Added explicit allowed null-target-state classifier in `trainerDebugSnapshot`.
- For valid null-target states, `no_recipe` and `expected_move_missing` are no longer treated as failures.
- `visible_coach_with_silent_intent` is suppressed for allowed null-target states only.
- Strict teaching-frame failure rules remain intact for real target-required states.

## v2.8 Owner / Diagnostic Source Fix
- Debug snapshot now prefers `visibleTeachingSurface` title/body/actions when v2.8 owner is active.
- Keeps v2.8 ownership reporting aligned (`visible_surface_v28` source path).

## Normal Teaching Coach Card Verification
- e4 / Nf3 / Bc4 chain tests remain passing.
- Added assertions that these teaching surfaces do not regress to Safety Fallback titles.

## Plain Mode Verification
- Plain-before-show-more remains leak-free by tests.
- No SAN/UCI/from/to/piece leakage introduced.

## Show More Verification
- Plain-after-show-more target/visual parity with assisted preserved by tests.

## Branch Complete Verification
- Branch-complete now validates as line-complete copy with null target and `continue_from_here` action.
- No reveal action and no move-arrow visuals.
- Debug regression tests verify no false `visible_coach_with_silent_intent`, `no_recipe`, or `expected_move_missing` failures.

## Continue From Here Verification
- Continue action routing remains distinct from reveal action.
- `continue_from_here` remains action-authority driven and null-target.

## Visual Behavior Verification
- Targeted assisted teaching frames still enforce target/visual alignment tests.
- Branch-complete/opponent/terminal null-target states are treated as visual not-applicable where appropriate.

## Action Behavior Verification
- Branch-complete exposes `continue_from_here` and no `reveal_target`.
- Plain-before-show-more remains `show_more` only.

## Tests Added or Updated
- `lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts`
- `tests/coach/uiSurfaceAdapter.test.ts`
- `tests/coach/visibleTeachingSurface.test.ts`
- `tests/coach/liveChainSmoke.test.ts`
- `tests/coach/browserContract.test.ts`
- `tests/coach/coachSafetyGate.test.ts`

## Commands Run
- Step A inspection command set (recorded)
- `npm run build`
- `node --import tsx tests/coach/uiSurfaceAdapter.test.ts`
- `node --import tsx tests/coach/visibleTeachingSurface.test.ts`
- `node --import tsx tests/coach/liveChainSmoke.test.ts`
- `node --import tsx tests/coach/browserContract.test.ts`
- `node --import tsx tests/coach/continuationFlow.test.ts`
- `node --import tsx tests/coach/plainLeak.test.ts`
- `node --import tsx tests/coach/showMoreVisualReveal.test.ts`
- `node --import tsx tests/coach/targetInvariant.test.ts`
- `node --import tsx tests/coach/coachSafetyGate.test.ts`
- `node --import tsx tests/coach/coachCompiler.test.ts`
- `node --import tsx tests/coach/evidenceGraph.test.ts`
- `node --import tsx tests/coach/dynamicConceptActivator.test.ts`
- `node --import tsx tests/coach/teachingConceptRegistry.test.ts`
- `node --import tsx tests/coach/currentInstructionFrame.test.ts`
- `node --import tsx tests/coach/typeContracts.test.ts`
- `node --import tsx tests/coach/goldenPositions.test.ts`
- `node --import tsx tests/coach/providerFailure.test.ts`
- `node --import tsx tests/coach/antiHallucination.test.ts`
- `node --import tsx lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts`
- `npm test` (missing script)
- `npm run lint` (missing script)

## Results
- Build passed.
- All required Package 10.5 test commands passed.
- Missing `npm test`/`npm run lint` scripts documented.

## Manual Live QA Performed?
No.

## Manual Live QA Results
Not executed in this environment (no browser/manual session run).

## Product Behavior Changed?
Yes. Canonical branch-complete/null-target handling and diagnostics now align with v2.8 visible surface semantics and avoid false Safety Fallback/health-failure signals for valid line-complete states.

## Known Remaining Risks
- Legacy bypass paths remain intentionally present (Package 11 scope).
- No manual browser verification in this run.
- `app/page.tsx` still uses a compatibility v2.8 surface bridge to avoid broad rewrite risk.

## Gate Verdict
Pass

## Handoff Notes for Package 11
- Remove remaining legacy bypass paths once manual/browser parity is confirmed.
- Keep strict teaching-frame failures (missing target, target/visual mismatch) intact.
- Preserve null-target not-applicable handling for branch_complete/opponent/terminal/transitioning.
