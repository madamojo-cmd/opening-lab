# 14B.4 Manual QA Defect Repair

## Outcome
- Status: `blocked_on_manual_browser_qa`
- Branch: `v2.8.0-intelligent-coach-live`
- Baseline: `96a162b`

## Completed
- Debug-mode crash hardening in copy + serialization paths.
- Continuation no-target generic status suppression + recovery guard.
- Board input hard guard for opponent turn.
- Continuation lifecycle diagnostic fields and critical-issue emissions.
- Added package tests:
  - `debugPageCrashRegression`
  - `continuationCandidateLifecycle`
  - `opponentTurnInputGuard`

## Verification
- Build passed (escalated run).
- Required test suite commands passed.
- Maia checks passed when runtime env enabled.

## Blocker
- User-required real browser QA gate (`/?debug=1` and long continuation interaction) not executable end-to-end from this CLI-only environment.
