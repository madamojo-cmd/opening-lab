# Blundr v2.7.39 Coach-First Brain Completion (pre-2.9.0 testing ready)

## Summary
Per v2.0 Coach-First Roadmap: Completed remaining 2.7.39.x phases (1-5+ foundations, 6/7 delegation). Blundr Brain Coach perfected as single source (features, plans, opportunities, basic candidate scoring). Full migration wiring for coach/debug behind Brain. Target stability, debug hygiene, and Brain priority in snapshots. All gates green. Ready for comprehensive testing before 2.9.0 product layers. Coach Gate effectively passed.

## Key Deliverables (2.7.39)
- 2.7.39.1: Target locking (instructionFrameKey, LockedContinuationCandidate guards), false-positive fixes, fallback splits, timeline distinctions.
- 2.7.39.2: Brain facade (analyzeBlundrPosition) with real delegation to advanced features, plans, opportunities + basic scoring.
- 2.7.39.3: Coach pipeline accepts/enriches from BrainAnalysis; wired in main paths.
- 2.7.39.4: Debug snapshot primarily sources from Brain (features/plans/opps); legacy not_exposed suppressed when Brain active.
- 2.7.39.5: Candidate scoring with scoreBreakdown in Brain.
- 2.7.39.6/7: Full delegation via extractors (tacticalMotifs etc.).
- v2.7.40 foundations: Brain as orchestrator; coach/debug migration started/complete in key areas.
- Docs: Inventory, Incorporation Map, Browser QA Checklist updated.
- Testing: All suites (trainer-debug, multi-move-qa, coach-quality), tsc, build passing repeatedly. Brain Coach ready for golden + browser QA.

## Post-Gate Prep (pre-2.9.0)
- Brain Coach stable/unified/evidence-backed.
- Ready for lesson runtime, expanded goldens, QA harness before product expansion (2.9.0+).

This patch focuses on Coach perfection per roadmap. No product features added yet.

---

# Blundr v2.7.1 Product Stability + Review Patch (original)

This deployment extends the v2.7 stability temporal core build with the requested product-facing fixes.

## Recommendation / Engine Fix
- Continuation-mode user recommendations no longer draw random legal fallback moves.
- After the bot plays, the plan view shows an engine-pending state until browser Stockfish returns.
- Once browser Stockfish returns, the board highlights the actual Stockfish top move.
- GPT/Brain text can refine the explanation, but continuation plan geometry stays engine-backed.

## Board View Stability
- Switching Attack, Defense, and Plan no longer retriggers `/api/brain` analysis.
- Active board views render from the cached annotation for the current FEN until a move changes the position.

## Advantage / Evaluation Display
- Replaced confusing positive/negative eval label with a side-explicit label: `White +x`, `Black +x`, `Equal`, or mate status.
- Engine output is cleared when the FEN changes so stale evals are not displayed during a new position.

## Captured Pieces + Material
- Added captured piece strips above and below the board.
- Top strip shows opponent-side captured material context.
- Bottom strip shows user-side captured material context.
- Only the side with a material advantage displays `+N material`; the losing side does not show a redundant negative count.

## Legal Move Preview
- Selecting a piece now highlights all legal destination squares.
- Capturing destinations receive a stronger red-ring treatment.

## Settings
- Added a board settings panel.
- Board themes: Classic, Slate, Blue, Walnut.
- Piece styles: Classic, Neo, Letters.
- Active display toggles: Attack view, Defense view, Plan view, legal move dots, advantage bar, captured pieces, move labels, opponent cue.
- Settings persist in localStorage.

## Game Ending UX
- Terminal positions now show a clear game-concluded card.
- Checkmate, stalemate, draw, repetition, and insufficient-material endings are identified.
- Restart button is shown after the game ends.

## Move Review Controls
- Added back/forward controls below the board.
- Users can step backward and forward through prior positions.
- Moving is blocked while reviewing an older position to avoid corrupting the live training state.

## Build Verification
- `npm install --no-audit --no-fund`: passed.
- `npm run build`: passed with Next.js 16.2.6 / Turbopack.
