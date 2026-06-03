# Blundr v2.8.0 Agent 10.5D UI Regression Repair Report

## Scope
- Package 10.5D only.
- UI regression repair after 10.5B/10.5C safety fixes.
- Debug panel timeline/parity upgrades.

## Reproduced Regressions
- Plain pre-show-more visual leakage.
- Plain auto-hint behavior.
- Assisted reveal action exposure.
- Branch-complete card presentation regression.

## Root Causes
- Surface action policy still exposed `reveal_target` in modes where it was redundant/forbidden.
- Plain-mode suppression was incomplete at render/square-highlight boundaries.
- CoachCard pre-show-more copy path could show hint-like content before explicit hint interaction.
- Branch-complete route used generic card path instead of premium continue/restart treatment.
- Debug snapshot/panel had single-frame focus and lacked parity/timeline instrumentation.

## Changes Applied
- Action policy updated:
  - `plain_before_show_more`: `hint` + `show_more` only.
  - `assisted`: no reveal action.
  - `plain_after_show_more`: no reveal action.
  - `branch_complete`: `continue_from_here` + `restart_line`.
- Plain-mode rendering tightened:
  - pre-show-more hides move visuals, arrows, and source/destination highlight carryover.
  - hint content gated behind explicit hint interaction.
- Branch-complete premium card rendering restored in train UI path.
- Debug instrumentation upgraded:
  - coach card render timeline.
  - surface mode transition timeline.
  - action timeline.
  - visual render timeline.
  - plain leak timeline.
  - parity critical issues: `coach_card_debug_parity_mismatch`, `action_debug_parity_mismatch`, `visual_debug_parity_mismatch`.
  - plain leak critical: `plain_pre_show_more_leak_at_frame`.
- Debug panel upgraded with timeline sections and copy buttons:
  - current CoachCard JSON.
  - CoachCard render timeline JSON.
  - surface timeline JSON.
  - action timeline JSON.
  - visual timeline JSON.
  - plain leak timeline JSON.
  - full debug session JSON.

## Validation
- Passed:
  - `tests/coach/plainLeak.test.ts`
  - `tests/coach/showMoreVisualReveal.test.ts`
  - `tests/coach/uiSurfaceAdapter.test.ts`
  - `tests/coach/visibleTeachingSurface.test.ts`
  - `tests/coach/browserContract.test.ts`
  - `tests/coach/liveChainSmoke.test.ts`
  - `tests/coach/coachSafetyGate.test.ts`
  - `tests/coach/targetInvariant.test.ts`
  - `tests/coach/coachCompiler.test.ts`
  - `tests/coach/evidenceGraph.test.ts`
  - `tests/coach/dynamicConceptActivator.test.ts`
  - `tests/coach/teachingConceptRegistry.test.ts`
  - `tests/coach/currentInstructionFrame.test.ts`
  - `tests/coach/typeContracts.test.ts`
  - `tests/coach/goldenPositions.test.ts`
  - `tests/coach/providerFailure.test.ts`
  - `tests/coach/antiHallucination.test.ts`
  - `lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts`
- Build:
  - `npm run build` fails in this environment due Turbopack process binding (`Operation not permitted`), not due TypeScript/package logic after fixes.

## Manual Live QA
- Not performed in this terminal-only pass.
- Required scenarios remain listed for browser confirmation in follow-up QA.

## Verdict
- Package 10.5D code/test gate: pass.
- Manual browser QA: pending.
- Environment build caveat: Turbopack sandbox/process binding limitation in this run context.
