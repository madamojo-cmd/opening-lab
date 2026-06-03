# Agent 5 Report: Deterministic EvidenceGraph

## Scope
Implemented a deterministic EvidenceGraph pipeline that converts a locked `CurrentInstructionFrame` into machine-readable, provenance-backed evidence without generating visible coach copy.

## Package 4 Runtime Authority Consumed
- `CurrentInstructionFrame.target` treated as sole target authority.
- Frame null-target states handled explicitly (no target-specific evidence).
- Runtime lock helpers reused for deterministic test-frame construction.

## Files Inspected
- Agent 1 authority audit + legacy bypass map
- Agent 2 core contracts report
- Agent 3 ground-truth harness report
- Agent 4 current instruction frame report
- Latest state/risk from Package 4 run
- Existing brain/runtime/test structure and chess-rule usage in repo

## Files Changed
- `lib/blundr/brain/types.ts`
- `lib/blundr/brain/index.ts`
- `lib/blundr/brain/boardTruth/buildBoardTruth.ts`
- `lib/blundr/brain/buildEvidenceGraph.ts`
- `lib/blundr/brain/providers/boardTruthProvider.ts`
- `lib/blundr/brain/providers/moveSemanticsProvider.ts`
- `lib/blundr/brain/providers/tacticalMotifProvider.ts`
- `lib/blundr/brain/providers/strategicFeatureProvider.ts`
- `lib/blundr/brain/providers/openingContextProvider.ts`
- `lib/blundr/brain/providers/visualEvidenceProvider.ts`
- `lib/blundr/brain/providers/providerHealth.ts`
- `tests/coach/evidenceGraph.test.ts` (new)
- `tests/coach/goldenPositions.test.ts`
- `tests/coach/antiHallucination.test.ts`
- `tests/coach/providerFailure.test.ts`

## New Files Created
- `lib/blundr/brain/buildEvidenceGraph.ts`
- `lib/blundr/brain/providers/boardTruthProvider.ts`
- `lib/blundr/brain/providers/moveSemanticsProvider.ts`
- `lib/blundr/brain/providers/tacticalMotifProvider.ts`
- `lib/blundr/brain/providers/strategicFeatureProvider.ts`
- `lib/blundr/brain/providers/openingContextProvider.ts`
- `lib/blundr/brain/providers/visualEvidenceProvider.ts`
- `lib/blundr/brain/providers/providerHealth.ts`
- `tests/coach/evidenceGraph.test.ts`

## Providers Added
- `boardTruthProvider` (chess.js-backed deterministic legality/fact extraction)
- `moveSemanticsProvider`
- `tacticalMotifProvider`
- `strategicFeatureProvider`
- `openingContextProvider`
- `visualEvidenceProvider`
- `providerHealth`

## Evidence Categories Supported
- Board truth legality and move facts
- Opening context metadata (non-authoritative)
- Move semantics (development, center, capture/check/castle, pawn/activation)
- Tactical motif candidates (conservative, downgrade/block when uncertain)
- Strategic feature candidates (center/king safety/activity/pressure heuristics)
- Visual evidence claims (arrow/highlights/conditional pressure/king-safety/line-control)

## Claims Added
Deterministic, machine-readable `CoachEvidenceClaim` objects with:
- `id`, `frameKey`, `type`, `strength`, `targetUci`
- `machineFacts`
- provenance source/confidence metadata

## Tests Added or Updated
- Added: `tests/coach/evidenceGraph.test.ts`
- Updated:
  - `tests/coach/goldenPositions.test.ts`
  - `tests/coach/antiHallucination.test.ts`
  - `tests/coach/providerFailure.test.ts`

## Commands Run
- Step A inspection commands from package instructions
- `npm run build` (initial type mismatch fix, then pass)
- Required targeted tests via `node --import tsx`:
  - `evidenceGraph.test.ts`
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
- Build: pass
- All required targeted tests: pass
- `npm test`/`npm run lint` scripts remain unavailable and were documented.

## Product Behavior Changed?
No intentional visible product behavior/UI change. Added deterministic evidence infrastructure and tests only.

## Known Remaining Risks
- Tactical/strategic motif detection is conservative and partial by design in this package.
- External providers (Stockfish/Maia/opening knowledge) remain `not_applicable` in provider status for this phase.
- EvidenceGraph integration into compiler/safety/presentation chain is pending Package 6+.

## Handoff Notes for Package 6
- Build compiler/safety layers against EvidenceGraph claims without bypassing frame target authority.
- Preserve deterministic graph behavior and blocked/probable downgrade semantics.
- Keep provider target ownership forbidden while integrating evidence enrichment.
