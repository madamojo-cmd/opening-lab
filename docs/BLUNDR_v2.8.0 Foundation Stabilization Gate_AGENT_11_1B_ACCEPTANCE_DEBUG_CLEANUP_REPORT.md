# BLUNDR v2.8.0 Foundation Stabilization Gate — Agent 11.1B Acceptance Debug Cleanup Report

## Scope
Package 11.1B: acceptance debug cleanup prior to Package 12.

## Failure Reproduction
- Prior terminal/checkmate misclassification was reproducible by code inspection:
  - legacy `buildCurrentInstructionFrame` path returned `opponent_replying` whenever `isUserTurn=false`, before checking `trainerPhase="terminal"`.
- Continuation transient candidate critical behavior was reproducible from runtime/debug logic:
  - runtime could emit `continuation_ready_without_candidate` during transitional states.
- Visual badge fail-on-`not_applicable` was reproducible from diagnostics panel logic.

## Root Cause Summary
1. Terminal priority bug in `currentInstructionFrame` legacy path condition ordering.
2. Continuation runtime critical emission too eager during expected status-only transitions.
3. Repeated generic copy critical used pattern repetition alone, without quality/visibility/target-alignment gating.
4. Visual diagnostics badge treated `visualFailureKind="not_applicable"` as fail.

## Fixes Applied
### A) Terminal/checkmate mode priority
- In `lib/blundr/runtime/currentInstructionFrame.ts`, terminal phase is now resolved before opponent-turn fallback in legacy input mode.
- Added regression in `tests/coach/currentInstructionFrame.test.ts`:
  - `terminal_checkmate_does_not_render_opponent_replying_surface` (assert message).

### B) Continuation transient critical cleanup
- In `app/page.tsx`, `continuation_ready_without_candidate` runtime critical now pushes only for true candidate-ready-without-candidate conditions (not transitional/analyzing states).
- In `lib/blundr/debug/trainerDebugSnapshot.ts`, transitional/null-target continuation status states suppress that issue as critical and downgrade to warning.
- Added regressions in `lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts`:
  - `continuation_analyzing_without_candidate_is_status_not_critical`
  - `continuation_candidate_without_target_is_critical`

### C) Repeated generic copy health cleanup
- In `lib/blundr/debug/trainerDebugSnapshot.ts`, `recent_repeated_generic_coach_copy` now remains critical only when quality/alignment/visible fallback conditions warrant it.
- Safe target-aligned repetitive copy is downgraded to warning: `recent_repeated_generic_coach_copy_downgraded`.
- Added regression:
  - `target_aligned_safe_copy_does_not_trigger_recent_repeated_generic_critical`

### D) Visual not-applicable cleanup
- In `lib/blundr/debug/trainerDebugSnapshot.ts`, null-target status modes include continuation/analyzing/transitioning contexts for `visualFailureKind="not_applicable"` behavior.
- In `components/debug/BlundrDiagnosticsPanel.tsx`, visual badge no longer fails on `not_applicable`.
- Added regression:
  - `terminal_null_target_no_visual_is_not_visual_fail`

## Required Commands
See command log: `.agent_runs/v2.8.0-intelligent-coach/20260603_180950/command_log.md`

## Results
- `npm run build`: pass (escalated retry; initial sandbox EPERM logged).
- Required tests: pass.
- Additional regression test run: `tests/coach/currentInstructionFrame.test.ts` pass.
- Dev startup/runtime smoke: pass (`GET /` 200, no max-depth/TDZ/ref errors in final clean run).

## Manual QA Constraint
- Full interactive path (branch-complete → Continue from Here → terminal/checkmate with live panel export validation) could not be fully executed in this non-interactive run context.

## Package Verdict
Package 11.1B: **blocked for full manual acceptance**, with code/test debug cleanup complete and stable.
