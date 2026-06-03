# BLUNDR v2.8.0 Foundation Stabilization Gate
## Agent 10.5C Report — False Safety Block Repair for Valid Teaching Frames

- Timestamp (UTC): 2026-06-03T15:53:17Z
- Branch: `v2.8.0-intelligent-coach-live`
- Package: `10.5C`

## Failure Reproduced
Yes.

Observed invalid behavior on valid teaching frames:
- `visibleTitle: Safety Blocked`
- `visibleBody: No move-specific coaching is available in this frame.`

even while target/piece/alignment evidence was valid.

## Root Cause
Two safety-policy defects caused false blocked surfaces:

1. Piece normalization mismatch in target invariants
- `frame.target.pieceType` can be shorthand (`p`, `n`, etc.) while compiled slots used normalized names (`pawn`, `knight`, ...).
- This produced false `piece_mismatch` critical issues and converted valid teaching frames to blocked mode.

2. Plain leak detector treated one-letter piece codes as leak tokens
- `pieceType: "p"` was treated as a direct token, matching almost any plain text and falsely triggering `plain_leak`.
- This also forced blocked mode on valid frames.

Secondary policy issue:
- claim-validation/strong-claim failures were treated as fatal blocks in UI mode selection, even when they were recoverable through safe target-aligned downgrade copy.

## False Safety Block Cause
`mode: blocked` was being selected when safety output had critical issues from false `piece_mismatch` / false `plain_leak`, and for recoverable claim-validation issues that should have been downgraded instead of blocked.

## Files Changed
- `lib/blundr/safety/targetInvariantPolicy.ts`
- `lib/blundr/safety/plainLeakPolicy.ts`
- `lib/blundr/safety/coachSafetyGate.ts`
- `lib/blundr/safety/safeFallbackFrame.ts`
- `lib/blundr/safety/types.ts`
- `lib/blundr/presentation/buildVisibleTeachingSurface.ts`
- `lib/blundr/presentation/types.ts`
- `app/page.tsx`
- `tests/coach/coachSafetyGate.test.ts`
- `tests/coach/visibleTeachingSurface.test.ts`
- `tests/coach/uiSurfaceAdapter.test.ts`
- `tests/coach/liveChainSmoke.test.ts`
- `tests/coach/antiHallucination.test.ts`
- `tests/coach/browserContract.test.ts`

## Fatal vs Recoverable Safety Policy
Implemented split in `runCoachSafetyGate`:

Fatal (blocks surface):
- target/reveal/visual/graph/compiler mismatches
- piece mismatch (true mismatch after normalization)
- plain leak (true leak after normalized token checks)
- provider authority and null-target violations

Recoverable (downgrade, do not block surface):
- `claim_without_evidence`
- `unsupported_strong_claim`

For recoverable-only issues:
- `result.allowed = true`
- `safeFrame` rebuilt as safe target-aligned teaching copy
- blocked mode is not selected

## Valid Teaching Frame Behavior
Now valid aligned frames no longer collapse to blocked copy due shorthand piece tokens.

Examples covered by tests:
- d2d4 (piece `p`) remains assisted, not blocked.
- b1c3 (piece `n`) recoverable claim-validation path yields:
  - move-specific title/body
  - not `Safety Blocked`
  - surface `blocked=false`

## Debug Fields Added
`VisibleTeachingSurface.safety` now includes:
- `blocked`
- `blockedReason`
- `blockedSeverity`
- `blockedPolicy`
- `targetMismatch`
- `pieceMismatch`
- `visualMismatch`
- `revealMismatch`
- `plainLeakDetected`
- `unsupportedStrongClaim`
- `recoveredBySafeTeachingCopy`

## Tests Added or Updated
Added/updated coverage in:
- `tests/coach/visibleTeachingSurface.test.ts`
- `tests/coach/uiSurfaceAdapter.test.ts`
- `tests/coach/coachSafetyGate.test.ts`
- `tests/coach/liveChainSmoke.test.ts`
- `tests/coach/browserContract.test.ts`
- `tests/coach/antiHallucination.test.ts`

Includes regression case:
- `valid_knight_development_claim_validation_failed_recovers_to_teaching_copy` (in `coachSafetyGate.test.ts`)

## Commands Run
See:
- `.agent_runs/v2.8.0-intelligent-coach/20260603_155317/command_log.md`

## Results
- Build: PASS after unsandboxed rerun (sandbox Turbopack permission issue first)
- Required test suite: PASS (antiHallucination failed initially, then passed after policy-aligned test update)

## Manual Live QA Performed?
No.

## Manual Live QA Results
Not executed in this environment.

## Remaining Risks
1. Manual browser verification is still required for final runtime confidence.
2. Timeline/debug parity path in `app/page.tsx` still relies partly on presentation/decision paths and may diverge in rare transitions.

## Gate Verdict
Package 10.5C: **pass with unresolved manual-live-QA risk**.
