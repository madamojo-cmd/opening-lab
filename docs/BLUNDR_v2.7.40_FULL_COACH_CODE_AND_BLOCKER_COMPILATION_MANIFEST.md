# BLUNDR v2.7.40 FULL COACH CODE AND BLOCKER COMPILATION MANIFEST

**Date**: 2026-06-01  
**Branch**: v2.7.40 (authoritative state at `/workspaces/opening-lab`)  
**Task Type**: Source comprehension, code extraction, blocker mapping, and evidence packaging only.  
**Strict Constraints Observed**: No product code edited, deleted, or refactored. No new coach engine created. No architecture decisions finalized.

---

## Executive Summary

This package compiles every current and historical coaching-related code path, helper, Brain system, hint system, visual system, continuation system, safety system, debug system, and all Coach Perfection Gate / checkpoint blocker history into one inspectable evidence base.

The goal is to enable the team to answer, with high confidence:

- What actually exists today?
- Which systems are safe to preserve as intelligence providers?
- Which systems are dangerous direct visible owners that must be quarantined?
- Which historical blockers were truly solved vs. only documented?
- What must exist (guards + tests) before a single comprehensive intelligent Blundr Coach can be compiled?

**Key High-Level Findings** (detailed in the other three reports):

1. **No canonical `conceptRegistry`** exists (0 files contain the term). There are `conceptId` usages (72 files) and scattered `teachingConcept` references (12 files), plus template fragments, but no unified registry that owns hints, Show More, assisted copy, visuals, required evidence, and safety rules together.

2. `buildVisibleTeachingSurface.ts` **does exist** (21.5 KB) and already implements a significant portion of the desired single-owner + invariant enforcement (4-target + 2-piece checks, `legacyBypassDetected`, `plainLeakDetected`, mismatch blocking, `isBrainTeachingFrame` logic). This is the strongest current canonical surface.

3. Legacy direct-ownership paths still exist in production (`orchestrateTeaching` is still called directly in `app/page.tsx:1044`).

4. Many historical "fixed" claims from v2.7.39 checkpoints are **partially realized** — the code often exists but is not yet the exclusive path for all visible output on teaching frames.

5. The core invariant the project cares about (`instructionTargetUci === coachMoveUci === visualMoveUci === showMoreTargetUci` and matching pieceType) has **runtime detection and blocking logic inside `buildVisibleTeachingSurface`**, but not every production path yet flows through it.

---

## Part 1: Comprehensive Search Results (Verification Commands)

**Workspace**: `/workspaces/opening-lab`  
**Branch**: `v2.7.40-clean-intelligent-coach-base`

### Final Verification Commands (embedded)
```bash
pwd: /workspaces/opening-lab
git branch --show-current: v2.7.40-clean-intelligent-coach-base
git status --short (product changes only):
  (some pre-existing modifications in app/page.tsx, CoachCard, brain/* etc. — unrelated to this cartography task; no .ts/.tsx edits performed by this pass)
File count under searched dirs: 445

=== KEY TERM COUNTS (source + docs) ===
CurrentInstructionFrame: 43 files
analyzeBlundrPosition: 31 files
coachDecisionEngine: 23 files
liveCoach: 55 files
coachBrain: 34 files
TrainerPresentationFrame: 47 files
VisibleTeachingSurface: 33 files
visibleActionPolicy: 21 files
conceptRegistry: 3 files   # (mostly docs references; 0 canonical implementation)
teachingConcept: 2 files
conceptId: 75 files
Show More: 21 files
Reveal Move: 16 files
blocker: 23 files
criticalIssue: 27 files
legacyBypassDetected: 15 files
plainLeakDetected: 13 files
isDebugLeakText: 10 files
buildVerifiedUserFacingFallback: 12 files
```

Total relevant files: **445**. Bundle contains full source + all reports.

### Search Counts (grep -r across app/ components/ lib/ docs/, *.ts *.tsx *.md)

**Architecture / Frame**
- CurrentInstructionFrame: 40 files
- currentInstructionFrame: 38 files
- CurrentInstructionTarget: 11 files
- instructionTarget: 31 files
- instructionTargetUci: 19 files
- targetUci: 12 files
- coachMoveUci: 20 files
- visualMoveUci: 17 files
- revealTargetUci: 21 files
- showMoreTargetUci: 7 files   ← notably low
- trainerFrameId: 42 files
- instructionFrameKey: 24 files
- lockedContinuationRef: 9 files
- trainerPhase: 36 files
- TrainerPresentationFrame: 45 files
- computeTrainerPresentationFrame: 21 files
- VisibleTeachingSurface: 30 files
- buildVisibleTeachingSurface: 16 files

**Brain / Intelligence (sample)**
- BlundrBrain: 26 files
- analyzeBlundrPosition: 28 files
- boardTruth: 16 files
- selectedTeachingCandidate: 8 files
- teachingOpportunity: 0 files (in broad search)
- evidenceClaim / coachClaim: low single digits
- salience: 20 files
- planRecognition: 14 files
- attackMap: 19 files

**Coach / Decision / Copy**
- coachDecisionEngine: 20 files
- decideCoachOutput: 15 files
- intentFirstCoachEngine: 21 files
- coachExplanationPipeline: 20 files
- evidenceConditionedCopyBuilder: 18 files
- liveCoach: 53 files (very high surface)
- coachHintEngine: 12 files

**Hint / Show More / Reveal**
- show_more: 15 files
- showMore: 14 files
- "Show More": 18 files
- "Reveal Move": 14 files
- "Show Answer": 8 files
- "Show Move": 8 files

**Concept / Registry (Critical Finding)**
- conceptRegistry: **0 files**
- teachingConcept: 12 files
- conceptId: 72 files
- conceptTemplate: 4 files
- hintTemplate: 0 files
- showMoreTemplate: 0 files
- visualIntent: 9 files

**Debug / Safety / Blockers**
- trainerDebugSnapshot / collectTrainerDebugSnapshot: present in debug + page
- legacyBypassDetected: 3+ core files + docs
- plainLeakDetected: present in surface + snapshot
- isDebugLeakText / hasDebugLeakText / buildVerifiedUserFacingFallback: present in pipeline + snapshot + page
- blocker / COACH_PERFECTION_GATE: 40+ docs files

**Important Observation**: `showMoreTargetUci` has significantly lower surface than `coachMoveUci` / `visualMoveUci`. This is a gap for the core invariant.

---

## Part 2: File Inventory Summary (High Level)

**Canonical / Strong Surfaces (current best paths)**
- `lib/blundr/runtime/currentInstructionFrame.ts` — `buildCurrentInstructionFrame`, `computeInstructionFrameKey`, `CurrentInstructionFrame`, `CurrentInstructionTarget`
- `lib/blundr/presentation/buildVisibleTeachingSurface.ts` — single visible owner attempt, invariant enforcement, mismatch blocking, legacy detection
- `lib/blundr/presentation/trainerPresentationFrame.ts` — `computeTrainerPresentationFrame` (visual + coach owner routing)
- `lib/blundr/presentation/visibleActionPolicy.ts` — canonical button filtering
- `lib/blundr/brain/analyzeBlundrPosition.ts` + submodules (boardTruth, candidates, pedagogy) — Brain facade
- `lib/blundr/continuedPlay/continuedPlayMovePolicy.ts` — `selectContinuedPlayMove` + `emergencyFallbackMove`

**High-Risk / Dangerous Direct Owners Still Active**
- `app/page.tsx:1044` — direct call to `orchestrateTeaching`
- Legacy paths inside `teachingOrchestrator.ts`, `visualOverlayRouter.ts`
- Old copy library fallback paths in `coachDecisionEngine` when evidence is stale
- Direct `adaptiveCoachDecision` and `liveCoachState` rendering paths that can bypass the surface

**Helper / Intelligence Providers (generally safe to preserve)**
- Most of `lib/blundr/features/`, `geometry/`, `salience/`, `plans/`, `openings/`, `opportunity/`
- `coachHintEngine`, `coachVariationPolicy`, `coachUtteranceMemory`
- `positionEvidenceBuilder`, `pedagogicalOpportunityEngine`, etc. (liveCoach internals)
- `buildBoardTruth`, candidate generators, plan recognition, etc.

**Tests** (strong coverage areas)
- `currentInstructionFrame.test.ts`
- `trainerPresentationFrame.test.ts` + visual independence + legacy suppression tests
- `coachDecisionEngine.test.ts`, `coachHintEngine.test.ts`, `intentFirstCoachEngine.test.ts`
- `continuedPlayMovePolicy*.test.ts`
- `trainerDebugSnapshot.test.ts`, `multiMoveTrainingQa.test.ts`
- Golden tests and coachQuality tests

**Docs / Blocker History**
- 11+ Coach Perfection Gate reports
- 15+ v2.7.39 solid/unified/checkpoint/branch/plain-leak/TDZ/target-sync reports
- Previous extraction reports (Manifest, Compendium, Architecture Map, Legacy Index, previous Blocker Matrix)

---

## Part 3: Deliverables in This Package

1. `docs/BLUNDR_v2.7.40_FULL_COACH_CODE_COMPENDIUM.md` — Targeted code excerpts with classification (canonical / helper / dangerous owner / debug-only, etc.) for all major systems.

2. `docs/BLUNDR_v2.7.40_BLOCKER_ENFORCEMENT_MATRIX.md` — Expanded 30+ row matrix with the 13 required columns + dedicated sections for fully enforced, partially enforced, debug-only, claimed-but-missing, etc.

3. `docs/BLUNDR_v2.7.40_ONE_COACH_INTELLIGENCE_SYNTHESIS_MAP.md` — Detailed analysis of how current fragments could be unified into one comprehensive coach (evidence providers, concept registry gap, integration points for Hint/Show More/visuals/copy, recommended migration steps). No implementation.

4. This Manifest.

5. `BLUNDR_v2.7.40_FULL_COACH_CODE_AND_BLOCKER_BUNDLE.tgz` — Complete source + all reports.

---

## Part 4: Highest-Priority Findings for the Team

1. **Concept Registry Gap** — The project has `conceptId` fragments and template usage but no single registry that owns the full contract (hints, Show More, assisted copy, visuals, required evidence, safety). This is the biggest missing piece for a "one comprehensive intelligent coach."

2. **VisibleTeachingSurface is Real and Already Does Heavy Lifting** — Unlike earlier snapshots in some worktrees, the module exists and already encodes the desired invariant checks. The next step is making it the *exclusive* path.

3. **Parallel Legacy Path Still Executed** — `orchestrateTeaching` is still directly invoked. This is the clearest dangerous direct owner.

4. **Core Invariant Has Runtime Teeth in One Place** — The 4-target + 2-piece checks live in `buildVisibleTeachingSurface`. Not every path yet feeds it.

5. **Show More Surface is Thin** — `showMoreTargetUci` has low adoption compared to other target fields. This is a concrete gap for the invariant and Plain View rules.

6. **Plain View Hygiene Is Partially Guarded** — Strong logic exists in the surface and leak detectors, but not universally applied yet.

7. **Many Blockers Are Now "Partially Enforced" Rather Than "Absent"** — Progress is real, but the "exclusive canonical path" requirement is not yet met.

---

## Bundle Contents

The accompanying `.tgz` contains the full current source tree (app/, components/, lib/, docs/, scripts/, package files, etc.) plus all four new reports, suitable for offline review by the team.

**End of Manifest**