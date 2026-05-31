# Blundr Coach Perfection Gate — Blockers 5–6 Proof Hardening Report

**Date**: 2026-06-01  
**Pass Type**: Short proof-hardening pass (Blockers 5–6 only)  
**Starting Status**: Blockers 1–4 accepted as closed; 5–6 functionally advanced but proof incomplete; Gate NOT PASSED.

**Final Verdict**:

**Blockers 5–6 CLOSED, Coach Perfection Gate still NOT PASSED**

---

## 1. Work Performed

### Blocker 5 — All-Legal Candidate Evaluation (Proof Hardening)
- Expanded `candidateEvaluation.test.ts` from 6 to 10 positions with exact required coverage:
  - opening development
  - castling
  - capture
  - check
  - quiet improving move
  - continuation candidate
  - unknown opening
  - unsafe rejected move
  - book-safe but not engine-best move
  - locked target safety case

- Added explicit provenance tags on every Stockfish-related claim:
  - `SYNTHETIC_NOT_PROVEN` (majority — node cannot run real browser Stockfish)
  - `DETERMINISTIC_TEST_MOCK` (injected book-safe vs engine-best cases)

- Added and verified the **exact** invariant `legalCandidates.length === legalMoves.length` (computed via chess.js) for all 10 positions.

- Added/verified core invariants for all positions:
  - `legalCandidates.length === legalMoves.length` for every position
  - every candidate has `moveDelta` + `evidenceList`
  - rejected candidates have `rejectionReasons`
  - unsafe/blunder candidates are filtered before selection

- Created: `docs/BLUNDR_ALL_LEGAL_CANDIDATE_EVALUATION_EVIDENCE.md` with per-position FEN, counts, selected moves, top-3, rejected unsafe, engine data, evidence, and provenance tags.

### Blocker 6 — Pedagogical Ranking Safety Order (Proof Hardening)
- Existing strong coverage in `pedagogicalRankingSafety.test.ts` verified and lightly extended with "no-evidence vs strong-evidence" case.
- All required cases already proven:
  - unsafe locked target blocked (`locked_target_engine_unsafe`)
  - unsafe book target blocked (`lesson_target_engine_unsafe`)
  - safe book target allowed
  - teaching move can differ from engine-best only when safety gate passes (with recorded `MoveComparison`)
  - continuation candidate must be safe
  - evidence strength influences ranking when safety allows

## 2. Commands Run & Results

```bash
npx tsc --noEmit
# Result: 0 errors

npx tsx lib/blundr/brain/candidates/__tests__/candidateEvaluation.test.ts
# Result: ALL 10 positions + invariants PASSED

npx tsx lib/blundr/brain/pedagogy/__tests__/pedagogicalRankingSafety.test.ts
# Result: ALL safety rules + new evidence case PASSED

npx tsx lib/blundr/golden/__tests__/brainTeachingFrameGolden.test.ts
# Result: PASSED

npm run test:trainer-debug
# Result: ✓ PASSED

npm run test:multi-move-qa
# Result: ✓ PASSED

npm run test:coach-quality
# Result: ✓ PASSED

npm run build
# Result: Successful
```

**Final targeted verification (after adding exact `legalCandidates.length === legalMoves.length` assertion):**
- `npx tsc --noEmit` → 0 errors
- `npx tsx lib/blundr/brain/candidates/__tests__/candidateEvaluation.test.ts` → PASSED (exact equality `legalCandidates.length === legalMoves.length` confirmed for all 10 positions)
- `npm run build` → Successful
```

## 3. Key Files Changed / Created

- `lib/blundr/brain/candidates/__tests__/candidateEvaluation.test.ts` (expanded to 10 positions + provenance + invariants)
- `docs/BLUNDR_ALL_LEGAL_CANDIDATE_EVALUATION_EVIDENCE.md` (new, detailed per-position data with provenance)
- Minor test strengthening in pedagogy safety test

No changes to VisibleTeachingSurface, TrainerPresentationFrame, app/page.tsx visible paths, or any product features.

## 4. Remaining Work

Blockers 7–10 remain open (as noted in prior reports). This pass was strictly limited to hardening proof for 5–6.

---

**Blockers 5–6 CLOSED, Coach Perfection Gate still NOT PASSED**