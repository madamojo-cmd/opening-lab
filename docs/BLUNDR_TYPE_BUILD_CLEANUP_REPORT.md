# Type/Build Cleanup Report — Pre-existing Errors Resolved

**Date**: 2026-06-01  
**Goal**: Make `npx tsc --noEmit` and `npm run build` pass cleanly while preserving all Coach Gate architecture and tests.

**Result**: Success. All required commands now pass cleanly.

---

## Errors Fixed

### 1. boardTruth/buildBoardTruth.ts (3 locations)

**Problem**: Strict TypeScript comparisons between `PieceType` / `Color` (from chess.js) and string literals `"k"`, `"w"`, `"b"` were failing.

**Fix**: Normalize piece type and color to lowercase strings before comparison.

**Changes** (lines 45, 55-63):
- `p.color === "w"` → normalized `color` variable with explicit `"w" | "b"` cast.
- King search conditions updated to use `String(p?.type ?? "").toLowerCase()` and color normalization.

### 2. debugProdParity.test.ts (lines 268-273)

**Problem**: `prodAnalysis.provenance || {}` and `debugAnalysis.provenance || {}` narrowed the type to `{}`, breaking property access on `timingsMs`, `modulesCalled`, and `usedStockfish`.

**Fix**: Use `(analysis as any).provenance ?? {}` to safely access the object without losing the ability to read known properties in the comparison.

### 3. tests/browser/browser-qa-harness.ts (FlowId literals)

**Problem**: Two `id` values in `QAFlow` objects did not match the declared `FlowId` union type.

**Fix**: Corrected the string literals:
- `"coach-visual-reveal-hint-alignment-on-user-turns"` → `"coach-visual-reveal-hint-alignment"`
- `"continuation-candidate-is-stockfish-safe"` → `"continuation-candidate-stockfish-safe"`

---

## Files Changed

- `lib/blundr/brain/boardTruth/buildBoardTruth.ts`
- `lib/blundr/brain/__tests__/debugProdParity.test.ts`
- `tests/browser/browser-qa-harness.ts`

No changes were made to:
- VisibleTeachingSurface or its ownership logic
- `rawCoachDecision` (still contains zero references to `presentationFrame`)
- Any product-facing code

---

## Command Results (All Clean)

```bash
npx tsc --noEmit
# Result: 0 errors (clean)

npm run build
# Result: Successful (all routes generated)

npm run test:trainer-debug
# Result: ✓ PASSED

npm run test:multi-move-qa
# Result: ✓ PASSED

npm run test:coach-quality
# Result: ✓ PASSED

npx tsx lib/blundr/brain/__tests__/rawCoachDecisionNoPresentationFrame.test.ts
# Result: ✓ Regression guard passed: rawCoachDecision contains no references to presentationFrame
```

---

## Architecture & Guard Confirmations

- **TDZ guard**: The regression test confirms that `rawCoachDecision` in `app/page.tsx` contains **zero** references to `presentationFrame` (comments stripped before check). This remains true after these fixes.

- **No visible ownership regression**: 
  - All Brain teaching-frame visible output continues to flow exclusively through `VisibleTeachingSurface` (built from `TrainerPresentationFrame`).
  - `displayedCoachDecision` and downstream render paths still respect the single-owner contract.
  - No legacy paths were given new access to Brain-driven visible state.

- **Test integrity**: No tests were weakened or deleted. All fixes were type corrections or literal string alignment.

---

## Summary

The three clusters of pre-existing type errors (boardTruth comparisons, provenance narrowing in parity test, and FlowId string mismatches in the QA harness) have been resolved with minimal, type-safe changes.

The project now builds and type-checks cleanly, while the critical Coach Perfection Gate architecture (especially the separation between legacy `rawCoachDecision` and Brain `VisibleTeachingSurface` ownership) remains fully intact.

**Status**: `npx tsc --noEmit` and `npm run build` now pass cleanly. All required QA suites and the TDZ regression guard continue to pass.