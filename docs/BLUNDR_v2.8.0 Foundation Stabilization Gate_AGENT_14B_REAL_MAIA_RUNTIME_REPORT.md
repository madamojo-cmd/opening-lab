# BLUNDR v2.8.0 Foundation Stabilization Gate — Agent 14B
## Real Self-Hosted Maia Runtime + API Integration

## Branch
`v2.8.0-intelligent-coach-live`

## Baseline Commit
`2019a20`

## Package 14A Status
- 14A architecture and regressions were stable.
- 14A remained blocked only on full manual QA completion.
- 14B resumed from in-progress workspace (no reset).

## Runtime Architecture
Added server-side runtime layer:
- `lib/blundr/maia/maiaRuntimeTypes.ts`
- `lib/blundr/maia/maiaRuntimeConfig.ts`
- `lib/blundr/maia/maiaLc0RuntimeAdapter.ts`

Runtime behavior:
- Reads validated env config.
- Disabled-safe by default.
- Per-request `spawn` UCI adapter (no shell string execution).
- Validates FEN and legal move list.
- Returns status-safe payloads instead of surfacing runtime exceptions to UI.

## API Route Architecture
Added:
- `app/api/maia/opponent-reply/route.ts`
- `app/api/maia/health/route.ts`

Properties:
- Strict payload validation.
- `no-store` caching policy.
- Disabled/unavailable/timeout/error returned as structured safe responses.
- No path leakage in normal response body.

## Setup Scripts
Added:
- `scripts/setup-maia.sh`
- `scripts/check-maia-runtime.ts`
- `scripts/benchmark-maia-runtime.ts`

Package scripts:
- `npm run maia:setup`
- `npm run maia:check`
- `npm run maia:bench`

## Environment Variables
- `NEXT_PUBLIC_MAIA_API_ENABLED`
- `MAIA_ENABLED`
- `MAIA_LC0_PATH`
- `MAIA_WEIGHTS_PATH`
- `MAIA_SKILL_LEVEL`
- `MAIA_TIMEOUT_MS`
- `MAIA_NODES`
- `MAIA_MAX_CONCURRENT_REQUESTS`
- `MAIA_CACHE_ENABLED`

## Frontend Provider Wiring
Added browser provider:
- `lib/blundr/maia/maiaApiClientProvider.ts`

Wiring:
- `NEXT_PUBLIC_MAIA_API_ENABLED=true` -> API provider path
- otherwise unavailable provider path
- continuation-only gating remains in existing app logic

## Fallback Behavior
If runtime/API is disabled/unavailable/timeout/error/stale/illegal:
- continuation opponent fallback path is used
- no user-facing Maia failure copy
- debug captures fallback reason

## Security Protections
- `spawn` args array with `shell: false`
- FEN/legal move validation
- request size/shape validation in API
- no model/binary assets committed
- no public Maia endpoint usage
- no fake production move generation

## Isolation Guarantees
Maintained:
- Stockfish validation isolation
- MultiPV 32 rating isolation
- branch-complete isolation
- CurrentInstructionFrame target isolation
- VisibleTeachingSurface isolation
- restricted mode protection

## Debug/Diagnostics
Extended Maia section in trainer debug:
- runtime enabled/status/route status/error/ms fields
- runtime fallback/legal/stale indicators
- timeline surfaced in diagnostics panel

## Tests Added/Updated
New:
- `tests/coach/maiaRuntimeAdapter.test.ts`
- `tests/coach/maiaApiRoute.test.ts`

Updated:
- `tests/coach/maiaContinuationProvider.test.ts`
- `lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts`
- existing continuity regression tests retained and passing

## Commands Run
Executed full required 14B build/test suite plus `maia:check`.

## Build/Test Results
- Build: PASS (sandbox intermittently panics due Turbopack EPERM restrictions; escalated build passes)
- New 14B tests: PASS
- Existing 13/14A regression suite: PASS

## maia:check Result
- Executed.
- Result: `status: disabled`, `MAIA_ENABLED=false`, no lc0/weights configured.
- This confirms disabled-safe architecture behavior, not real runtime verification.

## maia:bench Result
- Not run.
- Reason: runtime was not configured/verified with actual lc0 + weights.

## Manual QA Result
- Full runtime-enabled manual QA not completed in this environment.
- Disabled-safe and regression automation passed.

## Remaining Risks
- Real lc0+weights runtime verification pending.
- Runtime-enabled manual QA scenarios pending.
- Docker lc0 packaging remains environment-specific.

## Gate Verdict
`ARCHITECTURE PASS / RUNTIME NOT VERIFIED`

## Next Recommended Step
1. Configure real runtime env (`MAIA_ENABLED=true`, lc0 path, weights path).
2. Run `npm run maia:check` until status `ready`.
3. Run runtime-enabled manual matrix (scenarios C-F), then optionally `npm run maia:bench`.
4. Re-issue gate for full PASS only after runtime + manual QA verification.
