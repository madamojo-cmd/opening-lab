# Stage 2 Sample Integration Spike Plan (Plan Only)

## Goal of next safe spike
- Run a one-opening, sample-only integration spike using already validated in-memory sample objects.

## Constraints for the spike
- sample-only adapter over provided objects only
- no filesystem auto-load
- no `app/page.tsx` wiring yet
- no global Stage 2 enablement
- one-opening only (`colle-white`)
- feature flag disabled by default

## Authority and policy invariants
- `CurrentInstructionFrame` remains target authority.
- `buildVisibleTeachingSurface` remains visible surface authority.
- Plain View no-leak policy is preserved.
- Assisted View and Show More parity is preserved.
- sample copy may render only when safe and target-aligned.

## Reversibility
- Any sample integration code path must be removable without affecting production data.
- Sample fixtures remain isolated in test/sample locations and do not become runtime defaults.

## Explicit non-goals
- This does not replace final Phase C.
- This does not replace final 21-opening validation.
- This does not start production Phase D.
