# Agent 2 Report: Core Contracts and Type System

## Scope
Package 2 created and consolidated contract/type modules for runtime authority, evidence graphing, compiler output, safety output, presentation surface, and provider evidence contracts (Stockfish/Maia/opening knowledge), plus shape/contract tests and run artifacts. This package was audit-and-contract only and did not implement coach behavior or UI bypass fixes.

## Package 1 Risks Consumed
- Legacy bypass and multi-owner UI paths in `app/page.tsx` were treated as migration targets, not fixed here.
- `TrainerPresentationFrame` type drift and legacy-owner divergence were treated as contract hardening inputs.
- Distributed provider authority concerns were encoded by introducing provider-as-evidence-only contracts.
- Unresolved legacy visual component exposure was documented and left unchanged.

## Files Inspected
- `docs/BLUNDR_v2.8.0_BASELINE_FREEZE_REPORT.md`
- `docs/BLUNDR_v2.8.0 Foundation Stabilization Gate_AGENT_1_AUTHORITY_AUDIT_REPORT.md`
- `docs/BLUNDR_v2.8.0 Foundation Stabilization Gate_AGENT_1_LEGACY_BYPASS_MAP.md`
- `.agent_runs/v2.8.0-intelligent-coach/20260603_130120/state.json`
- `.agent_runs/v2.8.0-intelligent-coach/20260603_130120/risk_register.md`
- Existing runtime and presentation files under `lib/blundr/` required for compatibility.

## Files Changed
- `lib/blundr/runtime/currentInstructionFrame.ts`
- `lib/blundr/runtime/continuationRuntimeState.ts`
- `lib/blundr/brain/types.ts`

## New Files Created
- `lib/blundr/runtime/currentInstructionTarget.ts`
- `lib/blundr/runtime/instructionFrameLock.ts`
- `lib/blundr/coachCompiler/types.ts`
- `lib/blundr/safety/types.ts`
- `lib/blundr/presentation/types.ts`
- `lib/blundr/engine/engineTypes.ts`
- `lib/blundr/engine/mockEngineProvider.ts`
- `lib/blundr/maia/maiaTypes.ts`
- `lib/blundr/maia/mockMaiaProvider.ts`
- `lib/blundr/knowledge/openingKnowledgeTypes.ts`
- `tests/coach/typeContracts.test.ts`

## Contracts Added
- Runtime authority contracts: `CurrentInstructionTarget`, `CurrentInstructionFrame`, debug issue taxonomy, frame/mode/source enums, lock contract.
- Evidence contracts: `EvidenceGraph`, `CoachEvidenceClaim`, provenance and claim strength/source taxonomies.
- Provider evidence contracts:
  - `StockfishTop10GateResult`
  - `MaiaContinuationContext`
  - `OpeningKnowledgeContext` / `OpeningKnowledgeItem`
- Compiler contracts: `TeachingConcept`, `VisualIntent`, `RevealAction`, `CompiledCoachFrame`, grounded phrasing input/output.
- Safety contracts: `CoachSafetyIssueCode`, `CoachSafetyIssue`, `CoachSafetyResult`.
- Presentation contracts: `VisualRecipe`, `VisibleActionPolicy`, `VisibleTeachingSurface`.

## Helpers Added
- Runtime helper exports in `currentInstructionFrame.ts`:
  - `isUserTurnTeachingFrame`
  - `isGuidedTeachingFrame`
  - `isContinuationTeachingFrame`
  - `getInstructionTargetOrNull`
  - `assertLockedInstructionTarget`
  - `getFrameTargetSignature`
- Lock helpers in `instructionFrameLock.ts`:
  - `createInstructionFrameLock`
  - `validateInstructionFrameLock`
  - `isLockedInstructionTarget`
- Continuation authority helper:
  - `buildContinuationRuntimeAuthorityState`

## Mock Providers Added
- `createMockStockfishTop10GateResult(...)` with deterministic agreement-to-permission mapping.
- `createMockMaiaContinuationContext(...)` returning `not_applicable` unless explicitly continuation-scoped.

## Tests Added
- `tests/coach/typeContracts.test.ts` covers:
  - Guided vs opponent/terminal frame target modeling.
  - `assertLockedInstructionTarget` null-target throw behavior.
  - Stockfish mock permission matrix for required agreement states.
  - Maia mock `not_applicable` behavior outside continuation.
  - Opening knowledge `not_found` representation.
  - Safe fallback `VisibleTeachingSurface` shape with null target.
  - `CompiledCoachFrame` shape requirements.

## Commands Run
- Step A inspection commands (branch/status/find/grep).
- `npm run build` (initial failure, then pass after compatibility/type import fixes).
- `node --import tsx tests/coach/typeContracts.test.ts` (pass).
- `npm run lint` (script not present).
- Final verification commands:
  - `git status --short`
  - `git diff --stat`

## Results
- Package 2 contracts and mocks were created successfully.
- Build passes.
- Contract test passes.
- Lint command unavailable due missing script.

## Product Behavior Changed?
No intentional product behavior changes were implemented. Changes are contract/type-system scaffolding, compatibility-safe runtime typing, and test/report artifacts.

## Known Remaining Risks
- Canonical chain is not yet wired end-to-end in product runtime.
- Legacy bypass paths documented in Package 1 remain unresolved by design in this package.
- Parallel type definitions still exist in legacy modules and need later consolidation.
- `CurrentInstructionTarget.color` remains compatibility-biased (`ChessColor`) with optional normalized `blundrColor`; full convergence deferred.

## Handoff Notes for Package 3
- Use these contracts as the source of truth when beginning implementation wiring.
- Prefer adapting existing builders to emit `EvidenceGraph` and `CompiledCoachFrame` shapes before changing UI behavior.
- Consolidate parallel surface/safety type definitions during wiring, not in isolation.
- Continue respecting Package 1 unresolved bypass map as active migration checklist.
