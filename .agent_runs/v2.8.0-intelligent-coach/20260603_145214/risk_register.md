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

## Net Gate
- Package 8.5 can pass with deterministic headless live-chain validation complete and presentation wiring deferred.
- Package 9 can pass for contract-complete VisibleTeachingSurface builder with UI wiring deferred to Package 10.
