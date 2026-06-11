# Stage 2 Phase B.1 Guardrail Report
Date: 2026-06-11
Scope: Phase B.1 only (ownership guardrail tests, import-boundary tests, documentation updates)

## Files Created
- `tests/coach/stage2FrameAuthorityLock.test.ts`
- `tests/coach/stage2SurfaceOwnershipLock.test.ts`
- `tests/coach/stage2PlainAssistedShowMoreLock.test.ts`
- `tests/coach/stage2NoLegacyImportBoundary.test.ts`
- `tests/coach/stage2BoardTruthBoundaryLock.test.ts`
- `docs/2026-06-11/STAGE_2_PHASE_B1_GUARDRAIL_REPORT.md`

## Production Files Changed
- None.

## Guardrail Coverage Summary
1. `stage2FrameAuthorityLock.test.ts`
- Verifies visible target alignment to `CurrentInstructionFrame.target` across assisted and plain-after-show-more outputs.
- Verifies target/piece invariants by output contract (coach target, visual target, reveal target fallback alignment).
- Verifies noisy non-authority fields do not override target authority.

2. `stage2SurfaceOwnershipLock.test.ts`
- Verifies approved visible surface output contract via live visible surface builder path.
- Confirms known existing legacy imports in `app/page.tsx` remain documented risks.
- Enforces that Stage 2/new consolidation files do not directly import forbidden legacy visible/copy/ranking/visual feeders.

3. `stage2PlainAssistedShowMoreLock.test.ts`
- Verifies plain-before-show-more no-leak behavior.
- Verifies assisted and show-more target parity.
- Verifies noisy Stage-2-like extra packet fields do not bypass plain no-leak constraints.

4. `stage2NoLegacyImportBoundary.test.ts`
- Static boundary test for forbidden legacy imports in Stage 2/new consolidation files.
- Explicitly treats existing `app/page.tsx` legacy imports as known Phase A risks (non-failing).

5. `stage2BoardTruthBoundaryLock.test.ts`
- Verifies approved board-truth fact contract presence (legality/SAN/UCI/piece/from/to/capture/check/checkmate/castle/promotion/en passant/fen before/fen after).
- Verifies derived-feature terms are not present in board-truth payload or board-truth provider source.

## Tests Run
Baseline required:
- `npm run test:coach-quality`
- `npm run test:trainer-debug`
- `npm run test:multi-move-qa`

Direct new tests required:
- `npx tsx tests/coach/stage2FrameAuthorityLock.test.ts`
- `npx tsx tests/coach/stage2SurfaceOwnershipLock.test.ts`
- `npx tsx tests/coach/stage2PlainAssistedShowMoreLock.test.ts`
- `npx tsx tests/coach/stage2NoLegacyImportBoundary.test.ts`
- `npx tsx tests/coach/stage2BoardTruthBoundaryLock.test.ts`

## Pass/Fail Summary
- Baseline tests: PASS / PASS / PASS
- New Phase B.1 tests: PASS / PASS / PASS / PASS / PASS

## Sandbox/Execution Note
- Direct `tsx` commands hit sandbox EPERM (`listen ... /tmp/tsx-1000/*.pipe`) and were rerun unsandboxed.

## Tests Potentially Limited Until Phase B.2
- Import-boundary tests are static and source-based by design; they do not enforce runtime call graph isolation.
- Full runtime isolation of legacy direct `app/page.tsx` feeders remains a later-phase task (no refactor/deletion/quarantine in B.1 by constraint).

## Remaining Single-Authority Risks
- Known runtime-direct legacy feeders in `app/page.tsx` remain present (documented Phase A risk).
- Ranking/opportunity, legacy copy, and legacy visual stacks remain overlap risks pending later wrap/quarantine work.

## Phase B.2 Readiness
- Based on B.1 results, baseline stability, and passing guardrail suite: safe to request user approval for Phase B.2.
