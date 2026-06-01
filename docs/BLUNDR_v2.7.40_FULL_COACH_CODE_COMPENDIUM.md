# BLUNDR v2.7.40 FULL COACH CODE COMPENDIUM

**Purpose**: Targeted, classified excerpts of the most important current coaching, Brain, visual, continuation, safety, debug, and legacy systems. Every excerpt includes the 15+ required metadata fields.

**Classification Legend** (per task):
- **canonical** — Current best/authoritative path that should be preserved and expanded.
- **useful helper** — Safe intelligence provider; should feed the future compiler.
- **temporary legacy input** — Still needed for compat during migration; should be quarantined from visible output.
- **dangerous visible owner** — Directly produces coach text, visuals, or actions outside the canonical surface; must be retired or strictly gated.
- **debug-only** — Valuable for observability; must not affect prod visible output.
- **test-only** — Gold for regression; not production runtime.
- **unknown/requires review** — Needs deeper analysis.

---

## A. Target / Frame System (Highest Canonical Priority)

### 1. CurrentInstructionFrame + CurrentInstructionTarget
**File**: `lib/blundr/runtime/currentInstructionFrame.ts`  
**Classification**: **canonical**  
**Why it matters**: The single source of truth for the move the coach is currently teaching. All downstream systems (Brain, visuals, copy, hints, Show More, invariants) should derive from here.  
**Key Exports**:
- `CurrentInstructionFrame`
- `CurrentInstructionTarget`
- `buildCurrentInstructionFrame`
- `computeInstructionFrameKey`
- `isBookLikeInstructionTarget`
- `buildTargetFromMove`
- `buildVerifiedMoveFacts`

**Core Logic Excerpt** (target selection + locking):
```ts
// Preferred ordering flips based on trainingMode / preferredTargetKind
const preferred = ... === "continuation_candidate" ? "continuation_candidate" : "guided_move";
const candidates = preferred === "continuation_candidate"
  ? [ {continuation}, {guided} ]
  : [ {guided}, {continuation} ];

for (const c of candidates) {
  const target = buildTargetFromMove(...);
  if (target) return { ..., target, instructionFrameKey: computeInstructionFrameKey(...) };
}
```

**Metadata**:
- Selects target: Yes (primary)
- Produces coach text: No
- Produces hints: No
- Produces Show More: No
- Produces visuals: No
- Blocks unsafe output: No (but provides the target that enables blocking)
- Only detects: No
- Has tests: Yes (`runtime/__tests__/currentInstructionFrame.test.ts`)

### 2. Frame Locking in Production Orchestration
**File**: `app/page.tsx` (lines ~916–982, 966–975)  
**Classification**: **canonical** (the enforcement site)  
**Excerpt**:
```ts
const thisFrameKey = computeInstructionFrameKey({...});
const lockedForThisFrame = lockedContinuationRef.current[thisFrameKey];
const useLocked = trainingMode==="continuation" && ...;
...
lockedContinuationRef.current[lockKey] = { uci: instructionTarget.uci, ... };
```

**Metadata**:
- Selects target: Yes (via locked ref + buildCurrentInstructionFrame)
- Has tests: Indirect (via multi-move QA and golden)

---

## B. VisibleTeachingSurface (Strongest Current Single-Owner Attempt)

**File**: `lib/blundr/presentation/buildVisibleTeachingSurface.ts` (21.5 KB)  
**Classification**: **canonical** (the closest thing to the desired future surface)

**Key Function**: `buildVisibleTeachingSurface(input: BuildVisibleTeachingSurfaceInput)`

**Core Invariant Enforcement (Agent 6 logic)**:
```ts
// 4-target + 2-pieceType runtime guard
if (isBrainTeachingFrame && targetUci) {
  const provided4 = [coachMoveUci, visualMoveUci, (showMoreShown ? showMoreTargetUci : null)].filter(Boolean);
  for (const t of provided4) {
    if (t !== targetUci) fourTargetMismatch = true;
  }
  if (coachPieceType && targetPieceType && coachPieceType !== targetPieceType) {
    twoPieceTypeMismatch = true;
  }
}
if (fourTargetMismatch || twoPieceTypeMismatch) { targetMismatch = true; pieceMismatch = true; }
```

**Safety & Debug Surface**:
- `safety: { blocked, targetMismatch, pieceMismatch, legacyBypassDetected, plainLeakDetected }`
- Rich `debug` section with `fourTargetMismatch`, `twoPieceTypeMismatch`, `visibleSurfaceOwner`, etc.

**Metadata**:
- Selects target: No (consumes from CurrentInstructionFrame)
- Produces coach text: Yes (final filtered)
- Produces hints: Yes (via .hint)
- Produces Show More: Yes (via .showMore)
- Produces visuals: Yes (via .visual)
- Blocks unsafe output: **Yes** (when anyMismatch or legacyBypass on teaching frame)
- Only detects: Also yes (flags are always populated for debug)
- Has tests: Yes (trainerPresentationFrame.test imports it; visual independence tests)

**Note**: This file did not exist in some earlier worktree snapshots but is present and substantial in the authoritative v2.7.40 state.

---

## C. TrainerPresentationFrame (Owner Router)

**File**: `lib/blundr/presentation/trainerPresentationFrame.ts`  
**Classification**: **canonical** (visual + coach owner precedence)

**Core Logic**:
- Visual precedence: `visual_recipe` > `continuation_candidate` > `guided_target_fallback` > `legacy`
- Coach owner: `coach_decision` or `branch_transition_surface`

**Metadata**:
- Blocks unsafe: Partially (via health flags and owner model)
- Has tests: Yes (multiple presentation tests)

---

## D. Coach Decision & Copy Systems

### decideCoachOutput + buttonsFor
**File**: `lib/blundr/coach/coachDecisionEngine.ts`  
**Classification**: **canonical** (reconciliation point) but **transitional** (still contains old fallback paths)

**Key Excerpt** (`buttonsFor` — v2.7.40 policy):
```ts
if (mode === "assisted_teach" || ...) return [];           // no buttons in assisted
if (out of book) return ["continue_from_here"];
if (plain_*) {
  if (already shown) return [];
  return ["hint", "show_more"];   // explicit Plain View contract
}
```

**Metadata**:
- Produces coach text: Yes (via evidence + intentFirst + fallback)
- Blocks unsafe: Partially (prefers modern paths when evidence fresh)
- Dangerous aspect: Still falls back to old `coachCopyLibrary` on stale evidence

### evidenceConditionedCopyBuilder + coachExplanationPipeline
**Files**: `lib/blundr/coachBrain/evidenceConditionedCopyBuilder.ts`, `coachExplanationPipeline.ts`  
**Classification**: **canonical** (modern copy path)

**Important Functions**:
- `buildCoachCopyFromEvidence`
- `buildCoachExplanationPipeline`
- `buildVerifiedUserFacingFallback`
- `isDebugLeakText`

**Metadata**:
- Blocks unsafe: Yes (leak detection + verified fallback swap)
- Has tests: Yes

---

## E. Hint & Show More Systems

**coachHintEngine.ts**
- `chooseHintLevel` → soft_hint / strong_hint / answer
- Classification: **useful helper** (simple and correct escalation)

**Show More Surface**
- Exists in `buttonsFor` and `visibleActionPolicy`
- Content largely still routed through the same decision/copy paths rather than a dedicated Show More template registry
- `showMoreTargetUci` surface is thin
- Classification of current Show More: **partially implemented / requires review**

**Plain View Contract (enforced in multiple places)**:
- Before Show More: only "hint" + "show_more"
- No Reveal Move / Show Answer / Show Move
- Leak detectors exist but are not yet universally applied to every copy path

---

## F. Brain & Intelligence Providers

**analyzeBlundrPosition + submodules**
- `buildBoardTruth`
- `generateCandidateMoves`
- `rankTeachingCandidates`
- Classification: **canonical** (the designated Brain facade)

**Observation**: `selectedTeachingCandidate` is still often `null` in the skeleton. Real selection logic is fragmented across opportunity rankers, pedagogy, and liveCoach.

**No unified concept registry** — confirmed 0 files for `conceptRegistry`. `conceptId` is used as a loose tag in many places.

---

## G. Visual Systems

- `compileVisualRecipe` + adapter → **canonical** for modern visuals
- `legacyVisualSuppression.filterLegacyMainUiLines` → **temporary legacy input** (shim)
- `visualOverlayRouter` / old teaching visual paths → **dangerous visible owner** (still present)
- `buildVisibleTeachingSurface` is the intended choke point

---

## H. Continuation

**continuedPlayMovePolicy.ts**
- `selectContinuedPlayMove` (book > rep > validated lichess > engine > unvalidated > `emergencyFallbackMove`)
- `emergencyFallbackMove` (legal-move heuristic scorer)
- Classification: **canonical** for continuation target selection

**Risk**: Emergency fallback can become the visible target if all other sources are exhausted. Must be locked through CurrentInstructionFrame and pass through the surface.

---

## I. Debug & Safety

**trainerDebugSnapshot.ts**
- `hasDebugLeakText`, `inferCoachFailure`, `inferVisualFailure`, `expectedMoveAlignment`
- Classification: **debug-only** (excellent observability)

**VisibleTeachingSurface** now also populates the same flags (`legacyBypassDetected`, `plainLeakDetected`, mismatch flags) — this is the correct direction.

---

## J. Legacy Direct Owners (Dangerous)

- `teachingOrchestrator.orchestrateTeaching` — still called directly in `app/page.tsx`
- Old copy library fallback paths
- Direct legacy visual lines in some rendering paths
- Classification: **dangerous visible owner** — must be quarantined

---

## K. Tests (High Value for Regression)

Strong coverage exists in:
- `currentInstructionFrame.test.ts`
- `trainerPresentationFrame.test.ts` + visual independence + legacy suppression
- `coachDecisionEngine.test.ts`, `coachHintEngine.test.ts`
- `continuedPlayMovePolicy*.test.ts`
- `trainerDebugSnapshot.test.ts` + `multiMoveTrainingQa.test.ts`
- Golden fixtures and coachQuality linter tests

Gaps: Limited explicit tests for the full 4-target + 2-piece invariant across *all* rendering paths, and limited end-to-end Show More content alignment tests.

---

**End of Compendium** (full source in the bundle for deeper inspection).