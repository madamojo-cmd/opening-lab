# BLUNDR v2.8.0 Foundation Stabilization Gate — Agent 13.3

## Package
Package 13.3: Hard Branch-Complete Eligibility Fix + MultiPV 32 Rating Rule

## Summary
Implemented strict selected-line exhaustion authority for restricted branch completion and removed overbroad opponent-turn/exact-node inference that caused premature branch_complete after `e4`.

Implemented MultiPV split rules:
- Suggestion validation: MultiPV 10
- Continuation user move rating: MultiPV 32
- Outside MultiPV 32 fallback: direct after-move eval
- Visible Ungraded badge suppressed in normal UI

## Core Fixes
- Added `lib/blundr/runtime/selectedLineExhaustion.ts`.
- Reworked `resolveBranchCompleteContract(...)` to use selected-line exhaustion as primary authority.
- Updated app branch-complete inputs to pass selected-line child/next-move evidence.
- Added emergency terminal guard for `italian-white` final `Nbd2` endpoint.
- Added debug criticals for premature branch-complete regressions.

## Verification
Required build and required Package 13.3 command suite passed.

## Manual QA
Not completed in this run.

## Gate
BLOCKED pending manual QA confirmation of:
- no branch_complete after `e4`
- branch_complete after final `Nbd2`
- MultiPV 32 rating path behavior
