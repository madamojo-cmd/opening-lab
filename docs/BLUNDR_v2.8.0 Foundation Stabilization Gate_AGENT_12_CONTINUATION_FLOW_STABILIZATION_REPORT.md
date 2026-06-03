# Package 12 Complete / Blocked

## Branch
`v2.8.0-intelligent-coach-live`

## Baseline Confirmed
Yes. Verified pre-flight commit history includes accepted Package 11.1D checkpoint (`0efefaa`).

## Failure Reproduced?
Yes. Package 12 addressed observed continuation instability patterns:
- user-turn continuation analyzing temporarily presenting as opponent status
- transient no-target continuation surfaces
- candidate/analyzing oscillation pressure
- weak terminal continuation polish and action parity gaps

## Root Cause
Continuation frame/state rendering was spread across runtime status, frame construction, and surface mode policies without one explicit continuation flow contract. Transitional continuation frames were being grouped into opponent status paths, and no-target continuation states could leak through assisted copy paths.

## Continuation State Machine Changes
Added pure helper:
- `lib/blundr/runtime/continuationFlowContract.ts`

`resolveContinuationFlowContract(...)` now classifies to:
- `idle_not_continuation`
- `branch_complete`
- `continuation_analyzing`
- `continuation_candidate_ready`
- `continuation_user_move_pending`
- `continuation_opponent_replying`
- `continuation_terminal`
- `continuation_error`

Includes required contract fields for rendering authority and invalid-state critical signaling.

## Analyzing Surface Fix
- Added visible mode `continuation_analyzing` to presentation types/policy.
- Continuation transitioning frames in user-turn analysis now map to `continuation_analyzing`, not `opponent_replying`.
- User-facing analyzing copy now renders:
  - title: `Finding a continuation`
  - body: `Blundr is choosing a training move from this position.`
- No target visuals or reveal actions are rendered in analyzing state.

## Candidate Lock / Oscillation Fix
In `app/page.tsx`:
- Added continuation lock metadata state:
  - `continuationCandidateLockId`
  - `continuationCandidateLockFen4`
  - `continuationCandidateLockRequestId`
  - `continuationCandidateLockUci`
  - `continuationCandidateLockSan`
  - `continuationCandidateLockSource`
  - `continuationCandidateLockReason`
- Added request sequence tracking and stale async guard checks.
- Added effective-candidate resolution (`lock` preferred on matching FEN/legal move).
- Added lock reset on board/FEN transition and continuation reset paths.

## No Target Elimination
- Continuation null-target assisted copy no longer emits `No Target` in normal flow.
- Compiler null-target continuation copy now uses safe status/analyzing copy.
- Added critical for impossible continuation user-turn null-target state:
  - `continuation_user_turn_without_candidate_or_analyzing`

## Terminal / Checkmate Polish
- Terminal visible surface now includes restart action from action policy (`restart_line`).
- Terminal copy updated to continuation-end framing:
  - `Line complete`
  - `This continuation ended in checkmate. Restart the line or train it again.`

## Action Parity Fix
- Added debug critical:
  - `surface_action_debug_parity_mismatch`
- Triggered when rendered action ids and surface action ids diverge in either direction.

## Continuation Copy Cleanup
- Removed strong-claim continuation phrasing in engine-best fallback and continuation assisted copy paths.
- Replaced with humble/legal continuation phrasing and concrete SAN/piece wording.

## Warning / Cache Classification
- Added cache classification fields in snapshot cache payload:
  - `cacheClassification: "not_applicable"`
  - `cacheClassificationReason: "cacheNotRequiredForVisibleSurface"`
- Diagnostics panel now reads explicit cache classification instead of generic warning spillover.

## Files Changed
- `app/page.tsx`
- `components/debug/BlundrDiagnosticsPanel.tsx`
- `lib/blundr/coachCompiler/compileCoachFrame.ts`
- `lib/blundr/debug/trainerDebugSnapshot.ts`
- `lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts`
- `lib/blundr/presentation/types.ts`
- `lib/blundr/presentation/modeSurfacePolicy.ts`
- `lib/blundr/presentation/copySurfaceBuilder.ts`
- `lib/blundr/presentation/actionPolicyBuilder.ts`
- `lib/blundr/runtime/continuationFlowContract.ts` (new)
- `tests/coach/continuationFlowStability.test.ts` (new)
- `tests/coach/browserContract.test.ts`
- `tests/coach/currentInstructionFrame.test.ts`
- `tests/coach/liveChainSmoke.test.ts`
- `tests/coach/uiSurfaceAdapter.test.ts`
- `tests/coach/visibleTeachingSurface.test.ts`

## Tests Added or Updated
Added:
- `tests/coach/continuationFlowStability.test.ts`

Updated:
- `tests/coach/branchCompleteContract.test.ts` (carried baseline)
- `tests/coach/liveChainSmoke.test.ts`
- `tests/coach/browserContract.test.ts`
- `tests/coach/visibleTeachingSurface.test.ts`
- `tests/coach/uiSurfaceAdapter.test.ts`
- `tests/coach/currentInstructionFrame.test.ts`
- `lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts`

## Commands Run
See command log:
- `.agent_runs/v2.8.0-intelligent-coach/20260603_185734/command_log.md`

Required automated suite passed (build required escalated rerun due sandbox Turbopack EPERM).

## Results
- `npm run build`: PASS (after escalated rerun)
- All required Package 12 listed tests: PASS
- `npm run dev` smoke: server started, home returned HTTP 200, no immediate runtime crash signature in server log.

## Manual QA Result
Partial only in this run.
- Completed: server boot smoke and command-level validation.
- Not fully completed in this CLI run: full interactive restricted-line -> continue -> candidate -> opponent -> terminal click-through with exported debug bundles.

## Remaining Risks
- Full manual acceptance checklist and required debug exports are still pending capture.
- Existing unrelated workspace changes remain present and untouched (`next-env.d.ts`, roadmap/prompt roots, `review_exports/`).

## Gate Verdict
BLOCKED

Rationale: automated gate is green, but Package 12 PASS criteria explicitly require complete manual interactive acceptance evidence and exports.

## Next Recommended Step
Run the required manual scenario in browser and capture all requested debug exports. If no `No Target`, no user-turn `opponent_replying`, no candidate oscillation, polished terminal restart action, and `criticalIssues: []`, then mark Package 12 PASS.
