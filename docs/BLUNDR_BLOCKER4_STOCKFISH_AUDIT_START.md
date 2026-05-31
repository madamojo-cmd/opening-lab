# Blocker 4 — Stockfish Validation Audit Kickoff (Careful Intelligence Phase)

**Date**: 2026-06-01  
**Phase**: Careful intelligence work (after Visible-Output Ownership closed)

## Current State Summary (Honest)

The Brain currently uses Stockfish strictly as a **validator** (good).

`validateCandidateWithStockfish.ts` (in `lib/blundr/brain/engineValidation/`) wraps the production `getStockfishTopMovesForValidation`.

### Gaps Identified (as of start of this phase)

1. **Evidence richness**: Previous implementation captured only basic `scoreCp`, `depth`, `classification`. Missing:
   - `engineRank` (MultiPV position)
   - `evalDelta` from the true best move
   - `multipvUsed`
   - Explicit notes about rank and delta

2. **Call site consistency**: Depth/MultiPV were not always passed explicitly from `analyzeBlundrPosition`.

3. **Auditability**: No systematic evidence table exists showing, for golden positions:
   - What depth/MultiPV was used
   - What rank the teaching candidate received
   - Eval delta
   - Whether unsafe/blunder candidates are correctly rejected for teaching selection

## Work Performed in This Continuation

- Enriched `StockfishValidation` interface (brain/types.ts) with:
  - `multipvUsed`
  - `engineRank`
  - `evalDelta`
- Updated `validateCandidateWithStockfish` to:
  - Request explicit `multipv: 3`, `depth: 14`
  - Compute `engineRank` and `evalDelta`
  - Include rank/delta notes for debugging
- Updated the call site in `analyzeBlundrPosition.ts` to pass the parameters.
- Added a small safety fallback improvement in `rankTeachingCandidates.ts` (never let a "blunder" target win over safe alternatives when possible).

## Next Careful Steps (Planned)

1. Build a small golden-position Stockfish evidence table (manual + scripted).
2. Ensure `CandidateEvaluation.stockfish` always carries the full rich packet when validation runs.
3. Add unit tests that assert rank/delta behavior on synthetic positions.
4. Document exact thresholds and rationale in living docs.
5. Only then consider deeper integration (e.g., using rank/delta inside pedagogy ranking).

**This work is deliberately incremental and evidence-first.**

No claims of "Blocker 4 closed" will be made until comprehensive tables + tests exist.

---

**Status**: Careful audit and enrichment started. More evidence artifacts to follow in subsequent continuations.
