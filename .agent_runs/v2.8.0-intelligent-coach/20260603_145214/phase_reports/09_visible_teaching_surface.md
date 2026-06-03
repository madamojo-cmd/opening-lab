# Agent 9 Report: VisibleTeachingSurface Builder

## Scope
Implemented the Package 9 presentation contract and deterministic surface builder that converts `SafetyGateOutput.safeFrame` into a mode-aware `VisibleTeachingSurface` without UI wiring changes.

## Package 8.5 Live Chain Consumed
Yes. Package 8.5 artifacts were read from `.agent_runs/v2.8.0-intelligent-coach/20260603_145214` (`state.json`, `risk_register.md`, `08_5_headless_live_chain.md`).

## Files Inspected
- `lib/blundr/presentation/*`
- `lib/blundr/safety/*`
- `lib/blundr/coachCompiler/*`
- `tests/coach/*`
- `app/page.tsx` (read-only compatibility check)
- Agent 1 through Agent 8.5 reports in `docs/`

## Files Changed
- `lib/blundr/presentation/buildVisibleTeachingSurface.ts`
- `lib/blundr/presentation/types.ts`
- `tests/coach/browserContract.test.ts`
- `tests/coach/coachSafetyGate.test.ts`
- `tests/coach/continuationFlow.test.ts`
- `tests/coach/liveChainSmoke.test.ts`
- `tests/coach/plainLeak.test.ts`
- `tests/coach/showMoreVisualReveal.test.ts`
- `tests/coach/targetInvariant.test.ts`
- `tests/coach/typeContracts.test.ts`
- `.agent_runs/v2.8.0-intelligent-coach/20260603_145214/command_log.md`
- `.agent_runs/v2.8.0-intelligent-coach/20260603_145214/state.json`
- `.agent_runs/v2.8.0-intelligent-coach/20260603_145214/risk_register.md`

## New Files Created
- `lib/blundr/presentation/modeSurfacePolicy.ts`
- `lib/blundr/presentation/copySurfaceBuilder.ts`
- `lib/blundr/presentation/visualRecipeMapper.ts`
- `lib/blundr/presentation/actionPolicyBuilder.ts`
- `lib/blundr/presentation/surfaceDebug.ts`
- `lib/blundr/presentation/index.ts`
- `tests/coach/visibleTeachingSurface.test.ts`

## Surface Modes Implemented
- `assisted`
- `plain_before_show_more`
- `plain_after_show_more`
- `branch_complete`
- `opponent_replying`
- `terminal`
- `blocked`

## Plain Before Show More Controls
- Uses `safeFrame.plain` copy only.
- Surfaces `show_more` action and suppresses `reveal_target`.
- Returns no move visuals (no move arrow/source/destination highlights).
- Tests verify no SAN/UCI/from/to/piece leakage for Bc4.

## Plain After Show More Controls
- Uses `safeFrame.showMore` copy.
- Target remains aligned with assisted mode target.
- Visual targets are aligned with assisted target visuals.
- May expose `reveal_target` when safe frame permits it.

## Assisted Surface Behavior
- Uses `safeFrame.assisted` copy.
- Maps assisted visual intents from safe frame only.
- Exposes `reveal_target` only when `safeFrame.revealAction.kind === "reveal_target"`.

## Branch Complete Behavior
- Mode resolves to `branch_complete` from frame kind.
- Target is null.
- `continue_from_here` action exposed only when safe frame action kind is `continue_from_here`.
- No move-arrow visual output.

## Null-Target Behavior
- `branch_complete`, `opponent_replying`, and `terminal` surfaces are null-target.
- Opponent/terminal surfaces expose no reveal action and no move visuals.

## Blocked Surface Behavior
- Mode resolves to `blocked` when SafetyGate blocks or original frame is blocked.
- Surface copy/visuals/actions are built from safe fallback frame only.
- No unsafe compiled output path is exposed.

## Tests Added or Updated
- Added: `tests/coach/visibleTeachingSurface.test.ts`
- Updated: `tests/coach/liveChainSmoke.test.ts`
- Updated: `tests/coach/plainLeak.test.ts`
- Updated: `tests/coach/showMoreVisualReveal.test.ts`
- Updated: `tests/coach/targetInvariant.test.ts`
- Updated: `tests/coach/continuationFlow.test.ts`
- Updated: `tests/coach/coachSafetyGate.test.ts`
- Updated: `tests/coach/browserContract.test.ts`
- Updated: `tests/coach/typeContracts.test.ts`

## Commands Run
- `npm run build` (non-escalated pass)
- `npm run build` (escalated rerun pass; sandbox Turbopack port restriction)
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
- Required build and test command set passed.
- `npm test` and `npm run lint` scripts are not present and were documented.

## Product Behavior Changed?
- No intentional UI behavior wiring changes in this package.
- Presentation-layer contracts/builders were implemented with a compatibility path so existing app call sites compile without editing `app/page.tsx`.

## Known Remaining Risks
- App still uses legacy surface fields in `app/page.tsx`; migration to canonical Package 9 surface shape is pending Package 10.
- Legacy presentation test suite under `lib/blundr/presentation/__tests__` remains aligned to the old surface model.

## Handoff Notes for Package 10
- Replace compatibility branch by wiring UI consumption to canonical `VisibleTeachingSurface` (`mode/copy/visuals/actions/safety/provenance/debug`).
- Remove legacy bypass rendering paths once UI reads canonical surface only.
- Preserve invariant that only `SafetyGateOutput.safeFrame` feeds visible teaching output.
