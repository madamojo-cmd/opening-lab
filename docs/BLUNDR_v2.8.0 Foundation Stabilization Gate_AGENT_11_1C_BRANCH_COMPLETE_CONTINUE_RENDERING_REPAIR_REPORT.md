# BLUNDR v2.8.0 Foundation Stabilization Gate — Agent 11.1C Branch Complete / Continue Rendering Repair Report

## Scope
Package 11.1C: restore functional branch-complete continuation button rendering while preserving v2.8 single-surface architecture.

## Root Cause
1. Branch-complete frame gating was tied to `isUserTurn` in `app/page.tsx` hard gate path, so line-exhausted states on opponent-to-move frames could miss `branch_complete` transition.
2. Opponent reply scheduling could continue into line-exhausted states, delaying/avoiding branch-complete surface.
3. Debug branch-complete flags (`branchTransitionSurfaceRendered` / `continueFromHereAvailable`) were still partially legacy-derived and could report false even when v2.8 branch-complete actions existed.
4. `book_complete_without_policy` was too broad in debug health and flagged valid opponent-pending completion transitions.

## Functional Button Rendering Fix
- `app/page.tsx`
  - Added explicit `lineExhaustedBranchComplete` condition in `currentInstructionFrame` memo to produce canonical `branch_complete` frame when line is exhausted and no pending opponent request, regardless of `isUserTurn`.
  - Preserved null-target branch-complete contract and v2.8 surface chain.
  - Updated diagnostics snapshot inputs:
    - `branchTransitionSurfaceRendered` now includes v2.8 `visibleSurface.mode === branch_complete`.
    - `continueFromHereAvailable` now derives from visible v2.8 actions (`continue_from_here`) as well as legacy branchTransition surface.

## Opponent-Pending Policy Fix
- `app/page.tsx`
  - In opponent scheduling effect, added `lineExhaustedNeedsBranchComplete` gate:
    - While pending opponent reply exists, hold opponent-replying state.
    - Once pending is clear on exhausted line, transition out of opponent loop (sets `trainerPhase` back to `ready_for_user` if needed) so branch-complete surface can render.

## Book-Complete Critical Policy Fix
- `lib/blundr/debug/trainerDebugSnapshot.ts`
  - Replaced broad `book_complete && !guidedCompleteAllowed` critical with targeted unresolved-stuck condition:
    - no pending opponent request,
    - no instruction target,
    - not branch-complete visible mode,
    - resolver indicates exhausted/needs continuation.
  - Valid opponent-pending completion no longer emits `book_complete_without_policy` critical.

## Tests Added/Updated
- `tests/coach/liveChainSmoke.test.ts`
  - Added branch-complete action assertion for restart action with message `line_exhausted_user_turn_renders_continue_from_here`.
  - Added opponent-pending assertion with message `opponent_pending_does_not_render_continue_from_here_yet`.
  - Added branch-complete surface ownership assertion message `v28_branch_complete_uses_surface_not_legacy_card`.
- `tests/coach/visibleTeachingSurface.test.ts`
  - Added `restart_line` action assertion with message `branch_complete_surface_actions_include_continue_and_restart`.
- `tests/coach/currentInstructionFrame.test.ts`
  - Added branch-complete assertion message `opponent_reply_resolution_to_exhausted_line_enters_branch_complete`.
- `tests/coach/browserContract.test.ts`
  - Added contract assertions text for line-exhausted continue rendering and opponent-pending policy.
- `lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts`
  - Added regression coverage for `book_complete_without_policy`:
    - suppressed on valid opponent-pending completion (`book_complete_without_policy_only_when_true_unhandled_completion`),
    - critical on unresolved stuck completion (`no_stuck_ready_for_user_opponent_pending_after_line_end`).

## Required Commands
See command log: `.agent_runs/v2.8.0-intelligent-coach/20260603_182454/command_log.md`

## Results
- Build: pass (escalated retry required due sandbox Turbopack EPERM).
- Required Package 11.1C test command suite: pass.
- Runtime smoke: dev server loads (`200`), no observed `Maximum update depth exceeded`, `boardLinesToRender` ReferenceError, or persistent useEffect-size warnings in final clean run.

## Manual QA
- Full interactive Italian-line click-through and export flow is still not fully executable from this non-interactive run context.

## Verdict
Package 11.1C: **blocked for full manual acceptance only**; functional rendering/code+tests repaired.
