# Agent 6 Report: Teaching Concept Registry + Dynamic Concept Activator

## Scope
Implemented deterministic concept contracts, a 130-concept teaching registry, concept safety helpers, and an EvidenceGraph-only dynamic concept activator. Added package tests for registry validity, activation behavior, and safety regression checks.

## Package 5 EvidenceGraph Consumed
- `buildEvidenceGraph` output is the sole activation input.
- Claim strength, type, provenance, and target were consumed for concept eligibility.
- Null-target frame states were handled via safe continuation/fallback concept rules.

## Files Inspected
- `docs/BLUNDR_v2.8.0 Foundation Stabilization Gate_AGENT_1_AUTHORITY_AUDIT_REPORT.md`
- `docs/BLUNDR_v2.8.0 Foundation Stabilization Gate_AGENT_1_LEGACY_BYPASS_MAP.md`
- `docs/BLUNDR_v2.8.0 Foundation Stabilization Gate_AGENT_2_CORE_CONTRACTS_REPORT.md`
- `docs/BLUNDR_v2.8.0 Foundation Stabilization Gate_AGENT_3_GROUND_TRUTH_TEST_HARNESS_REPORT.md`
- `docs/BLUNDR_v2.8.0 Foundation Stabilization Gate_AGENT_4_CURRENT_INSTRUCTION_FRAME_REPORT.md`
- `docs/BLUNDR_v2.8.0 Foundation Stabilization Gate_AGENT_5_DETERMINISTIC_EVIDENCE_GRAPH_REPORT.md`
- `.agent_runs/v2.8.0-intelligent-coach/20260603_133951/state.json`
- `.agent_runs/v2.8.0-intelligent-coach/20260603_133951/risk_register.md`
- `lib/blundr/brain/buildEvidenceGraph.ts` and provider files
- Existing `tests/coach/*` package 2-5 suite files

## Files Changed
- `lib/blundr/concepts/TeachingConcept.ts`
- `lib/blundr/concepts/conceptFamilies.ts`
- `lib/blundr/concepts/conceptSafety.ts`
- `lib/blundr/concepts/dynamicConceptActivator.ts`
- `lib/blundr/concepts/index.ts`
- `lib/blundr/concepts/teachingConceptRegistry.ts`
- `tests/coach/teachingConceptRegistry.test.ts`
- `tests/coach/dynamicConceptActivator.test.ts`
- `tests/coach/antiHallucination.test.ts`
- `tests/coach/plainLeak.test.ts`
- `tests/coach/evidenceGraph.test.ts`

## New Files Created
- `lib/blundr/concepts/TeachingConcept.ts`
- `lib/blundr/concepts/conceptFamilies.ts`
- `lib/blundr/concepts/conceptSafety.ts`
- `lib/blundr/concepts/dynamicConceptActivator.ts`
- `lib/blundr/concepts/index.ts`
- `lib/blundr/concepts/teachingConceptRegistry.ts`
- `tests/coach/teachingConceptRegistry.test.ts`
- `tests/coach/dynamicConceptActivator.test.ts`

## Concept Count
- `130` concepts in `teachingConceptRegistry`.

## Concept Families Covered
- `opening_principle`
- `development`
- `center`
- `king_safety`
- `tactics`
- `piece_activity`
- `pawn_structure`
- `space`
- `defense`
- `opening_specific`
- `mistake_pattern`
- `continuation`
- `visual_pattern`
- `safety_fallback`

## Dynamic Activator Behavior
- Reads only `EvidenceGraph` (claims, board truth, opening context, target).
- Enforces required claim types + minimum strength.
- Enforces piece-type and move-flag requirements.
- Suppresses engine-required concepts when engine evidence is absent.
- Suppresses leak-risk concepts in `plain` mode.
- Allows only safe continuation/fallback concepts when `graph.targetUci` is null.
- Sorts by strength, overclaim risk, mode relevance, family priority, and opening-theme relevance.

## Safety Rules Implemented
- Strong/high-risk concepts require verified evidence.
- `forbiddenWithoutEvidence` enforced via activation gating.
- High leak plain templates reject target-slot leakage.
- Engine-required concepts blocked without explicit stockfish/maia provenance.
- Claim usage constrained by claim type, strength, and piece alignment.

## Tests Added or Updated
- Added:
  - `tests/coach/teachingConceptRegistry.test.ts`
  - `tests/coach/dynamicConceptActivator.test.ts`
- Updated:
  - `tests/coach/antiHallucination.test.ts`
  - `tests/coach/plainLeak.test.ts`
  - `tests/coach/evidenceGraph.test.ts`

## Commands Run
- Step A inspection commands from package prompt.
- `npm run build` (sandbox failed with Turbopack OS permission; escalated rerun passed).
- Required targeted test commands via `node --import tsx`:
  - `teachingConceptRegistry.test.ts`
  - `dynamicConceptActivator.test.ts`
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
- `npm test` and `npm run lint` checked and still missing in package scripts.

## Results
- Build: pass (after escalated rerun).
- Required targeted tests: pass.
- Registry validation: pass (`130` concepts, unique IDs, required metadata).

## Product Behavior Changed?
No intentional product/UI behavior change. This package adds deterministic concept contracts, activation logic, and tests only.

## Known Remaining Risks
- Opening-specific concept activation currently depends on coarse opening context tags/keys and will need richer opening-evidence integration in later packages.
- Engine-gated concepts are deliberately suppressed until real engine evidence wiring is added.
- Legacy UI bypass paths from Agent 1 remain unresolved by design in this package.

## Handoff Notes for Package 7
- Wire `DynamicConceptActivator` output into compiler contracts without bypassing `CurrentInstructionFrame.target` authority.
- Preserve strict suppression for engine-gated and high-risk tactical concepts until provider evidence is fully wired.
- Keep plain-mode anti-leak constraints intact when generating visible coach copy.
