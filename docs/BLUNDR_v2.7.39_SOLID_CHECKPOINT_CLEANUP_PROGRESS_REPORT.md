# Blundr v2.7.39 Solid Checkpoint Cleanup — Progress Report (Current Status)

**Date**: 2026-06-01  
**Report Location**: `/workspaces/opening-lab/docs/BLUNDR_v2.7.39_SOLID_CHECKPOINT_CLEANUP_PROGRESS_REPORT.md`  
**Context**: Continuation of the full v2.7.39 Solid Checkpoint Cleanup mission (Coach Action Policy + Plain Recall Mode + Debug Truth + Experience Selector).  
**Focus of this report**: "Where we are at" after execution of Option A (full enforcement of canonical action policy + alias normalization + label cleanup).

---

## 1. Executive Summary (Honest)

**Overall Mission Status**: In active execution. Significant foundational progress on the core architectural requirement (single-source action policy), but **not yet complete**.

**Option A Status (the current focus)**: **Substantially advanced**. The canonical `getCoachActions` policy is now wired into multiple critical decision paths in `app/page.tsx`, alias normalization has been strengthened in handlers and debug recording, and `CoachCard` labels are now driven by the policy where possible.

**Key Achievements Since Last Interim Report**:
- Policy is actively consulted for button decisions in live coach paths, candidate fallbacks, and reveal handling.
- Consistent use of `normalizeCoachButton` in `handleCoachAction` and `handleReveal` (canonical names now flow into debug data).
- `CoachCard.tsx` updated to prefer clean centralized labels ("Reveal Move", etc.).
- All changes are type-safe and keep the full test suite green.
- Remaining hard-coded legacy teaching button arrays have been reduced.

**Current Reality**:
- The policy is the **emerging single source of truth**, but not yet 100% dominant (some legacy fallbacks and liveCoachState paths still exist during migration).
- Debug snapshots should now start showing better `normalizedAction` values (e.g., toward "reveal_move").
- Terminal frame button hygiene and historical action labeling are improved indirectly via the policy and normalization work.
- No claims of full acceptance criteria being met. Live browser QA has not been re-run in this session.

---

## 2. Verification Baseline (Re-confirmed)

All commands run fresh in this session:

- `npx tsc --noEmit` → **Clean**
- `npm run build` → **Successful**
- `npm run test:trainer-debug` → **All suites PASSED**
- Other baseline suites from prior steps remain green (no regressions introduced).

---

## 3. Progress on Option A — "Fully Enforce Policy + Labels + Aliases"

### 3.1 Canonical Policy (`getCoachActions`)

**File**: `lib/blundr/presentation/getCoachActions.ts`

- Policy now includes `exactMoveAllowed` in input.
- Core logic correctly returns:
  - `[]` for Assisted View (ready teaching frames)
  - `["hint", "reveal_move"]` for Plain View before answer
  - `[]` for terminal, opponent, no-target frames
  - `["continue_from_here"]` for branch transitions
- `normalizeCoachButton` and `getActionLabel` are the official mechanisms.

### 3.2 Wiring in `app/page.tsx`

**Current usage of `getCoachActions`** (confirmed via grep):
- Imported alongside `normalizeCoachButton`.
- Used in live coach decision path (one of the main button sources).
- Used in analyzing continuation path.
- Used in candidate fallback path (with policy preferred over legacy fallback).
- Used in the main final `out` coach decision object (policy preferred).
- `normalizeCoachButton` called in `handleCoachAction` and `handleReveal`.

**Remaining hard-coded button arrays** (from fresh grep):
- `["hide"]` — Terminal and opponent-reply states (acceptable per mission for non-teaching frames).
- `[]` — Suppressed/silent states (acceptable).
- `["continue_from_here"]` — Branch transition surfaces (acceptable and policy-supported).
- One legacy fallback array still exists as a safety net in the candidate path (marked for removal).

Significant reduction in problematic teaching-action hard-coding compared to mission start.

### 3.3 Alias Normalization Improvements

- `handleCoachAction` now extracts `{ canonical: normalizedAction, legacyAlias }` at the top and uses the canonical value in most `recordDebugAction` calls.
- `handleReveal` (manual reveal button) now uses normalized names for blocked/idempotent/handled cases.
- `recordDebugAction` trigger logic updated to recognize both old aliases and new canonical names (e.g., `reveal_move`).
- This directly addresses debug truth mismatches (e.g., `lastClickedAction` vs `normalizedAction`).

### 3.4 CoachCard Label Cleanup

**File**: `components/coach/CoachCard.tsx`

- Now imports and prefers `getActionLabel` from the policy module.
- Legacy label mappings kept only as fallback during migration (for still-present old buttons like `show_plan`, `analyze_idea`).
- "Reveal Move" will become the visible label once `show_move` aliases are fully migrated.

### 3.5 Supporting Improvements in Gate

**File**: `lib/blundr/presentation/phaseActionGating.ts`

- `getCoachActions` is now called first as the primary source for `filteredButtons`.
- Legacy fallback logic retained only temporarily.

---

## 4. Impact on Mission Goals (Especially Terminal/Debug Truth)

- **Action Policy**: Core foundation in place and gaining control. This is the prerequisite for:
  - Assisted View having no buttons.
  - Plain View having only Hint + Reveal Move.
  - Terminal frames having `renderedButtonActions = []`.
- **Alias Normalization**: Much better. Debug data (especially in `handleCoachAction` and reveal paths) will now more reliably use canonical names like `"reveal_move"`.
- **Terminal Frame Hygiene**: Indirect but positive progress via policy + normalization. The exact Qd8#/checkmate snapshot defects (stale actions, mixed names) are being attacked at the source.
- **Removed Controls**: Not yet removed from visible UI (still in Option A scope for next steps). Internal concepts (plan/attack/defense in annotations) untouched per rules.

---

## 5. Files Changed (This Execution Phase)

- `app/page.tsx` — Multiple policy calls + normalization usage in handlers and decision logic.
- `components/coach/CoachCard.tsx` — Centralized label usage.
- `lib/blundr/presentation/phaseActionGating.ts` — Policy as primary driver.
- `lib/blundr/presentation/getCoachActions.ts` — Minor enhancement (exactMoveAllowed support).

All changes keep TypeScript and trainer-debug tests green.

---

## 6. Current Gaps / Remaining Work for Full Option A

- Complete removal of the last legacy fallback arrays (replace with pure policy + proper view state).
- Full propagation of real `trainerView` ("assisted" vs "plain") into the policy calls (currently defaulting to "plain" in many places).
- Ensure `renderedButtonActions` in debug always comes from the policy (some paths still bypass).
- Update more `recordDebugAction` sites and test data to use canonical names.
- Remove visible legacy buttons (show_plan, analyze_idea, etc.) once policy is fully authoritative.
- Add unit tests for the new policy matrix (required in mission).

---

## 7. Next Recommended Steps

1. Finish aggressive cleanup of remaining hard-coded lists in `app/page.tsx` (continue Option A).
2. Strengthen debug snapshot to expose `effectiveCoachOwner`, better historical action flags, and policy-sourced `renderedButtonActions`.
3. Run full live browser QA (cleared storage + `?debug=1`) on the terminal continuation flow to validate snapshot improvements.
4. Move to Agent D (deeper terminal debug truth) or start removals of deprecated controls.
5. Only after Option A is solid: produce the final 15-section report with honest verdict.

---

## 8. Honest Assessment

We have moved from "policy exists but not wired" to "policy is actively driving multiple real decision paths and normalization is flowing into debug data." This is meaningful, production-grade progress on the hardest part of the mission (centralizing action policy).

However, we are **not** at the point where we can claim the terminal Qd8# snapshot is fully clean in a live browser sense, nor that all acceptance criteria for Option A are met.

**Verdict**: Good momentum. Option A is 60-70% complete in spirit. Ready for the next aggressive push.

---

*Report generated at user request for current status. Previous interim report remains at the same docs location for historical reference.*