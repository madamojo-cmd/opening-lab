# Stage 2 Baseline Snapshot (Phase A)
Date: 2026-06-11
Scope: Audit/documentation only

## 1. Git Baseline
- Current branch: `work/stage2-plan-and-foundation`
- HEAD commit: `39b2b4a`
- Working tree status (`git status --short`):
  - `?? create_blundr_review_bundle.sh`
  - `?? create_blundr_review_bundle_zip.sh`
  - `?? docs/2026-06-11/`
  - `?? docs/roadmaps/`
  - `?? docs30/`

## 2. Latest 10 Commits (`git log --oneline -10`)
1. `39b2b4a` Complete Stage 1 coach safety and debug health validation
2. `9865aae` Validate Maia moves by request FEN and promote continuation targets
3. `5096d10` Restore branch-complete controls at restricted line exhaustion
4. `7484fb1` Enable browser Stockfish provider fallback
5. `b3bba74` Stabilize continuation target authority
6. `6e918e6` Add Maia debug timeline module
7. `674f05d` Pending changes exported from your codespace
8. `96a162b` Add self-hosted Maia runtime architecture
9. `2019a20` Stabilize Stockfish validation, ratings, and branch completion
10. `1484442` Stabilize v2.8.0 continuation flow

## 3. Package Scripts (`package.json`)
- `dev`: `next dev`
- `build`: `next build`
- `start`: `next start`
- `copy-stockfish`: `node scripts/copy-stockfish.js`
- `postinstall`: `node scripts/copy-stockfish.js`
- `maia:setup`: `bash scripts/setup-maia.sh`
- `maia:check`: `node --import tsx scripts/check-maia-runtime.ts`
- `maia:bench`: `node --import tsx scripts/benchmark-maia-runtime.ts`
- `test:coach-quality`: `node --import tsx lib/blundr/coachQuality/testCoachQuality.ts`
- `test:trainer-debug`: `tsx lib/blundr/debug/testTrainerDebug.ts`
- `test:multi-move-qa`: `RUN_MULTI_MOVE_QA=1 tsx lib/blundr/debug/testMultiMoveTrainingQa.ts`

## 4. Available Test Commands
From package scripts:
- `npm run test:coach-quality`
- `npm run test:trainer-debug`
- `npm run test:multi-move-qa`

Coach test suite present under `tests/coach/` (45 files via `find tests -type f`).

## 5. Relevant Chess/Test Dependencies
Dependencies:
- `chess.js`
- `stockfish`
- `next`
- `react`
- `react-dom`

Dev/test execution dependencies:
- `tsx`
- `typescript`
- `@types/node`
- `@types/react`
- `@types/react-dom`

## 6. Stage 1 Baseline Test Results
Commands run (Phase A baseline):
1. `npm run test:coach-quality`
2. `npm run test:trainer-debug` (sandbox run)
3. `npm run test:trainer-debug` (escalated rerun after sandbox EPERM)
4. `npm run test:multi-move-qa` (sandbox run)
5. `npm run test:multi-move-qa` (escalated rerun after sandbox EPERM)

### Result Summary
- Passed: 2
- Failed: 1
- Blocked by sandbox on first attempt: 2 commands (both `tsx` commands hit EPERM IPC/listen; both rerun)

### Detailed Output Summary
`npm run test:coach-quality`:
- Exit code: `0`
- Key output:
  - `Running Blundr coach-quality QA...`
  - `✓ coach explanation pipeline passed`
  - `✓ Blundr coach-quality QA passed`

`npm run test:trainer-debug` (escalated rerun):
- Exit code: `1`
- Failure:
  - `AssertionError [ERR_ASSERTION]: Expected values to be strictly equal: false !== true`
  - At: `lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:271:10`
  - Called from: `lib/blundr/debug/testTrainerDebug.ts:13:3`

`npm run test:multi-move-qa` (escalated rerun):
- Exit code: `0`
- Key output:
  - `Running Blundr multi-move QA...`
  - `✓ Blundr multi-move QA passed`

## 7. Baseline Assessment
- Stage 1 baseline is not fully green because `test:trainer-debug` currently fails with an assertion in `trainerDebugSnapshot.test.ts`.
- This is a Phase A finding only; no production/runtime code was changed.
