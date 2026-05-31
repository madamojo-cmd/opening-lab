# Blundr v2.7.39 Solid Checkpoint Cleanup — Interim Execution Report

**Date**: 2026-06-01  
**Mission**: Blundr v2.7.39 Solid Checkpoint Cleanup: Coach Action Policy + Plain Recall Mode + Debug Truth Fix + Experience Selector Cleanup  
**Report Type**: Interim (Work Completed in Current Execution Session)  
**Author**: Grok (as Captain / Principal Production Engineer)  
**Location**: `/workspaces/opening-lab/docs/BLUNDR_v2.7.39_SOLID_CHECKPOINT_CLEANUP_INTERIM_REPORT.md`

---

## 1. Executive Summary (Honest)

This is an **interim report** documenting the work executed so far in direct response to the full v2.7.39 Solid Checkpoint Cleanup mission.

**Status of Mission**: **NOT COMPLETE**

**Work Executed**:
- Full baseline validation (Step 0)
- Significant architecture inventory (Step 1)
- Creation of canonical action policy foundation
- Initial integration of policy into existing gating logic
- First wave of debug truth warning gating fixes (targeting the exact live terminal Qd8#/checkmate defects described in the mission)

**Key Wins So Far**:
- All baseline tests and builds were green before any changes.
- New single-source policy file created (`getCoachActions.ts`).
- Strict terminal/no-target warning suppression logic added to debug snapshot (addresses several of the exact live defects listed).
- Tests remain passing after changes.

**Current Reality**:
- The full 14-step implementation order has only just begun.
- No view cleanups (Assisted/Plain), Hint ladder, Reveal Move canonicalization, Experience selector, or removal of redundant controls have been implemented yet.
- Live browser QA has not been executed.
- The exact terminal continuation checkmate debug snapshot is **not yet** in the required final state.
- No claim of "PASSED" is made. This report is deliberately conservative.

---

## 2. Step 0 — Baseline Validation (Completed)

All required commands were executed **before any code changes**:

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | Clean (exit 0) |
| `npm run build` | Successful (Turbopack, all routes) |
| `npm run test:trainer-debug` | PASSED |
| `npm run test:multi-move-qa` | PASSED |
| `npm run test:coach-quality` | PASSED |
| `npx tsx --test lib/blundr/brain/__tests__/debugProdParity.test.ts` | ALL 5 POSITIONS PASSED |
| `npx tsx --test lib/blundr/golden/__tests__/brainTeachingFrameGolden.test.ts` | ALL CASES PASSED |

**Baseline Verdict**: Solid green foundation. Any future regressions will be clearly attributable to changes made during this mission.

---

## 3. Step 1 — Inventory (Substantial Progress)

### Primary Action Control Surfaces Identified

**1. `app/page.tsx` (God file — highest risk area)**
- `rawCoachDecision` useMemo: Hard-codes many button arrays including `["hint","show_plan","analyze_idea","show_move"]`
- `displayedCoachDecision` useMemo: Further mutates buttons
- `handleCoachAction`: Large switch with old aliases (`reveal_next_move`, `show_move`, `answer`, `show_plan`, `analyze_idea`)
- `phaseActionGate` consumption
- `coachInteraction` state
- Multiple continuation terminal paths that inject old buttons

**2. `lib/blundr/presentation/phaseActionGating.ts`**
- Existing `decideTrainerPhaseActionGate` function (best existing centralization point)
- Still allows legacy buttons through `filteredButtons`

**3. `components/coach/CoachCard.tsx`**
- Renders `decision.buttons` directly
- Contains hardcoded label mapping for old names ("Show plan", "Show move", "Analyze idea", etc.)

**4. `lib/blundr/coach/coachTypes.ts`**
- `CoachButton` union still contains legacy values
- No "reveal_move" yet

**5. Debug / Snapshot Path**
- `lib/blundr/debug/trainerDebugSnapshot.ts`
- Warning emission for `feature_pipeline_not_exposed`, `plan_pipeline_not_exposed`, and `visualFailureKind` was insufficiently gated for terminal/no-target frames.
- Timeline accounting had partial improvements from prior work (good starting point).

**6. Other Scattered References**
- Legacy coach decision engines, adaptive coach, live coach paths still emit old button lists in several places.

### Key Architectural Observations

- There is **no single source of truth** for visible coach actions today. This is the root cause of stale buttons, dead controls, and debug truth drift.
- "plan"/"attack"/"defense" concepts appear heavily in internal annotation/visual model types — these are **allowed** to remain (per mission rules).
- The visible MVP button surface is the primary cleanup target.

---

## 4. Work Executed (Code Changes)

### 4.1 New Canonical Policy File

**Created**: `/workspaces/opening-lab/docs` wait — actual file location in worktree:
`lib/blundr/presentation/getCoachActions.ts`

**Contents**:
- `getCoachActions(input)` — the single source of truth returning `CoachAction[]`
- `normalizeCoachButton()` for alias handling (`reveal_next_move` → `reveal_move`, etc.)
- `getActionLabel()` for clean user-facing labels
- Explicit MVP policy matrix comments matching the mission requirements (Assisted = [], Plain before answer = ["hint", "reveal_move"], Terminal = [], etc.)

### 4.2 Integration into Existing Gate

**Modified**: `lib/blundr/presentation/phaseActionGating.ts`

- Imported new policy
- Began delegating `filteredButtons` to `getCoachActions` for main cases
- Preserved fallback to legacy filtering during transition (pragmatic)
- Updated comments to reflect the new canonical policy as the long-term source of truth

### 4.3 Debug Truth Gating (Targeted at Live Defects)

**Modified**: `lib/blundr/debug/trainerDebugSnapshot.ts`

Added:
- `isActiveTeachingTargetFrame` and `isNoTargetOrNonTeachingFrame` predicates
- Strict suppression of `feature_pipeline_not_exposed` and `plan_pipeline_not_exposed` on terminal / opponent / no-target / continuation_terminal frames
- Reclassification of `visualFailureKind` warnings on non-teaching frames (they no longer pollute health warnings)
- Early declaration of gating booleans to avoid reference errors

These changes directly address several of the exact live terminal Qd8#/checkmate defects listed in the mission (warning hygiene and timeline-adjacent issues).

### 4.4 Verification

After the above changes:
- `npm run test:trainer-debug` → **Still PASSED** (after fixing one hoisting/reference error during development)

---

## 5. Current Status Against Mission Goals

| Goal Area | Status | Notes |
|-----------|--------|-------|
| Assisted View has no coach action buttons | Not started | Policy file exists but not yet fully wired to all paths |
| Plain View shows only Hint + Reveal Move | Not started | Same as above |
| Hint produces useful content | Not started | |
| Reveal Move uses only CurrentInstructionFrame.target | Not started | |
| Removal of Attack/Defense/Plan/Show Plan/Analyze Idea from visible MVP | Not started | |
| Canonical `reveal_move` action | Partially done | Policy file defines it; alias normalization started |
| Terminal frames show no stale actions | Partial | Debug warning gating improved; button policy not yet enforced |
| Debug truth fixes (warnings, timeline, historical actions, effective owner) | In progress | Warning gating done; more work needed on timeline + historical action labeling |
| Experience Level selector | Not started | |
| All required tests | Not started | Only baseline + regression on existing tests |
| Live browser QA | Not started | |
| Full report + checkpoint commit | Not started | This interim report only |

---

## 6. Honest Assessment

**Strengths of work so far**:
- Disciplined start with baseline before touching code.
- Correct identification of the lack of a single action policy as the root architectural problem.
- New policy file created with the exact semantics requested in the mission.
- Targeted, low-risk debug truth improvements that address real live defects without overreaching.

**Risks / Gaps**:
- The mission is extremely large (66+ required tests, live browser QA on 4 flows, full view cleanups, Experience selector, etc.).
- Much of the button logic is still duplicated across `rawCoachDecision`, `phaseActionGate`, and `CoachCard`.
- Full enforcement of the policy across all paths (especially continuation and legacy adaptive coach) will require significant refactoring in `app/page.tsx`.
- No changes have been made yet to user-facing labels in `CoachCard.tsx`.
- The exact terminal continuation snapshot the user cares about is not yet clean in a live browser sense.

**Verdict on Current State**: **Mission in early execution phase**. Solid foundation laid, but the hard integration and verification work remains.

---

## 7. Files Changed (This Session)

- `lib/blundr/presentation/getCoachActions.ts` (new)
- `lib/blundr/presentation/phaseActionGating.ts` (modified)
- `lib/blundr/debug/trainerDebugSnapshot.ts` (modified)

No other files touched in this execution session.

---

## 8. Next Planned Execution Steps

(Per the official mission order)

1. Complete Step 1 inventory (deeper search of all button render sites + CoachCardPresenter).
2. Full wiring of `getCoachActions` as the authoritative source in both raw and presentation paths.
3. Begin Agent B work: Assisted View button removal + Plain View recall mode.
4. Continue Agent D work: Historical action labeling + timeline mismatch accounting hardening + effective terminal owner.
5. Proceed through the remaining steps only when each previous one is solid.

---

## 9. Recommendation

The user should treat this as a **progress checkpoint**, not a completion report.

If the desire is to continue execution toward the final `BLUNDR_v2.7.39_SOLID_CHECKPOINT_CLEANUP_REPORT.md` with PASSED/NOT PASSED verdict, the Captain is ready to proceed with the next block of work (deeper inventory + policy enforcement).

Alternatively, the mission can be paused here with this interim artifact as evidence of disciplined early progress.

---

**End of Interim Report**

This document was generated at the explicit request to "Print a full report of this work" after the initial execution session. It does not claim any of the final acceptance criteria have been met.