# Stage 2 Provider Warning Policy

## Purpose

This policy standardizes provider-role warnings, fallback truth, and debug-only reporting for Stage 2.

## Core Invariant

- `instructionTargetUci === coachMoveUci === visualTargetUci === acceptedTargetUci`
- Provider warnings may report only.
- Provider warnings may not create behavior or authority.

## Provider Roles

- `local_runtime_package`
  - Authoritative local runtime source for Stage 2 training.
  - Must remain `local_crawled_package`.
  - Live Lichess is not required for local training.

- `historical_lichess_source`
  - Historical/source data only.
  - Must not become runtime authority.
  - Live Lichess must remain disabled for normal Stage 2 local training.

- `maia`
  - Opponent-reply / continuation-assist role only where explicitly allowed.
  - Must not become user move authority.
  - Must not create continuation without the user gate.

- `stockfish`
  - Continuation validation / evaluation role only where allowed.
  - Must not become user move authority.
  - Unavailable Stockfish should degrade to safe fallback or warning state.

- `approved_content`
  - Exact-match enrichment role only.
  - Must not alter target authority.
  - Non-match may fall back safely when allowed.

- `safe_fallback`
  - Preserves lesson flow when primary enrichment is unavailable.
  - Must never override target authority.

- `debug_snapshot`
  - Debug reporting only.
  - No authority impact.

## Warning Taxonomy

- Severity levels: `info`, `warning`, `degraded`, `blocked`, `critical`
- User-facing warnings are reserved for real frame degradation.
- Debug-only warnings may describe local runtime health, provider availability, or fallback truth without interrupting training.

## Normal Local Training Expectations

- `runtimeDataSource = local_crawled_package`
- `liveLichessCalled = false`
- `local_runtime_loaded` should be reported as healthy/debug truth
- Local training must remain usable without live Lichess, Maia, or Stockfish

## Fallback Rules

- Safe fallback may preserve the lesson flow.
- Fallback truth must be reported explicitly.
- Approved content not matched is not a failure if a valid fallback is used.
- Provider warnings must not change move authority.

## Inventory / Tests

- Machine-readable policy: `data/blundr/stage2-provider-warning-policy.json`
- Provider warning helper: `lib/blundr/providers/providerWarningPolicy.ts`
- Debug coverage: `tests/coach/stage2ProviderWarningPolicy.test.ts`
- Debug truth coverage: `tests/coach/stage2ProviderWarningDebugTruth.test.ts`

