# Package 11.1D Complete / Blocked

## Branch
`v2.8.0-intelligent-coach-live`

## Failure Reproduced?
Yes. Prior diagnostics showed exhausted restricted line states still rendering `opponent_replying` with no Continue/Restart actions.

## Root Cause
Opponent scheduling/pending state could remain active across true restricted-line exhaustion, and UI surface ownership was not strictly latched to a branch-complete eligibility contract at that boundary.

## Branch-Complete Contract Helper
Added pure helper: `resolveBranchCompleteContract(...)` in `lib/blundr/runtime/branchCompleteContract.ts`.
It computes and returns:
- `branchCompleteEligible`
- `reason`
- `blockedReason`
- `shouldCancelPendingOpponent`
- `shouldPreventOpponentScheduling`
- `shouldRenderBranchCompleteSurface`
- `requiredSurfaceActionIds`
- `lineExhaustedEvidence`
- `afterFinalUserMove`
- `pendingOpponentRequestConflict`

## Branch-Complete Latch Fix
`app/page.tsx` now keeps a branch-complete latch and preserves it across stale opponent async paths until explicit reset actions (`continue`, `restart`, reset/change-line flows).

## Opponent Scheduling Fix
Scheduling paths now check branch-complete contract first:
- Prevents new opponent scheduling when eligible.
- Cancels stale pending opponent requests on conflict.
- Ignores stale opponent flow from overriding exhausted-line branch-complete surface.

## CurrentInstructionFrame Priority Fix
`app/page.tsx` frame construction now prioritizes:
1. terminal
2. branch_complete
3. other transitional/guided states
so branch-complete beats opponent-replying at true line end.

## Surface Action Rendering Fix
At branch-complete, surface/actions are sourced from v2.8 visible surface pipeline and include required actions:
- `continue_from_here`
- `restart_line`

## Runtime Critical Added
Added hard diagnostic in `lib/blundr/debug/trainerDebugSnapshot.ts`:
- `exhausted_line_without_branch_complete_surface`
Raised only for genuine exhausted-line stuck states; not raised for valid pending-opponent transitions that still have required follow-up targets.

## Tests Added
- `tests/coach/branchCompleteContract.test.ts`
Includes required scenario assertions for branch-complete eligibility, stale pending conflict, and surface action ownership.

## Commands Run
See:
- `.agent_runs/.../command_log.md` for full output.
- Initial `npm run build` failed in sandbox due Turbopack worker port bind restriction (`EPERM`); escalated rerun passed.

## Results
Automated required suite passed after escalation-enabled build:
- `npm run build`
- `node --import tsx tests/coach/branchCompleteContract.test.ts`
- `node --import tsx tests/coach/liveChainSmoke.test.ts`
- `node --import tsx tests/coach/browserContract.test.ts`
- `node --import tsx tests/coach/plainLeak.test.ts`
- `node --import tsx tests/coach/showMoreVisualReveal.test.ts`
- `node --import tsx tests/coach/visibleTeachingSurface.test.ts`
- `node --import tsx tests/coach/uiSurfaceAdapter.test.ts`
- `node --import tsx tests/coach/currentInstructionFrame.test.ts`
- `node --import tsx lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts`

## Manual QA Result
Partial only:
- Dev server reachable (`HTTP 200` at `http://localhost:3000`).
- Full interactive end-of-line click-through (final line move -> branch_complete -> Continue -> continuation candidate) was not fully executed in this CLI-only run.

## Remaining Risks
- Manual end-to-end UI confirmation remains required for strict gate pass criteria.
- Existing dev log still contains historical React dependency-array-size warning entries; not part of 11.1D functional contract but should be audited separately.

## Gate Verdict
BLOCKED (strict-policy)

Automated contract/test gates passed, but strict 11.1D instructions require full manual branch-complete click-through confirmation before PASS.

## Next Recommended Step
Perform the required manual restricted-line completion flow in-browser and capture debug panel values proving:
- `visibleSurfaceMode=branch_complete`
- `continueFromHereButtonRendered=true`
- `trainAgainButtonRendered=true`
- `pendingOpponentRequest` cleared/obsolete
Then flip verdict to PASS.
