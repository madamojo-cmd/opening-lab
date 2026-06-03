# Package 4 Command Log - CurrentInstructionFrame Runtime Authority

## Prerequisite Reads
- `cat docs/BLUNDR_v2.8.0 Foundation Stabilization Gate_AGENT_1_AUTHORITY_AUDIT_REPORT.md` (exit 0)
- `cat docs/BLUNDR_v2.8.0 Foundation Stabilization Gate_AGENT_1_LEGACY_BYPASS_MAP.md` (exit 0)
- `cat docs/BLUNDR_v2.8.0 Foundation Stabilization Gate_AGENT_2_CORE_CONTRACTS_REPORT.md` (exit 0)
- `cat docs/BLUNDR_v2.8.0 Foundation Stabilization Gate_AGENT_3_GROUND_TRUTH_TEST_HARNESS_REPORT.md` (exit 0)
- `cat .agent_runs/v2.8.0-intelligent-coach/20260603_132209/state.json` (exit 0)
- `cat .agent_runs/v2.8.0-intelligent-coach/20260603_132209/risk_register.md` (exit 0)

## Step A - Inspect runtime and tests
- `git branch --show-current`
  - output: `v2.8.0-intelligent-coach-live`
- `git status --short`
  - output included untracked package prompt files only before Package 4 edits.
- `find lib/blundr/runtime -maxdepth 3 -type f | sort`
  - output included:
    - `lib/blundr/runtime/currentInstructionTarget.ts`
    - `lib/blundr/runtime/currentInstructionFrame.ts`
    - `lib/blundr/runtime/instructionFrameLock.ts`
    - `lib/blundr/runtime/continuationRuntimeState.ts`
- `find tests/coach -maxdepth 2 -type f | sort`
  - output included Package 3 contract/harness tests.
- `git grep -n "buildCurrentInstructionFrame\|CurrentInstructionFrame\|CurrentInstructionTarget\|instructionFrameLock\|continuationRuntimeState" lib app components tests || true`
  - output confirmed heavy use in `app/page.tsx`, runtime, and coach tests.
- `git grep -n "expectedMoveResolution\|expectedMovesForValidation\|continuationPolicyCandidate\|hardEndOfBookGate\|selectedLineComplete\|curatedCompleteHere" app lib tests || true`
  - output confirmed active legacy parallel orchestration paths in `app/page.tsx` and debug tests.

## Validation
- `npm run build`
  - first run exit 1 due type narrowing issue in `currentInstructionFrame.ts`.
  - fixed code path.
- `npm run build`
  - second run exit 0 (pass).
- `node --import tsx tests/coach/currentInstructionFrame.test.ts`
  - exit 0 (`currentInstructionFrame ok`)
- `node --import tsx tests/coach/typeContracts.test.ts`
  - exit 0 (`typeContracts ok`)
- `node --import tsx tests/coach/goldenPositions.test.ts`
  - exit 0 (`goldenPositions ok`)
- `node --import tsx tests/coach/targetInvariant.test.ts`
  - exit 0 (`targetInvariant ok`)
- `node --import tsx tests/coach/continuationFlow.test.ts`
  - exit 0 (`continuationFlow ok`)
- `node --import tsx tests/coach/plainLeak.test.ts`
  - exit 0 (`plainLeak ok`)
- `node --import tsx tests/coach/showMoreVisualReveal.test.ts`
  - exit 0 (`showMoreVisualReveal ok`)
- `node --import tsx tests/coach/providerFailure.test.ts`
  - exit 0 (`providerFailure ok`)
- `node --import tsx tests/coach/antiHallucination.test.ts`
  - exit 0 (`antiHallucination ok`)
- `node --import tsx tests/coach/browserContract.test.ts`
  - exit 0 (`browserContract ok`)

## Script Availability Notes
- `package.json` does not provide `npm test` script.
- `package.json` does not provide `npm run lint` script.

## Final Verification
- `git status --short`
- `git diff --stat`
