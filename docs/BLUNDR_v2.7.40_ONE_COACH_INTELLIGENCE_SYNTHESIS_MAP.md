# BLUNDR v2.7.40 ONE COACH INTELLIGENCE SYNTHESIS MAP

**Purpose**: Evidence-based analysis of how the current fragmented coaching systems could be unified into **one comprehensive intelligent Blundr Coach**. No implementation. No final architecture decisions. Pure synthesis for the team.

---

## 1. Current Fragmented Coach Map (What Actually Exists Today)

The current system has multiple parallel coach/intelligence paths that can all influence visible output:

- **adaptiveCoachDecision** (`coachDecisionEngine` + `intentFirstCoachEngine` + `evidenceConditionedCopyBuilder` + old `coachCopyLibrary` fallback)
- **liveCoachState** (`positionEvidenceBuilder` → `pedagogicalOpportunityEngine` → `liveCoachCommentRanker` → `buildCoachExplanationPipeline` (with Brain) → `pickLiveCoachCopy` + leak guards)
- **displayedCoachDecision** — reconciliation layer in `app/page.tsx`
- **TrainerPresentationFrame** — owner routing (visual + coach)
- **buildVisibleTeachingSurface** — the strongest current attempt at a single visible owner + invariant enforcement (exists and substantial in current v2.7.40)
- **CoachCard** + `visibleActionPolicy` — final button filtering (good canonical contract)
- **BlundrBrain** (`analyzeBlundrPosition` facade + submodules) — designated intelligence provider, still skeleton in places
- **visualRecipe** system — primary modern visual path
- **debug/safety tools** (`trainerDebugSnapshot`, surface safety flags, linters) — excellent detection, not always blocking

**Core Problem**: Multiple paths can still produce coach text, hints, Show More content, and visuals. The desired "CurrentInstructionFrame.target → ... → one BlundrCoachCompiler → surface → UI" does not yet exist as the exclusive flow.

---

## 2. Proposed One-Coach Architecture (For Analysis Only)

```
CurrentInstructionFrame.target (single source of truth + lock)
        ↓
Evidence / Helper Providers (board truth, candidates, plans, salience, features, openings, continuation, mistake, utterance memory, etc.)
        ↓
Concept / Teaching Intent Selection (selected teaching concept for the frame)
        ↓
BlundrCoachCompiler (one place that produces:
  - assisted title/body
  - progressive hints (1-3)
  - Show More full content
  - visual intents
  - required evidence + safety rules)
        ↓
Blocker / Safety Gate (VisibleTeachingSurface or dedicated gate)
        ↓
TrainerPresentationFrame (owner + health)
        ↓
VisibleTeachingSurface (final single owner + 4-target + 2-piece invariant + plain hygiene + legacy bypass blocking)
        ↓
UI (CoachCard via visibleActionPolicy + Visual layers)
```

This is **not** a decision. It is a synthesis of what the existing code + blocker history + desired invariants are pointing toward.

---

## 3. Evidence Provider Registry (What Can Be Reused)

Many high-quality intelligence modules already exist and are safe to preserve as **providers** (they should not produce visible output directly):

- `buildBoardTruth`
- Candidate generation + pedagogy ranking
- `planRecognitionEngine`
- Salience / feature extractors (king safety, pawn structure, tactical motifs, etc.)
- Opening / book evidence (expected move resolvers, branch coverage)
- Mistake diagnosis fragments
- Continuation policy (`selectContinuedPlayMove` + sources)
- Utterance memory + variation policy
- Engine validation stubs (when they have provenance)

**Recommendation**: These become a clean "Evidence Provider" layer that the future compiler queries. They should not own coach text or visuals.

---

## 4. Concept Registry Analysis (Critical Gap)

**Does a real concept registry exist?**

**Answer: No.**

- `conceptRegistry`: **0 files**
- `teachingConcept`: 12 files (scattered references)
- `conceptId`: 72 files (used as a loose tag or key in many places)
- `conceptTemplate`, `visualIntent`: small numbers
- No `hintTemplate` or `showMoreTemplate` dedicated registry
- No single place that defines, for a concept:
  - required/optional/forbidden evidence
  - progressive hint templates (non-leaking)
  - Show More full content
  - assisted copy variations
  - visual intents
  - safety rules

**What exists instead**: Concept-*like* fragments scattered across `coachCopyLibrary`, explanation templates, opportunity layers, teaching cue types, and `selectedTeachingConcept` fields passed around in page.tsx and the surface.

**Conclusion**: The project has the *need* for a concept registry and some raw material, but not a canonical one. This is the single largest missing piece for a "one comprehensive intelligent coach."

---

## 5. Proposed Canonical Concept Definition (For Analysis)

A future registry entry could look like:

```ts
interface TeachingConcept {
  id: string;
  label: string;
  family: string; // development, center, king_safety, tactic, etc.

  requiredEvidence: string[];
  optionalEvidence: string[];
  forbiddenEvidence: string[];

  priority: number;

  // Progressive, non-leaking hints (Plain View)
  hint1?: Template[];   // broad concept only
  hint2?: Template[];   // piece / category / purpose (safe)
  hint3?: Template[];   // directional / plan (safe)

  // Full content
  assistedTitle: Template[];
  assistedBody: Template[];
  showMoreTitle: Template[];
  showMoreBody: Template[];

  visualIntents: VisualIntent[];

  safetyRules: SafetyRule[];
  copyVariationRules: VariationRule[];
}
```

All templates would be backed by evidence IDs. The compiler would fill them only with verified evidence for the current `CurrentInstructionFrame.target`.

---

## 6–8. How Hint, Show More, and Visuals Should Integrate (Synthesis)

- **Hints** must come from the selected teaching concept for the current target.
  - Hint 1 = broad concept
  - Hint 2/3 = increasing specificity *without* SAN/UCI/direct squares/"Play X"
  - Show More is the user-initiated action that reveals the full assisted content from the same concept.

- **Show More** must be explicitly tied to `showMoreTargetUci` (or fall back safely) and must pass the 4-target invariant in the surface.

- **Visuals** (via visualRecipe) must be driven by the selected concept's visual intents + the canonical target. Plain View before Show More must not emit answer arrows.

All three must flow through `VisibleTeachingSurface` (or an equivalent final gate) so the invariant can be enforced uniformly.

---

## 9–10. How Copy Variation and Blockers Integrate

- Existing `coachVariationPolicy` + `utteranceMemory` are useful helpers for wording variation (not fact variation).
- Every sentence emitted must be traceable to evidence.
- Safety linters (`boardClaimValidator`, `explanationSafetyLinter`, surface safety) must run after template filling.

**Blockers are not historical documents.** They become:
- Runtime guards inside the compiler and/or `VisibleTeachingSurface`
- Required test gates before any compiler work
- Debug observability requirements

---

## 11. Recommended Migration Direction (Not a Plan)

1. Preserve all high-quality evidence/helper modules.
2. Quarantine or strictly gate every dangerous direct visible owner (`orchestrateTeaching` direct call, old copy fallbacks on teaching frames, legacy visual paths).
3. Create or promote a real `TeachingConcept` registry (this is the highest-leverage new work).
4. Create `BlundrCoachCompiler` as the single place that turns (target + selected concept + evidence) into (hints, Show More, assisted copy, visual intents).
5. Make `buildVisibleTeachingSurface` (or its successor) the mandatory choke point for all visible teaching output on Brain teaching frames.
6. Expand the 4-target + 2-piece invariant + plain hygiene checks to 100% coverage.
7. Retire direct `adaptiveCoachDecision` / `liveCoachState` rendering for teaching frames.
8. Expand golden + multi-move + browser QA to cover the invariant and Plain/Show More contract on every position.

---

## 12. Explicit Answers to the Required Questions

**Is a single comprehensive coach feasible from current work?**

Yes. The raw material (Brain facade, excellent evidence modules, `buildVisibleTeachingSurface` with invariant logic, good policy for buttons, leak detectors, continuation policy, debug observability) is substantial. The main missing piece is a canonical concept registry + making the surface the *exclusive* path.

**Which current code is most valuable?**
- `buildVisibleTeachingSurface` (already does what the project wants)
- `currentInstructionFrame` + locking
- `analyzeBlundrPosition` + submodules as evidence providers
- `visibleActionPolicy`
- `continuedPlayMovePolicy`
- All the feature/geometry/salience/plan/opportunity modules
- Debug snapshot + safety linters

**Which current code is most dangerous?**
- Direct `orchestrateTeaching` call in production
- Old copy library fallback on teaching frames
- Any path that can emit coach text / visuals / hints / Show More without going through the surface on a Brain teaching frame
- Thin adoption of `showMoreTargetUci`

**What is missing?**
- Canonical concept registry (biggest gap)
- Universal flow through a single compiler + surface
- Complete 4-target + 2-piece invariant coverage across *all* rendering paths
- Show More as a first-class, target-aligned, non-leaking construct with dedicated templates

**What must be done before implementation?**
- Complete the concept registry analysis and initial design
- Make `VisibleTeachingSurface` the mandatory owner (quarantine legacy direct paths)
- Expand tests and browser QA to cover the full invariant matrix + Plain/Show More contract
- Decide (as a team) the exact contract between the future compiler and the surface

---

**This synthesis is evidence only.** It is intended to give the team a clear picture of what currently exists, what is strong, what is risky, and what is missing — so the design of the one comprehensive intelligent coach can be done with eyes open.

**End of One-Coach Intelligence Synthesis Map**