# TDZ Fix Report: rawCoachDecision / presentationFrame ReferenceError

**Date**: 2026-06-01  
**Issue**: Runtime `ReferenceError: Cannot access 'presentationFrame' before initialization` inside `rawCoachDecision` useMemo.

---

## Root Cause
In `app/page.tsx`, the `rawCoachDecision` useMemo (declared early) contained this block (approximately lines 1442–1465):

```ts
// Blocker 2 / Step 1: When Brain is active, bypass legacy liveCoachState entirely for coach decision
if (brainAnalysisForCoach && presentationFrame.coach.shouldRender) {
  return {
    ...
    title: presentationFrame.coach.title ?? "Lesson",
    body: presentationFrame.coach.body ?? "",
    buttons: (presentationFrame.coach.buttons as CoachButton[]) ?? [],
    ...
    coachMoveUci: presentationFrame.revealTargetUci ?? instructionTarget?.uci ?? null,
    ...
  };
}
```

`presentationFrame` is defined much later (around line 1717) via `useMemo(() => computeTrainerPresentationFrame(...))`.

This created a Temporal Dead Zone (TDZ) violation when the condition was evaluated.

Additionally, this violated the architecture: legacy `rawCoachDecision` must never depend on or participate in Brain teaching-frame visible output.

---

## Fix Applied

**Removed the entire offending block** from inside the `rawCoachDecision` useMemo.

**Replacement** (added strong architectural guard comment instead):

```ts
    }
    // IMPORTANT ARCHITECTURAL GUARD (Blockers 2+3):
    // rawCoachDecision is a legacy helper/evidence path only.
    // It MUST NEVER reference presentationFrame, visibleTeachingSurface,
    // or any Brain-driven visible output for teaching frames.
    // Brain teaching-frame visible ownership is exclusively handled later in
    // displayedCoachDecision (via VisibleTeachingSurface built from TrainerPresentationFrame).
    // This prevents TDZ errors and maintains the correct ownership chain.

    if(liveCoachState){
```

No other references to `presentationFrame` existed inside the `rawCoachDecision` useMemo.

---

## Why the TDZ Error Is Fixed
- The only code path that read `presentationFrame` inside `rawCoachDecision` has been deleted.
- The regression test (`lib/blundr/brain/__tests__/rawCoachDecisionNoPresentationFrame.test.ts`) now statically confirms that the `rawCoachDecision` definition contains no references to `presentationFrame` (comments are stripped before the check).
- The test passes cleanly.

---

## No Visible Ownership Regression
- Brain teaching-frame visible output continues to be handled exclusively in `displayedCoachDecision` (lines ~1781–1819), which correctly depends on `presentationFrame` / `visibleTeachingSurface` after it is defined.
- `rawCoachDecision` now remains a pure legacy helper path and does not participate in visible output for Brain teaching frames when `brainAnalysisForCoach` is active.
- The ownership chain remains intact:
  `CurrentInstructionFrame + BlundrBrainAnalysis → TrainerPresentationFrame → VisibleTeachingSurface → UI`

---

## Regression Guard Added
New file: `lib/blundr/brain/__tests__/rawCoachDecisionNoPresentationFrame.test.ts`

This test:
- Locates the `rawCoachDecision` useMemo definition in `app/page.tsx`.
- Strips comments.
- Asserts that the string `"presentationFrame"` does not appear in the remaining code.
- Serves as a permanent static guard against re-introducing the architectural violation.

---

## Command Results

```bash
# Regression guard
npx tsx lib/blundr/brain/__tests__/rawCoachDecisionNoPresentationFrame.test.ts
✓ Regression guard passed: rawCoachDecision contains no references to presentationFrame

# TypeScript
npx tsc --noEmit
# Pre-existing type errors remain in unrelated files (boardTruth, browser-qa-harness, debugProdParity).
# No new errors introduced by this fix.

# Core QA suites (all passing)
npm run test:trainer-debug   → ✓ PASSED
npm run test:multi-move-qa   → ✓ PASSED
npm run test:coach-quality   → ✓ PASSED

# Build
npm run build
# Exited with code 1 due to pre-existing type errors (not caused by this change).
# The TDZ runtime error is resolved.
```

---

## Summary

- The TDZ error is eliminated.
- The architectural invariant is restored and guarded.
- Brain teaching-frame visible ownership remains correctly downstream through `VisibleTeachingSurface`.
- No product features or unrelated modules were modified.
- Core runtime QA suites continue to pass.

**Status**: The specific runtime ReferenceError reported by the user is fixed. Pre-existing type issues in the broader codebase prevent a fully clean `tsc`/`build`, but those are unrelated to this change.