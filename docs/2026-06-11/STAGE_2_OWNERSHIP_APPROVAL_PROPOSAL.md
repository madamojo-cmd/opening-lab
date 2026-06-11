# Stage 2 Ownership Approval Proposal (Phase A.5)
Date: 2026-06-11
Inputs:
- `STAGE_2_LEGACY_MODULE_INVENTORY.md`
- `STAGE_2_IMPORT_RUNTIME_GRAPH.md`
- `STAGE_2_OWNERSHIP_DECISION_MATRIX_DRAFT.md`
- `STAGE_2_CONSOLIDATION_READINESS_REPORT.md`

Decision scale:
- `APPROVE_NOW`
- `APPROVE_WITH_GUARDRAIL_TEST`
- `DEFER`
- `WRAP_LATER`
- `QUARANTINE_LATER`
- `DELETE_LATER_AFTER_IMPORT_PROOF`

## Proposal Table
| Responsibility | Proposed classification | Proposed owner/candidate | Rationale | Guardrail/dependency |
|---|---|---|---|---|
| target authority | APPROVE_NOW | `runtime/currentInstructionFrame.ts` | Active runtime chain owner, heavily tested, no crawl/copy dependency | Keep existing target invariant tests enforced |
| visible teaching surface | APPROVE_WITH_GUARDRAIL_TEST | `presentation/buildVisibleTeachingSurface.ts` (+ live wrapper) | Active chain owner but legacy direct UI feeders still present | Add/lock no-legacy-visible-bypass guardrail before Phase B |
| Plain View no-leak policy | APPROVE_WITH_GUARDRAIL_TEST | `safety/plainLeakPolicy.ts` + surface mode policy | Existing policy modules + tests, but legacy copy paths overlap | Strengthen plain-leak tests against legacy branches |
| Assisted View policy | APPROVE_WITH_GUARDRAIL_TEST | `presentation/buildVisibleTeachingSurface.ts` | Correct runtime path appears in use, overlap still present | Guardrail for assisted source parity |
| Show More parity | APPROVE_WITH_GUARDRAIL_TEST | `presentation/buildVisibleTeachingSurface.ts` + `coachCompiler/revealActionBuilder.ts` | Existing behavior is tested but multiple feeders still exist | Guardrail test for assisted/show-more target/copy/visual parity |
| board-truth move facts | APPROVE_WITH_GUARDRAIL_TEST | `brain/providers/boardTruthProvider.ts` | Candidate is in active graph path, but overlaps with legacy moveFact extractors | Guardrail to enforce approved fact boundary only |
| evidence graph | APPROVE_NOW | `brain/buildEvidenceGraph.ts` | Active chain stage in live surface build, strong test presence | Keep evidence graph test suite in baseline |
| feature extraction | DEFER | Multiple (brain providers vs legacy features) | Derived feature scope overlaps and not Phase A/B target | Defer until definitions/fixtures approved |
| tactical motif detection | DEFER | `brain/providers/tacticalMotifProvider.ts` (candidate) | Derived intelligence domain | Defer |
| strategic feature detection | DEFER | `brain/providers/strategicFeatureProvider.ts` (candidate) | Derived intelligence domain | Defer |
| opening registry | APPROVE_WITH_GUARDRAIL_TEST | `openings/openingTree.ts` | Runtime-active, but registry ownership not yet fully consolidated | Guardrail for single runtime owner and schema stability |
| opening plan recognition | DEFER | `plans/planRecognitionEngine.ts` + registry | Derived planning intelligence and overlap with legacy ranking | Defer |
| concept registry | APPROVE_NOW | `concepts/teachingConceptRegistry.ts` | Active in concept activation chain, tested, no crawl dependency | Keep concept registry tests in baseline |
| concept activation | APPROVE_NOW | `concepts/dynamicConceptActivator.ts` | Active chain stage, tested, no crawl dependency | Keep dynamic activator tests in baseline |
| ranking/opportunity selection | WRAP_LATER | legacy rankers (`liveCoach/*`, `opportunity/*`, `coach/*`) | Multiple runtime-active ranking paths still overlap | Wrap/route through approved chain later |
| coach copy source | WRAP_LATER | surface copy path candidate, legacy copy modules still active | Direct overlap among liveCoach/coachBrain/explanation/presentation copy paths | Wrap legacy copy sources before Phase B code touches copy |
| claim validation | APPROVE_WITH_GUARDRAIL_TEST | `safety/coachSafetyGate.ts` (+ compiler copy policy) | Active chain gate, but validator overlap exists | Guardrail tests for claim-validation ownership |
| visual intent / visual recipe | WRAP_LATER | compiler+presentation path candidate | Legacy visualRecipe compiler/adapter also runtime-active in page | Wrap later; do not redesign in Phase B |
| debug readiness packet | APPROVE_NOW | `debug/trainerDebugSnapshot.ts` | Active debug owner; baseline repaired and tests pass | Keep trainer-debug suite green |
| crawl bundle validation | DEFER | none yet | Not Phase A.5 implementation; no validator in scope | Defer to Phase C planning/Phase B allowed minimal code only after approval |
| copy bundle validation | DEFER | none yet | Not Phase A.5 implementation | Defer to Phase C planning/Phase B allowed minimal code only after approval |

## Legacy Cleanup Signals
- `QUARANTINE_LATER`: legacy copy/ranking/visual modules that overlap approved runtime chain and must be barred from new Stage 2 work.
- `DELETE_LATER_AFTER_IMPORT_PROOF`: currently orphan-candidate modules listed in `STAGE_2_IMPORT_RUNTIME_GRAPH.md` require separate proof before deletion.

## Non-Approval Intentional Deferrals
Kept deferred by design:
- Derived feature extraction expansion
- Tactical/strategic intelligence
- Plan recognition redesign
- Concept ranking redesign
- Final copy generation
- Visual recipe generation redesign
- Crawl/copy integration/consumption

## Recommendation
Proceed only to `READY_FOR_USER_APPROVAL` checkpoint state, not direct Phase B start.
