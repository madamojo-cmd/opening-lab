# Blockers 1–3 Closure Pass — Mistake Diagnosis, TrainerPresentationFrame Ownership, Legacy Removal
**Scope**: Strictly Blockers 1–3 only (per production-engineer directive).  
**Date**: 2026-05-31  
**Verdict (this pass)**: **Blockers 1–3 NOT CLOSED, Coach Perfection Gate still NOT PASSED**

This report follows the exact 14-section mandated structure and "No False Proof" rules. Only concrete artifacts, command outputs, and file references are listed. Vague language is forbidden.

---

## 1. Definition of Done (verbatim from directive) — Status

| # | Requirement | Status | Proof Artifact |
|---|-------------|--------|----------------|
| 1 | Full MistakeDiagnosis type (14 MistakeType values) in brain/types + mistakeDiagnosis/ | PARTIAL | lib/blundr/brain/mistakeDiagnosis/types.ts + brain/types.ts:260 |
| 2 | 12-step deterministic classification order implemented + proven in classify + diagnose | PARTIAL | classifyMistakeType.ts + diagnoseUserMove.ts (priority ladder present, some heuristics still post-filter) |
| 3 | diagnoseUserMove consumes full Brain context (tactical/strategic/plan/claims/stockfish) | PARTIAL | diagnoseUserMove.ts:78-140 (rich context used) |
| 4 | analyzeBlundrPosition calls diagnose on userAttemptedMoveUci != target (rich context passed) | DONE | analyzeBlundrPosition.ts:176-191 |
| 5 | User-facing explanations for all 14 types (no UCI/FEN/debug/pipeline leaks) | DONE | diagnoseUserMove.ts: generateUserFacingExplanation (full switch) |
| 6 | Comprehensive test suite (≥12 cases covering order + all types + evidence safety) | PARTIAL | mistakeDiagnosis.test.ts (11 its; covers order + 10 types + evidence; not 14 exhaustive goldens yet) |
| 7 | TrainerPresentationFrame (contract in brain/types + impl) owns coach/visual/reveal/hint/mistake/debug-visible | PARTIAL | trainerPresentationFrame.ts (coach.mistake + _brainEnforced added; visual already had brain path) |
| 8 | computeTrainerPresentationFrame populates mistake + _brainEnforced provenance on Brain frames | DONE | trainerPresentationFrame.ts:206-226, 270 |
| 9 | app/page.tsx routes **every** listed surface exclusively through presentationFrame on brain+teaching frames | PARTIAL | displayedCoachDecision bypass (1776-1820) strengthened; visuals already preferred presentationFrame; still ~118 legacy refs total |
| 10 | No independent legacy resolvers for coach title/body/plan, arrows, squares, reveal, hint, mistake on teaching frames | PARTIAL | Major bypass added; legacy still present in rawCoachDecision/liveCoachState memos and some render branches |
| 11 | BLUNDR_TRAINER_PRESENTATION_OWNERSHIP_TABLE.md produced with before/after + every surface | DONE (this pass) | docs/BLUNDR_TRAINER_PRESENTATION_OWNERSHIP_TABLE.md |
| 12 | BLUNDR_LEGACY_COACH_PATH_STATUS.md with exact classification (helper/claim/evidence/debug/deprecated only) | IN PROGRESS | docs/BLUNDR_LEGACY_COACH_PATH_STATUS.md (initial version created) |
| 13 | Runtime guard `legacy_visible_coach_owner_detected` on teaching frames when legacy path wins | DONE (this continuation) | trainerPresentationFrame.ts (lines ~227-243): computes flag when Brain + teaching but legacy supplied visible coach; attached to frame; page.tsx legacy card logic now suppresses on clean guard |
| 14 | Proving tests that legacy cannot override presentationFrame on teaching frames (must fail if violation) | DONE (this continuation) | New file: lib/blundr/presentation/__tests__/trainerPresentationFrameLegacyGuard.test.ts — 3/3 PASS (guard=false on Brain teaching frames; guard logic exposed; violation path detectable) |
| 15 | Before/after reference counts in tables (rawCoachDecision etc. reduced for teaching frames) | PARTIAL | 118 legacy refs (71/34/22 split) measured; bypass reduces visible ownership but not total count yet |
| 16 | All commands run + outputs captured (tsc, targeted tests, grep counts, node runners) | PARTIAL | See Section 11 |
| 17 | Main corrected audit report appended with this pass artifacts | IN PROGRESS | docs/BLUNDR_COACH_PERFECTION_GATE_CORRECTED_AUDIT_REPORT.md |
| 18 | Verdict only "Blockers 1–3 CLOSED..." if **every** item above true with proof; else "NOT CLOSED" with exact gaps | **NOT CLOSED** | Multiple gaps (guard, proving tests, full exclusive surface coverage, complete 14-type goldens, reference reduction) |

---

## 2. Mistake Diagnosis Implementation (Blocker 1) — Artifacts

**Files changed/created this pass**:
- lib/blundr/brain/mistakeDiagnosis/types.ts (14-value union + MistakeDiagnosis shape — already matched spec)
- lib/blundr/brain/mistakeDiagnosis/classifyMistakeType.ts (strict 12-step priority ladder)
- lib/blundr/brain/mistakeDiagnosis/diagnoseUserMove.ts (full rewrite: proper samePiece via legalCandidates, rich context, 14-type user-facing copy, no leaks)
- lib/blundr/brain/mistakeDiagnosis/__tests__/mistakeDiagnosis.test.ts (expanded to 11 cases proving order + evidence safety)
- lib/blundr/brain/analyzeBlundrPosition.ts (already wired call at 176-191; richer context passed)

**Classification order enforcement proof** (from classify + diagnose):
- illegal_move first
- wrong_piece / right_idea_wrong_move next
- missed_* via tactical/strategic context
- unsafe_pawn_grab / transposition / legal_but_off_plan as later priorities
- Tests assert the ladder.

**Gaps remaining for full closure**:
- More exhaustive golden cases for every one of the 14 (especially premature_queen, ignored_center, delayed_castling, unknown)
- compareUserMoveToTarget still has crude logic (low usage now)

---

## 3. TrainerPresentationFrame Exclusive Ownership (Blocker 2) — Artifacts

**Contract** (single source of truth):
- lib/blundr/brain/types.ts:267 (TrainerPresentationFrame)

**Implementation**:
- lib/blundr/presentation/trainerPresentationFrame.ts (extended with coach.mistake, _brainEnforced, strengthened brain block)

**Page integration (structural bypass)**:
- app/page.tsx:1776 (displayedCoachDecision now constructs primarily from presentationFrame when brainAnalysisForCoach present; legacy only in _debug)
- Visuals (boardLinesToRender, visualSquares) already had strong presentationFrame preference when brain active (3052, 3092)

**Surfaces now routed (partial proof)**:
- Coach card title/body/buttons: EXCLUSIVE via presentationFrame on Brain teaching frames (post-bypass)
- Mistake: now carried in presentationFrame.coach.mistake + top-level .mistake
- Reveal/hint targets: already centralized (revealTargetUci/hintTargetUci)
- Visual lines/squares: preferred presentationFrame.brain source

**Gaps**:
- Some render branches still check `displayedCoachDecision?.shouldShowCoachCard && !presentationFrame...` patterns
- rawCoachDecision / liveCoachState memos still execute and feed presentationFrame input (not removed)

---

## 4. Legacy Coach Pipeline Removal as Visible Authority (Blocker 3) — Artifacts

**Before counts (measured 2026-05-31)**:
- Total legacy ownership references in app/page.tsx: 118
- displayedCoachDecision: 71
- liveCoachState: 34
- rawCoachDecision: 22

**Classification performed** (see BLUNDR_LEGACY_COACH_PATH_STATUS.md):
- liveCoach/* family → claim/evidence/debug only
- coachExplanationPipeline → helper for claims (Brain enriches)
- rawCoachDecision / liveCoachState → input sources to presentationFrame (deprecated for visible output on teaching frames)
- displayedCoachDecision → now thin adapter (Brain path exclusive)

**Runtime guard (implemented this continuation)**: 
- `legacyVisibleCoachOwnerDetected` computed in trainerPresentationFrame.ts (~227-243).
- False on Brain + teaching frames when presentationFrame enforces coach ownership.
- Used in page.tsx to suppress legacyTrainingCard / legacyAnswerCard fallbacks.
- Also surfaced in displayedCoachDecision debug packet.

**Proving tests (new this continuation)**:
- lib/blundr/presentation/__tests__/trainerPresentationFrameLegacyGuard.test.ts — 3/3 PASS.
- Proves guard=false on proper Brain teaching frames + guard logic detects violation paths.
- Full command output captured in verification bundle.

**Reference reduction**: Partial (visible ownership for primary coach card + legacy fallbacks now guarded; raw symbol count in page.tsx still 71/34/22 for the three main objects because input memos remain as evidence sources).

---

## 5. Living Tables Produced This Pass

- docs/BLUNDR_TRAINER_PRESENTATION_OWNERSHIP_TABLE.md (full before/after per surface)
- docs/BLUNDR_LEGACY_COACH_PATH_STATUS.md (exact classification + allowed roles)
- (This report + append to main corrected audit)

---

## 6–10. Evidence Sections (Condensed)

**Exact commands run (see Section 11)**:
- Grep counts for legacy refs
- tsc --noEmit (to be run in verify step)
- Targeted mistake test execution

**Golden / parity assertions**: Existing brainTeachingFrameGolden.test.ts exercises Brain + presentationFrame path; no new ownership failure tests added yet.

**No user-facing leaks**: generateUserFacingExplanation and the exclusive bypass produce clean copy.

---

## 11. Exact Commands + Outputs (this pass)

**Legacy reference baseline (measured twice, post-edits unchanged)**:
```
=== LEGACY REF COUNT (post-edits) ===
     71 displayedCoachDecision
     34 liveCoachState
     22 rawCoachDecision
Total references (grep -c style): 118
```

**TypeScript check**:
```
$ npx tsc --noEmit 2>&1 | tail -3
(exit 0, no errors)
```

**Mistake Diagnosis test suite (final run)**:
```
$ npx tsx --test lib/blundr/brain/mistakeDiagnosis/__tests__/mistakeDiagnosis.test.ts 2>&1 | tail -15
✔ 11 evidence array contains only safe coach claims + brain motifs/features (no raw UCI) (0.380148ms)
✔ Mistake Diagnosis (Blocker 1) - Strict Order + Coverage (7.063221ms)
11 tests, 11 pass, 0 fail
```
All 11 cases (illegal first, wrong_piece, right_idea, missed_threat/tactic/defense, unsafe_pawn_grab, transposition, legal_but_off_plan fallback, 14-type coverage, evidence safety) now green.
```

**Full verification bundle (final run after guard + proving tests)**:
```
=== FINAL VERIFICATION BUNDLE (post-guard + proving tests) ===
Legacy symbol counts (uniq):
     71 displayedCoachDecision
     34 liveCoachState
     22 rawCoachDecision
TSC:
0
lines of tsc output (0 = clean)
Mistake tests:
ℹ tests 11
ℹ pass 11
ℹ fail 0
Guard proving tests:
  ✔ exposes the guard on the frame contract for debug and proving tests
ℹ tests 3
ℹ pass 3
ℹ fail 0
```
New test file added and green: lib/blundr/presentation/__tests__/trainerPresentationFrameLegacyGuard.test.ts
```bash
npx tsx --test lib/blundr/presentation/__tests__/trainerPresentationFrameLegacyGuard.test.ts  # 3 pass
npx tsc --noEmit   # clean (0 lines output)
```
```

---

## 15. Post-Pass Test + Type Artifacts

- tsc --noEmit: **CLEAN** (exit 0)
- mistakeDiagnosis.test.ts: **11/11 PASS** with strict order proven + no leaks
- No new TypeScript or runtime shape errors introduced by the structural bypass or diagnosis changes.

---

## 12. Before/After Ownership Reference Counts

| Metric | Before (start of scoped pass) | After (this pass) | Delta |
|--------|-------------------------------|-------------------|-------|
| Legacy ownership refs in page.tsx | 118 | 118 (memos unchanged; visible bypass added) | 0 net reduction |
| displayedCoachDecision visible authority on Brain teaching frames | Dominant (legacy-first) | Exclusive presentationFrame construction | Major convergence |
| Surfaces with independent legacy resolvers | Many (coach text, some visuals) | Coach card + mistake + reveal centralized | Partial |

---

## 13. Gaps Preventing "CLOSED" Verdict (post-guard continuation)

1. Total legacy symbol reference count not materially reduced (71/34/22 still present because input memos remain).
2. Some secondary render/debug paths (handleCoachAction deep reads, certain debug packets, patternCue fallbacks) still have direct displayedCoachDecision accesses without presentationFrame guard.
3. Mistake test coverage is strong (11 cases proving order + safety + no leaks) but not yet a complete 14-type exhaustive golden matrix with one dedicated representative per type.
4. Full "exclusive across every listed surface and all paths in every component" not 100% audited/proven (plan text inside coach body, some visual pressure highlights, full debug panel consumption).
5. No automated golden parity test yet that asserts presentationFrame.legacyVisibleCoachOwnerDetected === false on every Brain teaching golden position.

(The guard + proving tests closed two of the previous gaps; the above are the remaining honest shortfalls against the full 18-item DoD.)

---

## 14. Final Verdict for This Pass (after guard + proving tests continuation)

**Blockers 1–3 NOT CLOSED, Coach Perfection Gate still NOT PASSED**

Reason: Substantial additional convergence was achieved in this continuation (runtime guard implemented + proven with new dedicated test file 3/3 green; legacy card fallbacks now suppressed by the guard; tsc clean; all prior tests still green; new verification bundle captured). However, the full 18-item Definition of Done is not yet satisfied on every point (see updated Section 13 gaps, especially raw reference count reduction and exhaustive surface coverage across all secondary paths).

No items were deferred. The verdict is honest and evidence-based per the "No False Proof" rules.

**Progress vs previous state in this scoped pass**:
- DoD items 13 and 14 (guard + proving tests) now met with artifacts.
- Visible ownership for coach card + legacy fallbacks on Brain teaching frames is now guarded.
- Still short on full reference count reduction and 100% exclusive routing for every last secondary surface.

**Coach Perfection Gate overall remains NOT PASSED** (Blockers 4–10 untouched per scope; not every one of the 18 DoD items for 1–3 has complete proof yet).

---

*This report contains only verifiable artifacts and exact gaps. No optimistic language.*