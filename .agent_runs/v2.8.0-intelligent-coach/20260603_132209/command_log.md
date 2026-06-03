# Package 3 Command Log - Ground-Truth Test Harness First

## Prerequisite Reads
- `cat docs/BLUNDR_v2.8.0 Foundation Stabilization Gate_AGENT_2_CORE_CONTRACTS_REPORT.md`
  - exit: 0
- `cat .agent_runs/v2.8.0-intelligent-coach/20260603_131209/state.json`
  - exit: 0
- `cat .agent_runs/v2.8.0-intelligent-coach/20260603_131209/risk_register.md`
  - exit: 0

## Step A - Inspect test setup
- `git branch --show-current`
  - exit: 0
  - output: `v2.8.0-intelligent-coach-live`
- `git status --short`
  - exit: 0
  - output (excerpt):
    - `?? BLUNDR_v2.8.0_INTELLIGENT_COACH_LIVE_VERSION_ROADMAP.md`
    - `?? BLUNDR_v2.8.0_PACKAGE_0_CODEX_PROMPT.md`
- `cat package.json`
  - exit: 0
  - output confirms scripts:
    - `build`, `test:coach-quality`, `test:trainer-debug`, `test:multi-move-qa`
  - output confirms no `npm test` script and no `lint` script.
- `find tests -maxdepth 4 -type f | sort || true`
  - exit: 0
  - output included existing `tests/coach/typeContracts.test.ts` before Package 3 additions.
- `find data -maxdepth 4 -type f | sort || true`
  - exit: 0
  - output: empty before Package 3 additions.
- `git grep -n "describe(\\|it(\\|test(\\|expect(" tests lib app components || true`
  - exit: 0
  - output captured broad matches (regex helpers and test references across repo).

## Step E - Anti-false-test rules audit
- `git grep -n "\\.skip\\|\\.only\\|todo\\|FIXME test\\|return true\\|expect(true).toBe(true)" tests app components lib || true`
  - exit: 0
  - output includes many unrelated `return true` matches in production code and helper files.
  - output did not show `.skip`, `.only`, `todo`, `expect(true).toBe(true)` in newly created Package 3 tests.

## Step F - Validation
- `npm run build`
  - exit: 0
  - output: Next.js production build and TypeScript completed successfully.

### Coach harness tests (closest available command style)
- `node --import tsx tests/coach/goldenPositions.test.ts`
  - exit: 0
  - output: `goldenPositions ok`
- `node --import tsx tests/coach/targetInvariant.test.ts`
  - exit: 0
  - output: `targetInvariant ok`
- `node --import tsx tests/coach/plainLeak.test.ts`
  - exit: 0
  - output: `plainLeak ok`
- `node --import tsx tests/coach/showMoreVisualReveal.test.ts`
  - exit: 0
  - output: `showMoreVisualReveal ok`
- `node --import tsx tests/coach/providerFailure.test.ts`
  - first run exit: 1
  - failure cause: missing `maiaOwnsTarget` field in one fixture (`maia_unavailable`).
  - fix applied to `data/goldenMaiaFixtures.json`.
- `node --import tsx tests/coach/providerFailure.test.ts`
  - second run exit: 0
  - output: `providerFailure ok`
- `node --import tsx tests/coach/continuationFlow.test.ts`
  - exit: 0
  - output: `continuationFlow ok`
- `node --import tsx tests/coach/antiHallucination.test.ts`
  - exit: 0
  - output: `antiHallucination ok`
- `node --import tsx tests/coach/browserContract.test.ts`
  - exit: 0
  - output: `browserContract ok`
- `node --import tsx tests/coach/typeContracts.test.ts`
  - exit: 0
  - output: `typeContracts ok`

## Step I - Final verification
- `git status --short`
- `git diff --stat`
- `git grep -n "\\.skip\\|\\.only\\|todo\\|FIXME test\\|return true\\|expect(true).toBe(true)" tests/coach || true`
  - exit: 0
  - output: no matches in `tests/coach`.
