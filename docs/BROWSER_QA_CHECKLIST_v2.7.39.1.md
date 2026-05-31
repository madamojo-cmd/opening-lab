# Browser QA Checklist — 2.7.39 + 2.8.0 Testing Milestone

**Per Blundr Comprehensive Coach-First Roadmap v2.0 (Coach Perfection Gate through v2.7.40 + 2.8.0 testing prep)**

**Note (user correction):** 2.8.0 is the dedicated testing step. Complete 2.7.39 Brain Coach perfection + v2.7.40 stable, then use this for comprehensive testing before any 2.9.0 product work.

Run this in a fresh incognito session with `?debug=1`.

## 1. Target Locking & Frame Stability (Core of 2.7.39.1)
- [ ] Start a guided lesson. Note the `instructionFrameKey` in debug.
- [ ] Complete the guided move → observe official instructional target is locked.
- [ ] Enter continuation ("Continue from here").
- [ ] Let engine analysis run. Verify new engine previews **do not** replace the official continuation candidate target (check `currentSelectedCandidateUci` and `instructionTarget` stay stable for the frameKey).
- [ ] Trigger explorer data or manual engine re-analysis on same FEN. Confirm no target drift.
- [ ] `instructionFrameKey` is consistent across re-renders for the same logical frame.
- [ ] No duplicate official instructional targets for the same `trainerFrameId` / frameKey in Coach Timeline.
- [ ] Locked continuation candidate shows as "LOCKED" or "OFFICIAL INSTRUCTIONAL" in timeline/debug.

## 2. Debug Cleanup (False Positive Fixes)
- [ ] Reach a terminal position (checkmate, stalemate, line complete).
  - [ ] No `terminal_surface_missing` critical.
  - [ ] Terminal coach surface (or feedback) is visible.
- [ ] On terminal / opponent-reply / no-target frames:
  - [ ] No `feature_pipeline_not_exposed` or `plan_pipeline_not_exposed` warnings.
- [ ] On real teaching frames (`ready_for_user`, user turn, with instructionTarget): the above warnings may still appear if pipelines are truly missing (expected).

## 3. Fallback Count Splitting
- [ ] In debug snapshot `coachTimelineSummary`:
  - [ ] `instructionalFallbackCount`, `opponentStatusFallbackCount`, `terminalFallbackCount` are present and add up sensibly to total fallbacks.
- [ ] Timeline entries clearly distinguish instructional vs opponent vs terminal fallbacks.

## 4. Coach Timeline / Debug UI
- [ ] Official instructional entries are visually distinguished (green highlight, "OFFICIAL INSTRUCTIONAL", frameKey shown).
- [ ] Candidate previews are separate and do not pollute official count.
- [ ] `instructionFrameKey` visible on relevant entries.

## 5. Continuation Flow End-to-End (No Drift)
- [ ] Full flow: Guided lesson → branch → "Continue from here" → multi-ply continuation → terminal position.
  - [ ] Every user-turn teaching frame has a stable `instructionTarget`.
  - [ ] `coachMoveUci === instructionTargetUci`
  - [ ] Visual and reveal targets align.
  - [ ] No `stale_selected_candidate`, `target_mismatch`, or `coach_move_mismatch` criticals.
- [ ] Engine arrivals during continuation never flip the committed candidate for the current frameKey.

## 6. Golden Position Regression (Run Locally)
- Use existing golden test fixtures.
- Confirm 0 target drift, 0 piece mismatches, 0 duplicate official targets.

## 7. Brain Consistency (2.7.39.2–2.7.39.5 + v2.7.40)
- [ ] `brainAnalysis` appears in debug when `?debug=1` (features, plans, opportunities, candidateScoring with breakdown).
- [ ] Coach decisions and debug packets (features/plans/opportunities) show Brain provenance when Brain is active.
- [ ] No legacy `*_not_exposed_from_module` warnings on teaching frames when Brain data is present.
- [ ] `coachTimelineSummary` and timeline entries reflect Brain-derived data (e.g., brain plans/features visible).

## 8. 2.8.0 Testing Milestone Readiness (Pre-2.9.0)
- [ ] Brain is the stable single source for coach intelligence across guided, branch, and continuation flows.
- [ ] Full guided lesson → continuation → terminal completes with 0 target/Brain mismatches.
- [ ] Debug clearly shows Brain as authoritative (no competing legacy packets).
- [ ] All unit/QA tests pass locally.
- [ ] Golden positions + browser flows show consistent, evidence-backed coaching with locked targets.
- [ ] Ready for expanded golden suite, lesson runtime testing, and evidence/safety model validation (foundations only — no full product features yet).

## 9. General Health
- [ ] `npm run test:trainer-debug` passes.
- [ ] `npm run test:multi-move-qa` passes.
- [ ] `npm run test:coach-quality` passes.
- [ ] `npx tsc --noEmit` clean.
- [ ] `npm run build` succeeds cleanly.
- [ ] `npx tsc --noEmit` clean.
- [ ] `npm run build` succeeds.
- [ ] No new criticals in normal play.

**Exit Criteria for v2.7.39.1 (from roadmap):**
- 0 target drift on all golden + browser flows.
- No false `terminal_surface_missing`.
- `instructionFrameKey` + locking in place and observable.
- Coach Timeline shows clear official vs preview separation.
- Split fallback counts present.

Document any failures with screenshots + exact debug JSON snippet.

---
Part of executing the v2.0 Coach-First Roadmap. Do not proceed to 2.7.39.2+ until this checklist passes in browser.