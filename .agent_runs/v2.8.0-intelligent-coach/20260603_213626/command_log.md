# Command Log — Package 14B Resume

- git status --short
- git diff --stat
- git log --oneline -12
- ls lib/blundr/maia
- ls app/api/maia
- ls scripts | grep maia
- ls tests/coach | grep maia
- npm run build
- node --import tsx tests/coach/maiaRuntimeAdapter.test.ts
- node --import tsx tests/coach/maiaApiRoute.test.ts
- node --import tsx tests/coach/maiaContinuationProvider.test.ts
- node --import tsx tests/coach/continuationFlowStability.test.ts
- node --import tsx tests/coach/browserContract.test.ts
- node --import tsx tests/coach/liveChainSmoke.test.ts
- node --import tsx tests/coach/branchCompleteRegressionAfterStockfish.test.ts
- node --import tsx tests/coach/branchCompleteContract.test.ts
- node --import tsx tests/coach/stockfishValidationGate.test.ts
- node --import tsx tests/coach/moveStrengthBadge.test.ts
- node --import tsx tests/coach/plainLeak.test.ts
- node --import tsx tests/coach/showMoreVisualReveal.test.ts
- node --import tsx tests/coach/visibleTeachingSurface.test.ts
- node --import tsx tests/coach/uiSurfaceAdapter.test.ts
- node --import tsx tests/coach/currentInstructionFrame.test.ts
- node --import tsx lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts
- npm run maia:check

## Notes
- `npm run build` in sandbox intermittently fails with Turbopack OS EPERM port/process binding restrictions; escalated build passed.
- `maia:check` executed and returned `status: disabled` with exit code 1 due `MAIA_ENABLED=false`.
- `maia:bench` not run because runtime is not configured/verified (per package rule).
