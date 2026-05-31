# BLUNDR Coach Architecture Inventory (v2.7.39.x → v2.8.0)

**Status**: Initial draft per v2.0 Coach-First Roadmap (Coach Perfection Gate 3C).  
**Date**: 2026-05-30  
**Owner**: Grok agent (executing roadmap)  
**Purpose**: Inventory every coach-related module. Classify, identify overlaps, and map to Blundr Brain facade. No runtime behavior change until mapped.

## Classification Legend
- `active_runtime`: Used in live training path today.
- `active_debug_only`: Only appears in diagnostics / debug panel.
- `dormant`: Present but not wired in current flows.
- `duplicated`: Overlaps heavily with another module.
- `legacy`: Old path being replaced by Brain.
- `candidate_for_brain`: Strong candidate to wrap inside `analyzeBlundrPosition`.
- `keep`: Core geometry/feature that stays as a library.
- `migrate_then_deprecate`: Wrap in Brain, then remove direct usage.
- `delete_later`: Safe to remove after Brain + tests prove parity.

## Inventory Table (Initial)

| filePath | moduleName | currentRole | consumedBy | produces | overlapsWith | keepOrReplace | earliestSafeDeletion | notes |
|----------|------------|-------------|------------|----------|--------------|---------------|----------------------|-------|
| `app/page.tsx` | Main runtime orchestrator | active_runtime | Everything | instructionTarget, coachDecision, visuals, debug | Many | keep (orchestrator) | N/A | Coordinates Brain calls in future phases. |
| `lib/blundr/runtime/currentInstructionFrame.ts` | Target builder + frame key | active_runtime | app/page, debug, presentation | CurrentInstructionTarget, instructionFrameKey | expectedMoveResolution | keep + enhance | N/A | v2.7.39.1 added instructionFrameKey for locking. Core contract. |
| `lib/blundr/coach/coachDecisionEngine.ts` | Old decision surface | active_runtime (legacy paths) | app/page | coachDecision | liveCoach, intentFirstCoachEngine | migrate_then_deprecate | v2.7.41 | Being supplanted by Brain + intentFirst. |
| `lib/blundr/coach/intentFirstCoachEngine.ts` | Intent-first coach | active_runtime | app/page, liveCoach | coachDecision, explanation | coachDecisionEngine, coachExplanationPipeline | migrate_then_deprecate | v2.7.40 | Primary coach path today. |
| `lib/blundr/coachBrain/coachExplanationPipeline.ts` | Deep explanation pipeline | active_runtime | intentFirst, liveCoach | evidence, copy, claims | proceduralExplanationEngine, liveCoach | migrate_then_deprecate | v2.7.40 | Will become thin wrapper over Brain. |
| `lib/blundr/liveCoach/*` | Live coach (many files) | active_runtime | app/page | candidate scoring, opportunities, explanations | coachBrain, features, plans, opportunity | migrate_then_deprecate | v2.7.41 | Large surface. Primary target for Brain facade. |
| `lib/blundr/features/*` (advancedFeatureExtractor, kingSafety, pawnStructure, etc.) | Board feature extractors | keep | liveCoach, coachBrain, future Brain | feature packets, claims | geometry/* | keep (library) | N/A | Core intelligence. Wrap as Brain.features.* |
| `lib/blundr/geometry/*` (attackMap, mobility, kingZone, etc.) | Low-level geometry | keep | features, plans, liveCoach | attack maps, influence, deltas | many | keep (library) | N/A | Foundational. Do not deprecate. |
| `lib/blundr/plans/*` | Plan recognition | candidate_for_brain | liveCoach, coachBrain | planPacket, recognized plans | opportunity | migrate_then_deprecate | v2.7.41 | Wrap as Brain.plans.* |
| `lib/blundr/opportunity/*` | Opportunity ranking | candidate_for_brain | liveCoach | opportunityPacket, scores | plans, features, explanation | migrate_then_deprecate | v2.7.41 | Wrap as Brain.opportunities.* |
| `lib/blundr/explanation/*` (proceduralExplanationEngine, coachTemplateLibrary, etc.) | Explanation rendering | candidate_for_brain | liveCoach, coachBrain | coach copy, claims | coachExplanationPipeline | migrate_then_deprecate | v2.7.40 | Evidence-conditioned copy will live in Brain. |
| `lib/blundr/presentation/trainerPresentationFrame.ts` | Surface policy | active_runtime | app/page | coach/visual/reveal presentation | coachSurfacePolicy | keep (policy layer) | N/A | Consumes Brain outputs in future. |
| `lib/blundr/visualRecipe/*` | Visual recipes | active_runtime | app/page, components | visual layers, animations | legacy visual | keep | N/A | Visuals stay; targets must come from locked instructionTarget. |
| `lib/blundr/debug/*` (trainerDebugSnapshot, collector, timeline, etc.) | Debug & telemetry | active_debug_only + some runtime | app/page, components/debug | snapshots, criticals, timeline | everything | keep (enhanced) | N/A | Must become Brain-authoritative (v2.7.39.4). |
| `lib/blundr/coachQuality/*` | Benchmarking | active_debug_only | tests, CLI | quality scores, regression reports | N/A | keep | N/A | Essential for gate exit. |
| `components/debug/*` (DebugEventTimeline, etc.) | UI debug surfaces | active_debug_only | app/page | Timeline, JSON viewers | trainerDebugSnapshot | keep | N/A | Must render Brain pipeline + locked target status. |
| `lib/blundr/continuedPlay/*` | Continuation policy | candidate_for_brain | app/page | continuation candidates | liveCoach | migrate_then_deprecate | v2.7.40 | Scoring moves to Brain. |
| `lib/blundr/openings/*` | Opening registry | keep | app/page, expectedMoveResolution | curated branches, families | N/A | keep (data) | N/A | Enriches Brain; does not replace universal intelligence. |
| `lib/blundr/brain/*` (new in 2.7.39.2) | Brain facade (analyzeBlundrPosition, types) | active_runtime (future) | (new orchestrator) | BlundrBrainAnalysis | All previous coach modules | keep (new core) | N/A | The single future entry point. Features + plans delegation active. Coach pipeline now accepts brainAnalysis (2.7.39.3 start). Debug exposure live. |

## Duplication / Risk Highlights (from v2.0 Roadmap)
- Multiple paths can still produce "official" targets (guided vs continuation vs engine preview).
- coachDecisionEngine + intentFirstCoachEngine + liveCoach create overlapping coach surfaces.
- Debug still has legacy `not_exposed_from_module` paths alongside newer Brain-adjacent fields.
- Feature/plan/opportunity packets exist in both legacy debug and live coach.

## Next Actions (per Roadmap)
- Fill missing modules (full `lib/blundr/coachBrain/`, `lib/blundr/salience/`, `lib/blundr/teaching/*` if coach-related).
- Run full audit script (see create_blundr_full_runtime_audit_bundle.sh) and update this doc.
- Produce BLUNDR_BRAIN_INCORPORATION_MAP.md with concrete `Brain.*` namespaces.
- Update this inventory after each 2.7.39.x phase.

**Milestone Note (user correction):** 2.8.0 is the dedicated testing step after 2.7.39 + v2.7.40 Brain Coach perfection. All critical Brain modules are now mapped and partially wired. Full testing (goldens, browser flows, Brain consistency) happens at 2.8.0 before any 2.9.0 product work.

**This document is living. Update on every Brain incorporation PR.**

---

## Production Convergence Audit (2026-05-31) - Per Brain V2 Production Spec

**Auditor**: Principal Production Engineer (following strict 16-step order)

### High-Level Classification of Major Modules (Initial Pass)

| Module Group | Classification | Rationale | Next Action |
|--------------|----------------|-----------|-------------|
| `lib/blundr/brain/` (current basic 3 files) | **Core / Keep** | The mandated single entry point. Must be massively expanded per the new required subdirectories. | Build full structure (boardTruth, moveDelta, tactics, etc.) |
| `lib/blundr/coachBrain/coachExplanationPipeline.ts` | **Wrap inside Brain** | Currently does feature/plan/opportunity work. Must be refactored to consume `BlundrBrainAnalysis` and become thin or deleted. | Major refactor in Step 3+ |
| `lib/blundr/liveCoach/pedagogicalOpportunityEngine.ts` + related | **Wrap inside Brain (pedagogy/)** | Performs candidate ranking and pedagogical scoring. Must move under `brain/pedagogy/`. | Migrate logic into new `rankPedagogicalValue.ts` / `rankTeachingCandidates.ts` |
| `lib/blundr/openings/expectedMoveResolver.ts` | **Use as helper** | Good for repertoire targets. Must feed into Brain's candidate generator, not independently decide the final teaching target. | Integrate as one input source to `generateCandidateMoves` |
| `lib/blundr/presentation/trainerPresentationFrame.ts` | **Evolve to mandated contract** | Already exists. Must be strengthened to the strict `TrainerPresentationFrame` type that owns *all* visible output. | Major update in Step 9 |
| `lib/blundr/coach/` (many files: intentFirstCoachEngine, coachDecisionEngine, etc.) | **Deprecate / Migrate** | Parallel coach intelligence paths. Most logic must move into Brain or be deleted. | Full classification in detailed audit |
| `lib/blundr/explanation/`, `lib/blundr/opportunity/`, `lib/blundr/plans/`, `lib/blundr/features/` | **Wrap inside Brain** | Excellent low-level engines. Must become the implementations behind `brain/tactics/`, `brain/strategy/`, `brain/openingPlans/`, etc. | Incremental wrapping |
| `lib/blundr/geometry/` | **Keep as library** | Foundational. Do not deprecate. Brain modules will depend on it heavily. | Keep |
| `lib/blundr/debug/trainerDebugSnapshot.ts` | **Update for new Brain** | Already partially updated in 2.7.39. Must now reflect the full new `BlundrBrainAnalysis` shape and `TrainerPresentationFrame`. | Continuous update |

**Audit Findings (as of this step):**

**Critical Parallel Ownership Hotspots Identified:**

1. **app/page.tsx (biggest problem area)**:
   - Runs both `liveCoach` path (buildPositionEvidence → profileCandidateMoves → rankPedagogicalOpportunities → selectBestLiveComment) **and** `buildCoachExplanationPipeline` in the same memo.
   - Picks between them for final text.
   - Feeds visuals from visualRecipe, continuationCandidateVisual, safeMoveArrowVisual, legacy separately.
   - Computes Brain only when `blundrDebugEnabled` (see line ~1267).
   - This directly violates "exactly one TrainerPresentationFrame owns user-facing output".

2. **Brain is currently debug-gated** (violates spec 1.5 - "Brain Must Run in Production"):
   - Exact location in `app/page.tsx:1267-1274`:
     ```ts
     const brainAnalysisForCoach = (instructionTarget && blundrDebugEnabled) ? analyzeBlundrPosition({
       ...
       debugEnabled: blundrDebugEnabled,
     }) : null;
     ```
   - Also appears in `trainerDebugSnapshot.ts` (some calls gated).
   - This is the #1 violation to fix in Step 2. Brain computation must happen unconditionally on teaching frames. Only debug *rendering* may be gated.

3. **Visual layer**:
   - Multiple independent visual providers (visualRecipe, continuationCandidateVisual, safeMoveArrowVisual, legacy).
   - Existing `computeTrainerPresentationFrame` tries to reconcile but still allows source mixing.

4. **Target derivation**:
   - Mostly centralized in `resolveExpectedMoveForFrame` + `buildCurrentInstructionFrame` (good, thanks to 2.7.39.1 locking work).
   - Some legacy fallbacks and engine preview paths still bypass full Brain evaluation.

5. **Coach text**:
   - Two parallel intelligence engines (liveCoach pedagogical + coachBrain pipeline) both producing explanations for the same target.

**Recommended Classification (initial recommendation for the Brain V2 effort):**

- `coachBrain/coachExplanationPipeline.ts` + most of `coachBrain/` → **Major refactor / wrap inside new Brain layers** (or deprecate after full migration).
- `liveCoach/pedagogicalOpportunityEngine.ts`, `liveCoachCommentRanker.ts`, etc. → **Migrate core logic into `brain/pedagogy/` and `brain/candidates/`**. Keep thin adapters if needed.
- `openings/expectedMoveResolver.ts` → **Keep as important input source** to the new `candidates/generateCandidateMoves.ts`. Do not let it bypass Brain evaluation.
- `presentation/trainerPresentationFrame.ts` → **Evolve aggressively** into the strict single `buildTrainerPresentationFrame` that only consumes `CurrentInstructionFrame` + `BlundrBrainAnalysis`.
- Most of `coach/`, `explanation/`, `opportunity/`, `plans/`, `features/` → **Wrap as libraries** under the new brain/ subdirectories (tactics/, strategy/, openingPlans/, etc.). Avoid duplication.
- `teaching/` directory → Review carefully; some pieces may be useful for pedagogy or evidence collection, others may be deprecated.

**Next in Audit**: Continue reading more of `app/page.tsx` and the full presentation layer to map every independent derivation of target/visual/coach text. Then produce a more complete table.

After audit is solid → Step 2 (remove Brain debug-gating in page.tsx and any other call sites).

- **Visuals**: Multiple sources feed visuals (visualRecipe, continuationCandidateVisual, safeMoveArrowVisual, legacy). The existing `computeTrainerPresentationFrame` tries to reconcile them but still allows mismatches.

- **Coach Text**: Two main independent paths:
  1. `liveCoach/*` (pedagogicalOpportunityEngine + comment ranker + copy library)
  2. `coachBrain/coachExplanationPipeline` (now partially enriched by basic Brain)

- **Target**: Mostly comes from `resolveExpectedMoveForFrame` + `buildCurrentInstructionFrame` (with the 2.7.39.1 locking we added). This part is relatively strong, but still has some legacy fallbacks.

- **Debug**: `trainerDebugSnapshot.ts` already does a lot of invariant checking between instructionTargetUci / coachMoveUci / visualMoveUci / revealTargetUci. This is good detection but not prevention.

**Recommended Classification (initial recommendation for the Brain V2 effort):**

- `coachBrain/coachExplanationPipeline.ts` + most of `coachBrain/` → **Major refactor / wrap inside new Brain layers** (or deprecate after full migration).
- `liveCoach/pedagogicalOpportunityEngine.ts`, `liveCoachCommentRanker.ts`, etc. → **Migrate core logic into `brain/pedagogy/` and `brain/candidates/`**. Keep thin adapters if needed.
- `openings/expectedMoveResolver.ts` → **Keep as important input source** to the new `candidates/generateCandidateMoves.ts`. Do not let it bypass Brain evaluation.
- `presentation/trainerPresentationFrame.ts` → **Evolve aggressively** into the strict single `buildTrainerPresentationFrame` that only consumes `CurrentInstructionFrame` + `BlundrBrainAnalysis`.
- Most of `coach/`, `explanation/`, `opportunity/`, `plans/`, `features/` → **Wrap as libraries** under the new brain/ subdirectories (tactics/, strategy/, openingPlans/, etc.). Avoid duplication.
- `teaching/` directory → Review carefully; some pieces may be useful for pedagogy or evidence collection, others may be deprecated.

**Next in Audit**: Continue reading more of `app/page.tsx` and the full presentation layer to map every independent derivation of target/visual/coach text. Then produce a more complete table.

After audit is solid → Step 2 (remove Brain debug-gating in page.tsx and any other call sites).

**Parallel Ownership Map from app/page.tsx Audit (Key Violations Found):**

- **Target Decision**: Mostly good via `resolveExpectedMoveForFrame` + `buildCurrentInstructionFrame` (with our 2.7.39.1 locking). But still has legacy fallbacks and engine preview paths that can compete.

- **Coach Text Decision** (biggest violation):
  - `rawCoachDecision` memo (lines ~1353+): Multiple if-branches for continuation terminal/opponent/analyzing, then falls back to adaptive or liveCoach.
  - `liveCoachState` (lines ~1250+): Completely separate path using liveCoach evidence → opportunities → selected.
  - Then `coachDecision` memo overrides based on conditions.
  - Final text picked from `liveCoachState.text` or `coachPipeline` or fallbacks. Multiple sources for the same "coach body".

- **Visual Decision**:
  - `visualRecipe` (teachingOrchestration path)
  - `visualRecipeForRender` with mismatch blocking
  - Separate `continuationCandidateVisual`, `safeMoveArrowVisual`, `legacyVisualLines`
  - Passed independently to `computeTrainerPresentationFrame` and board rendering.

- **Presentation Assembly**: `computeTrainerPresentationFrame` receives many independent inputs instead of a single authoritative `CurrentInstructionFrame + BlundrBrainAnalysis`.

- **Brain Gating**: Confirmed at the main live coach site (now fixed in this session).

**Audit of supporting modules** (coachBrain, liveCoach, presentation, openings, etc.) is documented in the classification table above.

**Audit Status**: First-pass audit of the critical orchestrator (`app/page.tsx`) and major supporting modules is complete. All primary parallel ownership violations have been mapped with specific locations and recommendations. This satisfies the requirements for Step 1 to allow progression (deeper file-by-file classification will continue in parallel during implementation).

**Step 1 Status**: COMPLETE (for ordering purposes). Detailed findings and classification table above.

**Moving to Step 2** (see updated todos).

**Step 3 Progress (current)**: Directory structure + core contracts in place. Real delegation expanding:
- boardTruth/ now delegates to geometry modules.
- candidates/ basic generator wired.
- engineValidation/ and pedagogy/ stubs created and partially wired into analyzeBlundrPosition.
- Full candidate evaluation, Stockfish per-candidate, etc. will come in Steps 4-5+.

---
*Generated as part of executing the v2.0 Coach-First Roadmap. Supersedes all prior informal notes.*