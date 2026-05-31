# Blundr v2.7.39 Solid Checkpoint Cleanup — Final Report

**Date**: 2026-06-01  
**Mission**: Complete the 10 required steps for Coach Action Policy + Plain Recall Mode + Debug Truth Fix + Experience Selector Cleanup (and overall mission acceptance criteria).  
**Author**: Grok (as Captain, following multi-agent execution model)  
**Verdict**: **NOT PASSED** (honest assessment — substantial completion on core architecture and debug truth, but not every sub-requirement verifiably met to the strict standard required).

---

## 1. Honest Verdict

**Coach Action Policy + Plain Recall Mode + Debug Truth + Experience Selector Cleanup: NOT PASSED**

The work advanced the mission significantly:
- The canonical `getCoachActions` policy is now the dominant source of truth for visible buttons.
- Plain View safeguards (no move leak before help + correct buttons) are enforced in the main render and snapshot paths.
- Terminal debug truth is much stronger (warnings forced to [], mismatch counts ignore superseded/candidate_history, historical actions and effective `terminal_surface` owner exposed).
- Many required regression tests were added and the expanded validation suite is mostly green.

However, not every one of the exact 10 required steps + all 66+ specific tests + full end-to-end live browser QA with cleared storage + `?debug=1` on the precise Qd8# terminal frame reached a clean, passing state within the constraints of this execution environment.

Per the mission rules: **Do not claim PASSED unless all acceptance criteria are verifiably met.**

---

## 2. Executive Summary

This session executed the full "Complete everything" directive against the 10 required steps.

**Major Achievements**:
- Policy fully propagated with real `trainerView` (no undocumented defaults).
- Legacy fallback arrays removed from active visible paths.
- `renderedButtonActions` in debug now consistently policy-driven.
- Legacy teaching buttons (`show_plan`, `analyze_idea`, etc.) largely removed from MVP visible UI and labels.
- Plain View no-leak enforcement added in both app layer and snapshot builder.
- Terminal debug truth significantly hardened for the exact failure mode described (Qd8# checkmate frame).
- Numerous new regression tests added for policy matrix, Plain View, removed controls, and terminal live-shaped data.
- Full validation suite (tsc, build, trainer-debug, multi-move-qa, coach-quality, parity, golden) executed repeatedly — core suites consistently green.

**Remaining Gaps** (why NOT PASSED):
- Some new regression tests added in this session have assertion mismatches against the current snapshot builder behavior.
- Full live browser QA (Steps A–D with cleared storage + `?debug=1`) could not be executed end-to-end due to the 5-minute background task timeout in this environment (repeatedly observed).
- Not every single one of the 66+ specific test cases listed in the mission was added and passing.

---

## 3. Root Causes (of the original problems this mission addressed)

- Scattered hard-coded button lists across `rawCoachDecision`, `phaseActionGate`, `CoachCard`, and handlers → stale/confusing buttons and debug drift.
- No single policy for Assisted vs Plain View → Plain View was leaking the move and showing too many buttons.
- Insufficient gating in `trainerDebugSnapshot.ts` for terminal/no-target frames → persistent non-applicable warnings and inflated mismatch counts from `candidate_history`/`superseded` entries.
- Action state not properly marked historical after terminal → stale `revealTargetUci` and `actionDebugIsHistorical=false` in the exact Qd8# case the user observed.

---

## 4. Files Changed (Summary)

- `app/page.tsx` — Heavy policy wiring, Plain View safe copy enforcement, alias normalization improvements, final policy enforcement pass.
- `components/coach/CoachCard.tsx` — Centralized label usage via `getActionLabel`, legacy mappings trimmed.
- `lib/blundr/presentation/phaseActionGating.ts` — Policy as primary driver, `trainerView` propagation.
- `lib/blundr/presentation/getCoachActions.ts` — Core policy (minor enhancements during execution).
- `lib/blundr/debug/trainerDebugSnapshot.ts` — Strong terminal warning stripping, Plain View safe copy, effective owner + historical action fields.
- `lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts` — Many new required regression tests (policy, Plain View, removed controls, terminal Qd8# exact shape).

---

## 5. New Coach Action Policy

The policy in `getCoachActions.ts` is now the single source of truth.

**MVP Matrix (implemented and wired)**:

| View     | Phase              | Target? | Answer shown? | Actions                  |
|----------|--------------------|---------|---------------|--------------------------|
| assisted | ready_for_user     | Yes     | Any           | []                       |
| plain    | ready_for_user     | Yes     | false         | ["hint", "reveal_move"]  |
| plain    | ready_for_user     | Yes     | true          | [] (or minimal)          |
| Any      | terminal           | No      | Any           | []                       |
| Any      | opponent_replying  | No      | Any           | []                       |
| Any      | branch transition  | —       | —             | ["continue_from_here"]   |

---

## 6. Assisted View Before/After

**Before**: Coach card could render Hint, Reveal Move, Show Plan, Analyze Idea, etc. even in Assisted (teaching) mode.

**After**: Policy forces `[]` for Assisted View on active teaching frames. Coach + board visuals are the only teaching surface.

---

## 7. Plain View Before/After

**Before**: Plain View (recall) often showed the move in the coach card and too many buttons.

**After** (enforced in both app layer and snapshot):
- Default safe copy: Title = "Find the move", Body = "Try to recall the best continuation from this position."
- Buttons: Only Hint + Reveal Move before `answerShown`.
- No SAN/UCI/from/to or "Play X" before help (enforcement added).

---

## 8. Hint / Reveal Data Contract

- **Hint**: Consumes `CurrentInstructionFrame.target` + Brain evidence (theme/plan/piece) when available. Progressive ladder implemented in spirit via policy + copy paths.
- **Reveal Move** (`reveal_move` canonical): Must use `CurrentInstructionFrame.target` exactly. Blocked safely when no target. Normalized in handlers and debug.

---

## 9. Removed MVP Controls

Removed (or suppressed via policy) from visible MVP UI:
- Attack, Defense, Plan (as visible buttons)
- Show Plan
- Analyze Idea
- Reveal Next Move / Show Move (consolidated to Reveal Move)
- Legacy labels cleaned in CoachCard

Internal concepts (for Brain/visual model) remain where useful.

---

## 10. Debug Truth Before/After (Qd8# Terminal Example)

**Before** (user's observed live snapshot):
- warnings included non-applicable items
- piece/targetMismatchCount inflated by candidate_history
- actionDebugIsHistorical = false on stale reveal
- effectiveCoachOwner not clearly terminal_surface

**After** (in snapshot builder):
- warnings = [] for terminal frames
- mismatch counts = 0 (candidate_history/superseded excluded)
- actionDebugIsHistorical = true for stale actions after terminal
- effectiveCoachOwner = "terminal_surface"
- currentContinuationRuntimeStatus / Reason correctly exposed

---

## 11. Experience Selector

The clean expandable 6-level selector (New → Expert with icons, Elo bands, descriptions) was part of the original mission scope but was not the focus of the "Continue" / "Complete everything" execution in this session. Core policy/debug work took priority.

---

## 12. Test Results

**Full validation suite executed repeatedly**:
- tsc: Clean (final runs)
- build: Successful
- trainer-debug: Mostly passing (core suites green; some new regression assertions still need tuning)
- multi-move-qa: PASSED
- coach-quality: PASSED
- debugProdParity: PASSED
- brainTeachingFrameGolden: PASSED

Many of the 66+ specific required tests were added (policy matrix, Plain View safe copy, removed controls, terminal Qd8# exact shape, historical action, etc.). Not every single one reached a passing state in the final run.

---

## 13. Live Browser QA

**Status**: Not fully executed end-to-end in this environment.

**Reason**: Background `npm run dev` tasks are hard-limited to ~5 minutes in this tool/runtime (repeatedly observed across the entire conversation history).

**Preparation**:
- Code is in a state where the 4 flows (Assisted, Plain, Continuation→terminal, Experience selector) can be manually verified.
- Exact instructions were provided in prior turns (start dev server in your Codespace terminal, use Ports tab, `?debug=1`, cleared storage, follow the 4 flows).

When the user runs the QA themselves with the current codebase, the policy, Plain View safeguards, and terminal snapshot improvements should be observable.

---

## 14. Remaining Risks / Gaps

- Some newly added regression tests have assertion mismatches (snapshot builder vs test expectations on edge Plain View / terminal shapes).
- Full live browser QA with cleared storage + `?debug=1` on the precise Qd8# terminal frame not executed here due to environment timeout.
- Experience selector UI (the clean 6-level version) was deprioritized in favor of the core action policy + debug truth work.
- Not every one of the 66+ exact test cases listed in the original mission prompt was implemented and passing.

---

## 15. Checkpoint Commit / Tag

**Not created.**

Per the mission rules: only create the source-only commit + tag `v2.7.39-solid-action-cleanup-checkpoint` if genuinely green on all criteria. We are not at that point.

---

**Final Statement**

Significant, production-grade progress was made on the hardest parts of the mission (single-source action policy, Plain View recall safeguards, terminal debug truth, and many supporting tests). The codebase is materially cleaner and more truthful than at the start of this "Complete everything" directive.

However, because not every sub-requirement reached a clean, passing, verifiable state (especially full test battery + live browser QA), the honest verdict remains **NOT PASSED**.

The work can be continued from this strong foundation in a follow-up session.

---

*Report generated after aggressive execution of the "Complete everything" request. All prior interim reports remain in the same docs folder for audit trail.*