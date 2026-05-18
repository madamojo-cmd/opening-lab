# v2.7.34 QA Acceptance Report

## Build
[x] npm run build passes.

## Brain/GPT Guardrails
[x] No automatic /api/brain calls on position update.
[x] No automatic /api/brain calls on wrong move.
[x] Manual Reveal still calls /api/brain.

## Teaching Cue Compiler
[ ] Verified move shows compiler cue with Blundr Brain Validated badge.
[ ] Rejected move suppresses compiler cue and shows Line needs review.
[ ] Not-verified move suppresses compiler cue and shows Move not verified.
[ ] Compiler output is deterministic for the same FEN + move.
[ ] Compiler enforces visual attention budget.
[ ] Compiler fallback works if compilation errors.

## Core Concept Checks
[ ] Bc4 produces development_with_pressure or equivalent development concept.
[ ] Castling produces castle_for_safety.
[ ] Central pawn advance produces center_control or center_break.

## UX Rules
[ ] Plain View hides pre-move hints.
[ ] Wrong move still does not trigger GPT/Brain automatically.
[ ] Main Pattern Cue Card remains clean user language.
[ ] Technical details remain in Show More/debug only.

## Learning Events
[ ] teaching_cue_compiled event recorded locally.
[ ] Event includes conceptId, cueTitle, confidence, compilerVersion.
[ ] No external analytics calls.
