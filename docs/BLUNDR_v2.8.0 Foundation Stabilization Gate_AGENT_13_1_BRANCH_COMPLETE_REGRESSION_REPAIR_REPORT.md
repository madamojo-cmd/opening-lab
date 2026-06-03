# BLUNDR v2.8.0 Foundation Stabilization Gate — Agent 13.1

## Package
Package 13.1: Emergency Branch-Complete Regression Repair After Stockfish Integration

## Regression Summary
Manual QA evidence showed the post-`Nbd2` restricted line completion frame regressed to `opponent_replying` with missing `continue_from_here` / `restart_line` actions.

## Root Cause
`resolveExpectedMoveForFrame(...)` intentionally returns `not_user_turn_or_not_ready` on opponent-turn frames, which removed `lineCursor/lineLength` evidence in the final restricted frame. Branch-complete eligibility then depended on exhausted signals that were absent in that frame and was not latched from explicit final-user-move terminal-node evidence.

## Fixes
- Added explicit final guided move exhaustion evidence to branch-complete contract:
  - `hasExactFenNode`
  - `finalGuidedUserMoveCompletedLine`
- Updated branch-complete reason to support final move completion:
  - `final_guided_user_move_completed_line`
- Added explicit final-move computation from exact terminal node + last user move in `app/page.tsx`.
- Added pending-opponent cancellation debug tracking:
  - `pendingOpponentRequestCancelledForBranchComplete`
  - `branchCompleteBlockedOpponentRequestId`
- Added debug critical for this regression class:
  - `restricted_line_exhausted_without_branch_complete_buttons`

## Tests
Added:
- `tests/coach/branchCompleteRegressionAfterStockfish.test.ts`
  - `final_guided_user_move_nbd2_renders_branch_complete_even_when_side_to_move_is_opponent`
  - `stockfish_provider_unavailable_does_not_block_restricted_branch_complete`

Revalidated required Package 13/13.1 suite (build + listed tests): PASS.

## Gate Status
- Automated checks: PASS
- Manual QA for exact Italian sequence and required debug export bundle: pending in this run
- Gate verdict for this run: BLOCKED (manual QA evidence required for PASS rule)
