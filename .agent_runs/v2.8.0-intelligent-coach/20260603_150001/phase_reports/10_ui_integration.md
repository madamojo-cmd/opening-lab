# Agent 10 Report: UI Integration Behind Safe Adapter/Flag

## Scope
Integrated the v2.8.0 canonical teaching chain into UI-facing paths behind a feature flag and adapter layer, while preserving legacy fallback paths and avoiding broad rewrites.

## Package 9 Surface Consumed
Yes. Consumed Package 9 `VisibleTeachingSurface` contracts and builder behavior from `lib/blundr/presentation/*` and Package 9 report/state/risk artifacts.

## Files Inspected
- Agent 1–9 reports in `docs/`
- Latest run state/risk from `.agent_runs/v2.8.0-intelligent-coach/20260603_145214`
- `app/page.tsx`
- `components/coach/CoachCard.tsx`
- `components/board/TeachingOverlay.tsx`
- `components/board/VisualRecipeLayer.tsx`
- `lib/blundr/presentation/*`
- `tests/coach/*`

## Files Changed
- `app/page.tsx`
- `components/coach/CoachCard.tsx`
- `components/board/TeachingOverlay.tsx`
- `components/board/VisualRecipeLayer.tsx`
- `lib/blundr/presentation/index.ts`
- `tests/coach/browserContract.test.ts`
- `.agent_runs/v2.8.0-intelligent-coach/20260603_150001/command_log.md`
- `.agent_runs/v2.8.0-intelligent-coach/20260603_150001/state.json`
- `.agent_runs/v2.8.0-intelligent-coach/20260603_150001/risk_register.md`

## New Files Created
- `lib/blundr/presentation/featureFlags.ts`
- `lib/blundr/presentation/buildLiveVisibleTeachingSurface.ts`
- `lib/blundr/presentation/uiSurfaceAdapter.ts`
- `tests/coach/uiSurfaceAdapter.test.ts`
- `.agent_runs/v2.8.0-intelligent-coach/20260603_150001/10_ui_integration.md`
- `.agent_runs/v2.8.0-intelligent-coach/20260603_150001/phase_reports/10_ui_integration.md`

## Feature Flag Behavior
- Added `BLUNDR_V2_8_VISIBLE_SURFACE_ENABLED = true` and `isV28VisibleSurfaceEnabled()`.
- `app/page.tsx` computes canonical surface + adapters when enabled.
- Legacy path remains available as fallback when disabled.

## Live Surface Builder Behavior
`buildLiveVisibleTeachingSurface` now performs:
1. `buildEvidenceGraph`
2. `activateTeachingConcepts`
3. `compileCoachFrame`
4. `runCoachSafetyGate`
5. `buildVisibleTeachingSurface`

No target override logic was added.

## UI Adapter Behavior
- Added `adaptVisibleSurfaceToCoachUi(surface)` and `adaptVisibleSurfaceToBoardVisuals(surface)`.
- Adapters read only `VisibleTeachingSurface`.
- Adapters preserve null-target behavior and filter to visible actions/visuals.

## Coach UI Wiring
- `app/page.tsx` now feeds `CoachCard` from adapted v2.8 coach model when flag is enabled.
- `CoachCard` supports optional `surfaceActions` (label/kind/enabled/visible) and renders those directly.
- Added action handling in page for surface actions `reveal_target` and `hide_more`.

## Board Visual Wiring
- `app/page.tsx` now maps adapted board visuals into line overlays when v2.8 surface is active.
- In v2.8 path, board line fallback synthesis from instruction target is disabled.
- `TeachingOverlay` and `VisualRecipeLayer` accept optional v2.8 board visual model inputs as integration-safe extension points.

## Plain Mode Behavior
- Plain before Show More stays copy-only with `show_more`, no target move visuals.
- No target reveal action is exposed in plain-before-show-more.

## Show More Behavior
- Plain after Show More can expose `reveal_target` from surface actions.
- Plain-after-show-more target visuals align with assisted surface visuals via the same adapted source.

## Branch Complete Behavior
- Branch complete surfaces remain null-target and expose Continue from Here only when surface action exists.

## Null-Target Behavior
- `opponent_replying` / `terminal` / blocked remain no-target visual/action surfaces through adapter path.

## Tests Added or Updated
- Added: `tests/coach/uiSurfaceAdapter.test.ts`
- Updated: `tests/coach/browserContract.test.ts`

## Commands Run
- Step A inspection command set (recorded in command log)
- `npm run build` (pass)
- `npm run build` (escalated rerun due sandbox Turbopack process/port restriction; pass)
- `node --import tsx tests/coach/uiSurfaceAdapter.test.ts`
- `node --import tsx tests/coach/visibleTeachingSurface.test.ts`
- `node --import tsx tests/coach/liveChainSmoke.test.ts`
- `node --import tsx tests/coach/coachSafetyGate.test.ts`
- `node --import tsx tests/coach/coachCompiler.test.ts`
- `node --import tsx tests/coach/teachingConceptRegistry.test.ts`
- `node --import tsx tests/coach/dynamicConceptActivator.test.ts`
- `node --import tsx tests/coach/evidenceGraph.test.ts`
- `node --import tsx tests/coach/currentInstructionFrame.test.ts`
- `node --import tsx tests/coach/typeContracts.test.ts`
- `node --import tsx tests/coach/goldenPositions.test.ts`
- `node --import tsx tests/coach/targetInvariant.test.ts`
- `node --import tsx tests/coach/continuationFlow.test.ts`
- `node --import tsx tests/coach/plainLeak.test.ts`
- `node --import tsx tests/coach/showMoreVisualReveal.test.ts`
- `node --import tsx tests/coach/providerFailure.test.ts`
- `node --import tsx tests/coach/antiHallucination.test.ts`
- `node --import tsx tests/coach/browserContract.test.ts`
- `npm test` (missing script)
- `npm run lint` (missing script)

## Results
- Build passed.
- Required test suite passed.
- `npm test`/`npm run lint` are not defined and were documented.

## Product Behavior Changed?
Yes. UI integration path now consumes v2.8 VisibleTeachingSurface-derived coach/actions/visual data behind a feature flag (default enabled), with legacy fallback retained.

## Known Remaining Risks
- Integration uses a compatibility surface shim in `app/page.tsx`; full direct canonical surface consumption by all UI paths remains for later cleanup package.
- Legacy bypass code still exists by design in this package and is not yet removed.
- No manual/browser QA executed in this package.

## Handoff Notes for Package 10.5 and 11
- Package 10.5: tighten adapter-only UI consumption and reduce compatibility shim footprint.
- Package 11: remove dead legacy teaching/bypass paths once parity is confirmed.
- Keep `CurrentInstructionFrame.target` as the sole teaching authority and keep SafetyGate safe-frame-only output invariant.
