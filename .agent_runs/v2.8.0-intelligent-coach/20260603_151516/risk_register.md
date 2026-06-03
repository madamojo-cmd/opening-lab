# Package 8.5 Risk Register - Headless Live Chain Smoke Test

## Risks Consumed From Package 8
- SafetyGate behavior now covered by end-to-end chain smoke validation.
- Plain leak / mismatch / strong claim trap coverage added at chain level.

## Package 8.5 Residual Risks
- Validation is headless and does not yet prove final UI/presentation integration behavior.
- Legacy bypass paths remain unresolved and out of scope for this package.

## Package 8.5 Blocking Risks
- None.

## Package 9 Residual Risks
- `app/page.tsx` still consumes the legacy `buildVisibleTeachingSurface` shape; Package 9 added a compatibility branch to avoid UI edits, but full UI migration remains pending for Package 10.
- Existing legacy presentation test files under `lib/blundr/presentation/__tests__` still target the old surface contract and were not rewritten in this package scope.
- Deterministic surface contract is now implemented and tested headlessly, but final user-visible wiring parity is still deferred.

## Package 10 Residual Risks
- `app/page.tsx` currently uses a compatibility shim object to bridge canonical `VisibleTeachingSurface` into existing UI field expectations; this should be reduced in Package 10.5/11.
- Legacy bypass code paths remain present by design and were not removed in this package.
- Browser/manual QA was not performed; current validation is build + headless contract tests.

## Package 10.5 Residual Risks
- Legacy bypass paths are still present by scope and were not removed yet (deferred to Package 11).
- Manual browser QA was not executed in this run environment; validation remains build + headless tests.
- `app/page.tsx` still includes a v2.8 compatibility surface bridge to avoid broad refactor risk.

## Net Gate
- Package 8.5 can pass with deterministic headless live-chain validation complete and presentation wiring deferred.
- Package 9 can pass for contract-complete VisibleTeachingSurface builder with UI wiring deferred to Package 10.
- Package 10 can pass for feature-flagged UI integration via safe adapters while preserving legacy fallback.
- Package 10.5 can pass with canonical branch-complete repair, Safety Fallback suppression for valid null-target line-complete states, and strict teaching-frame diagnostics preserved.
