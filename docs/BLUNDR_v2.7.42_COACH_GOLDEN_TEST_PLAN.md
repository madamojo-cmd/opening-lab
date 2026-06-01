# BLUNDR v2.7.42 Coach Golden Test Plan

**Purpose:** Drive implementation with failing tests first. All implementation must make these tests pass.

## 1. Test Files (to be created in Phase 2)

- `data/goldenCoachPositions.json`
- `tests/coach/goldenCoachPositions.test.ts`
- `tests/coach/targetInvariant.test.ts`
- `tests/coach/plainLeak.test.ts`
- `tests/coach/coachCompiler.test.ts`
- `tests/coach/evidenceGraph.test.ts`
- `tests/coach/showMoreVisualReveal.test.ts`

## 2. Golden Positions (minimum set in `goldenCoachPositions.json`)

Each entry must contain at minimum:
- `id`
- `fen`
- `trainingMode` ("restricted")
- `isUserTurn`: true
- `expectedTargetUci` (the `CurrentInstructionFrame.target`)
- `expectedTargetSan`
- `expectedTargetPieceType`
- `displayMode` ("assisted" | "plain")
- `showMoreClicked` (boolean, for Plain cases)
- `expectedAssistedTitle` / `expectedAssistedBody` (exact strings)
- `expectedPlainHint` (for Plain before Show More)
- `expectedShowMoreTitle` / `expectedShowMoreBody` (must equal Assisted when Show More clicked)

Required cases:
1. Italian e4 (starting position)
2. Italian Nf3
3. Italian Bc4
4. Italian O-O (castling)
5. Italian Re1
6. Ruy Lopez Bb5
7. Queen's Gambit c4
8. Basic capture
9. Basic check
10. Pawn break
11. Plain View no-leak case (before Show More)
12. Show More visual reveal case (after click)
13. Bishop/knight mismatch trap (wrong piece type in target)
14. Branch transition frame
15. Continuation after "Continue from here" click
16. Emergency fallback block (should not be coached)

## 3. Required Assertions (all tests must enforce)

### targetInvariant.test.ts
- `coachMoveUci === instructionTargetUci`
- `visualMoveUci === instructionTargetUci`
- `showMoreTargetUci === instructionTargetUci`
- `coachPieceType === instructionTargetPieceType`
- Zero mismatches on all golden cases

### plainLeak.test.ts
- Before Show More (Plain): no SAN, no UCI, no from-square, no to-square in text or visual intents
- Hint text contains no exact move information
- After Show More: text + visual match Assisted for same target

### showMoreVisualReveal.test.ts (Critical new test per contract)
- Plain View before Show More → no answer arrow / highlight / recipe for the target
- Click Show More
- Board visual recipe exactly equals the Assisted visual recipe for the identical `CurrentInstructionFrame.target`
- `visualMoveUci === instructionTargetUci`
- `showMoreTargetUci === instructionTargetUci`
- No stale continuation candidate or previous-frame visual appears

### coachCompiler.test.ts + evidenceGraph.test.ts
- Compiler output is fully derived from EvidenceGraph + frame.target
- No freeform visible copy
- Piece type in output always matches target piece type
- Strong claims only appear when EvidenceGraph contains supporting claims

### goldenCoachPositions.test.ts
- Runs every position in the JSON through the full pipeline
- Fails on any of the 19 Definition-of-Done violations

## 4. Failure Modes That Must Cause Test Failure

- Target mismatch
- Piece mismatch (bishop coached for knight target, etc.)
- Visual target differs from instruction target
- Show More target differs from instruction target
- Assisted does not lead with exact SAN
- Plain text leaks SAN/UCI/from/to before Show More
- Hint leaks move information
- Show More text does not equal Assisted content for same target
- Show More board visual does not equal Assisted board visual for same target
- Unverified strong claim ("wins", "mate", "only move", etc.) without evidence
- Emergency legal fallback presented as normal coached lesson
- Branch transition frame contains move coach text or move visual target
- Continuation frame before explicit "Continue" click leaks candidate

## 5. Execution Order

1. Write all test files + golden JSON first (they must fail).
2. Implement EvidenceGraph (makes evidence tests start passing).
3. Implement CoachCompiler + templates (makes compiler + golden position tests start passing).
4. Implement SafetyGate (blocks remaining failure modes).
5. Wire into VisibleTeachingSurface / UI (final integration).
6. Run full suite + browser QA.

Tests are the specification. Implementation exists only to satisfy the tests while preserving trainer stability.

---

**Golden test data and assertions take precedence over any internal "nice to have" coach ideas.**