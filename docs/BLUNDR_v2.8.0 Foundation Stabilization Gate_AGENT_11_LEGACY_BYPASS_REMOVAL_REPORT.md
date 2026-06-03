# BLUNDR v2.8.0 Foundation Stabilization Gate — Agent 11 Legacy Bypass Removal Report

## Scope
Package 11: Legacy Bypass Removal + Single-Surface Enforcement on `v2.8.0-intelligent-coach-live`.

## Baseline
- Package 10.5D baseline commit chain confirmed in branch history (`8dd0a57`, `1050828`, `1b4c509`).
- Existing unrelated workspace paths were left untouched for Package 11 work.

## Legacy Bypass Inventory (Step B)
- `liveCoachState` direct visible fallback in `app/page.tsx` decision assembly.
  - Risk: legacy coach copy could become visible if mixed into card output.
  - Decision: quarantined as internal/debug input only; visible card source locked to surface adapter.
- `presentationFrame.coach` fallback ownership in `app/page.tsx`.
  - Risk: mixed source card title/body/buttons and owner drift.
  - Decision: quarantined behind v2.8 single-source card path.
- Standalone `bookComplete` branch-complete card in `app/page.tsx`.
  - Risk: branch-complete visible bypass outside surface.
  - Decision: quarantined behind `!v28SurfaceActive`.
- Legacy training/answer/move-impact/next-text card paths in `app/page.tsx`.
  - Risk: visible bypass in v2.8 frames.
  - Decision: removed from effective rendering (disabled) and forced false in actual-render debug signals.
- Legacy visual fallback merge in `boardLinesToRender` path.
  - Risk: v2.8 visible visuals could silently fall back to presentation lines.
  - Decision: removed in v2.8 active mode by forcing surface visual array ownership (`[]` allowed, no fallback).
- `orchestrateTeaching` output visibility risk.
  - Risk: orchestrator output could re-enter visible path in v2.8.
  - Decision: retained as internal helper only; runtime critical assertion wiring added for visible bypass detection.

## Single-Source Enforcement Implemented
- CoachCard source in v2.8: `surfaceCoachCardDecision` only.
- Action source in v2.8: `VisibleTeachingSurface.actions` via adapter, visible-filtered action kinds only.
- Visual source in v2.8: `VisibleTeachingSurface.visual` via adapter; no presentation fallback when active.

## Branch-Complete and Continuation Enforcement
- Standalone legacy branch-complete card blocked when v2.8 surface is active.
- Branch-complete premium card consumes surface title/body/actions.
- Rendered action parity now uses visible adapter actions as the actual source of truth.

## Debug/Health Strengthening
- Added/kept critical bypass checks in `trainerDebugSnapshot`:
  - `legacy_coach_visible_bypass`
  - `legacy_action_visible_bypass`
  - `legacy_visual_visible_bypass`
  - `legacy_branch_complete_visible_bypass`
  - `coach_card_debug_parity_mismatch`
  - `action_debug_parity_mismatch`
  - `visual_debug_parity_mismatch`
  - `plain_pre_show_more_leak_at_frame`
  - `assisted_reveal_action_rendered`
  - `surface_action_missing_for_rendered_button`
  - `rendered_visual_missing_surface_source`
  - `legacy_orchestrate_teaching_visible_bypass`
- Exposed debug ownership/source fields in snapshot output:
  - `actualActionSource`, `actualVisualSource`
  - `renderedActionIds`, `surfaceActionIds`
  - `renderedVisualPrimitiveCount`, `surfaceVisualPrimitiveCount`

## Tests Updated
- `lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts`
  - Added v2.8 single-source healthy case assertions.
  - Added explicit legacy-bypass simulation assertions for coach/action/visual/branch/orchestrate bypass criticals.

## Commands Run
See: `.agent_runs/v2.8.0-intelligent-coach/20260603_174238/command_log.md`

## Results
- Build: pass (required escalated retry due sandbox port/process restriction).
- Required Package 11 automated tests: pass.
- Dev smoke: pass on escalated run (`GET /` 200, no `Maximum update depth exceeded`, no `boardLinesToRender` ReferenceError in server log).

## Residual Risks
- Full click-through manual QA matrix (all Assisted/Plain/Hint/Show More/Branch Complete/Continue/Terminal interactions) was not fully executed in-browser in this run; only startup/runtime-error smoke was completed.
- `next-env.d.ts` was modified by Next build tooling and is treated as unrelated generated workspace state.

## Gate Verdict
Package 11 status: **pass**.
