# Package 4 Risk Register - CurrentInstructionFrame Runtime Authority

## Risks Consumed from Package 3
- Canonical chain remains not fully wired; runtime authority hardening is pre-wiring.
- Legacy bypass paths in `app/page.tsx` remain active by design.
- Browser runner remains unavailable for executable browser-contract assertions.

## Package 4 Residual Risks
- `buildCurrentInstructionFrame` now supports both legacy and canonical inputs; dual-path maintenance risk remains until full migration.
- Canonical frame invariant violations currently produce critical debug issues (non-throw behavior) for most invalid states; downstream consumers must honor these issues.
- Continuation candidate structural checks are UCI-shape only; board-truth legality validation remains deferred.
- No UI/surface wiring changes were made in this package, so visible-path bypasses are still unresolved.

## Package 4 Blocking Risks
- None.

## Net Gate
- Package 4 can pass with runtime authority hardening complete and migration risks documented.
