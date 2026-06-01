# BLUNDR v2.7.42 Coach Deployment Contract

**Status:** Locked for deterministic coach deployment phase.  
**Branch:** v2.7.42-coach-deployment-lock  
**Date:** 2026-06-01  
**Predecessor:** v2.7.41-fixed-trainer-ui-playability (clean UI + playable trainer preserved)

## 1. Core Principle

**CurrentInstructionFrame.target is the sole authority for all visible teaching output.**

No component, hook, or renderer may independently decide:
- Which move to explain
- Which move to reveal
- Which move to highlight on the board
- Which piece to describe
- What hint text to show
- What Show More content to display
- What continuation candidate to surface

All visible teaching output **must** flow through this single pipeline:

```
CurrentInstructionFrame
  → EvidenceGraph (deterministic facts only)
  → BlundrCoachCompiler (target-bound templates)
  → CoachSafetyGate (hard invariants + blockers)
  → buildVisibleTeachingSurface
  → UI (CoachCard + board visuals)
```

## 2. Required Invariant on Every User-Turn Teaching Frame

```ts
instructionTargetUci       === coachMoveUci
instructionTargetUci       === visualMoveUci
instructionTargetUci       === showMoreTargetUci
instructionTargetPieceType === coachPieceType
```

**If this invariant fails for any frame:**
- Suppress unsafe coach text
- Suppress unsafe visual recipe / arrows / labels
- Surface `criticalIssue` in debug snapshot
- Do not render stale copy from previous frame or alternate candidate
- Do not fall back to generic language

## 3. View-Specific Rules

### Assisted View (default / recommended)
- **Must** lead with the exact SAN of `CurrentInstructionFrame.target`.
- Explanation must be specific to the exact piece, square, and purpose (development, pressure on f7, king safety, etc.).
- Examples of required form:
  - "Play e4. Claim space in the center and open lines for your bishop and queen."
  - "Play Nf3. Develop the knight toward the center and prepare safe king development."
  - "Play Bc4. Move your bishop to c4, where it develops actively and pressures f7."
  - "Castle kingside. Move your king to safety and connect your rooks."

**Forbidden** when a trusted `CurrentInstructionFrame.target` exists:
- "Focus on development."
- "Consider repositioning your piece..."
- "A legal continuation is available."
- "Try to improve your position."
- Any generic or non-specific language.

### Plain View
- **Before Show More is clicked:** Must not leak any of:
  - Exact SAN or UCI
  - From-square or to-square
  - Source/destination highlight or answer arrow
  - Raw internal labels (`answer_move`, `candidate_move`, etc.)
- Hint must be purely conceptual (e.g., "Develop toward the center", "Improve king safety").
- **After Show More is clicked:**
  - Text content **must equal** the Assisted coach content for the identical `CurrentInstructionFrame.target`.
  - Board visual recipe / arrows / highlights **must equal** the Assisted visual recipe for the identical target.
  - `visualMoveUci === instructionTargetUci`
  - `showMoreTargetUci === instructionTargetUci`

Show More **does not execute the move**. It only reveals the full explanation and Assisted-style board teaching highlight for the locked target.

### Branch Transition Frames
- `coachMoveUci = null`
- `visualMoveUci = null`
- `showMoreTargetUci = null`
- No move-specific coach text or visual target is allowed.

### Thinking / Loading / Terminal Frames
- Same null-target rules as branch transition.
- Safe neutral language only (e.g., "Thinking...", "Opening line complete.").

## 4. Evidence & Claim Rules

- Strong claims ("wins", "forces", "checkmate", "mate", "trap", "only move", "decisive", "blunder") **require explicit evidence** in the EvidenceGraph.
- If evidence is insufficient, the compiler must fall back to safe neutral language:
  - "This position is ready for practice."
  - "Blundr does not have a trusted continuation here yet."
- Emergency legal fallback moves must **never** be presented as normal coached lessons.

## 5. Non-Negotiable Requirements (11)

1. `CurrentInstructionFrame.target` is sole target authority.
2. Assisted View must state exact move first (SAN + piece-specific explanation).
3. Plain View must not leak SAN/UCI/from/to/highlight before Show More.
4. Hint must be conceptual only (no answer).
5. Show More text must equal Assisted coach content for the same target.
6. Show More board visual must equal Assisted board visual for the same target after click.
7. Coach must never say the wrong piece type (bishop for knight target, etc.).
8. Coach must never make unverified strong claims without evidence.
9. Emergency fallback cannot be coached as a normal lesson.
10. Branch transition frames must contain no move coach or move visual target.
11. Browser-visible behavior (not grep, not build, not internal state) is the final source of truth.

## 6. Browser QA Gate

No commit or tag of v2.7.42 coach deployment work is valid until a full normal-mode (`?debug=1` absent) browser session on port 3061 (or equivalent) has passed all 16 normal + 9 debug acceptance criteria defined in `BLUNDR_v2.7.42_COACH_BROWSER_QA_SCRIPT.md`.

## 7. Preservation Requirements

Throughout this phase the following trainer behaviors **must** remain unbroken:
- Lesson starts cleanly
- First coached move appears with correct target
- Board accepts the correct first move
- Opponent reply occurs
- Next instruction appears with matching target
- Thinking... does not block valid curated targets
- Continue from here appears only at confirmed End of Book
- No continuation candidate appears before Continue click
- Continue click starts continuation from identical FEN
- Normal UI remains free of all legacy debug / Attack / Defense / Plan / Active Board controls

## 8. Scope Boundaries (What This Phase Is Not)

- Not a Stockfish / Maia / engine pass
- Not an LLM phrasing or "make the coach smarter" pass
- Not a UI redesign or new visual system
- Not a continuation or branch logic rewrite
- Not the deep-intelligence roadmap (that comes after this lock is proven stable in browser)

This phase exists solely to make the **existing** coach output deterministic, target-bound, piece-correct, Plain-safe, and impossible to mismatch with the board.

---

**Sign-off required before Phase 2 golden tests begin:** All parties must agree the contract above is the binding specification for v2.7.42 coach deployment lock.