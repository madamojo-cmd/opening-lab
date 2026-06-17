# Stage 2 Legacy / No-Bypass Audit

## Scope

- Audit-only pass for legacy, parallel, fallback, adapter, and debug paths that can affect trainer behavior or debug output.
- No Review Queue work.
- No account, onboarding, dashboard, or gamification changes.
- No content generation changes.
- No approved-content bundle changes.
- No runtime-data changes.
- No move-authority changes.
- No promotion, continuation, branch-complete, or Plain View behavior changes.

## Checkpoint Status

- Current branch: `work/stage2-approved-content-activation-phase5`
- Visual traceability checkpoint/tag existed locally and was pushed before this audit began:
  - `checkpoint/stage2-visual-recipe-traceability`
  - `stage2-visual-recipe-traceability`

## Accepted Authority Chain

1. Runtime / `CurrentInstructionFrame` / `TrainerFrameResolution` owns target authority.
2. Approved content may enrich only through exact match.
3. CoachCard may explain only; it cannot select or change the move.
4. Visuals may display only; they cannot select or change the move.
5. FeatureTrace may report only; it cannot select or change the move.
6. Provider fallback may suggest/gate continuation only where allowed.
7. Opening visibility may hide/show availability only.
8. Debug / Copy Everything may report only.

## Audit Outcome

- No bypass path was found that can override the accepted target authority chain.
- Legacy and fallback paths remain present in a few places, but they are guarded and/or restricted to explanation, fallback, or debug reporting.
- The main residual risks are live provider/adapter surfaces that should remain follow-up targets for eventual cleanup, not authority overrides.

## Inventory Summary

The machine-readable inventory is stored at:

- `data/blundr/stage2-legacy-no-bypass-inventory.json`

The inventory classifies each path as one of:

- `active_authority`
- `adapter_only`
- `fallback_only`
- `debug_only`
- `dead_remove_candidate`
- `needs_followup`

## Required Audit Areas Covered

- app/page.tsx remaining page-local policy
- CurrentInstructionFrame construction
- TrainerFrameResolution
- Stage 2 coaching resolver
- approved-content resolver
- copy-polish patch loader
- safe fallback CoachCard
- legacy live coach / coachDecision path
- visible surface / current surface / `visible_surface_v28`
- board visual primitives
- approved visual recipe path
- generated visual recipe path
- fallback/current-surface visuals
- FeatureTrace
- TrainerDebugSnapshot
- Copy Everything payload
- Diagnostics Panel
- openingAvailability
- runtime book loader
- opening tree / repertoire line inputs
- branch complete
- Continue From Here
- continuation candidate selection
- Maia/opponent reply path
- Stockfish validation/gating path
- provider warning/fallback path
- promotion picker
- promotion suffix handling
- castling normalization
- Plain View hint / Show More gating
- terminal/checkmate/draw handling
- dead imports and unused sample paths

## Guardrail Tests

The audit is backed by tests that prove the following:

- the inventory and report exist and are complete
- target authority cannot be bypassed by approved content, fallback content, or debug layers
- CoachCard copy cannot override the accepted move
- visuals cannot create or override the accepted move
- FeatureTrace is read-only
- provider fallback cannot silently replace runtime target authority
- Plain View remains leak-safe
- promotion suffixes remain distinct
- debug-only surfaces remain non-behavioral

## Tests Run

- `node --import tsx tests/coach/stage2LegacyNoBypassInventory.test.ts`
- `node --import tsx tests/coach/stage2LegacyNoMoveAuthorityBypass.test.ts`
- `node --import tsx tests/coach/stage2LegacyNoCoachCardBypass.test.ts`
- `node --import tsx tests/coach/stage2LegacyNoVisualBypass.test.ts`
- `node --import tsx tests/coach/stage2LegacyNoFeatureTraceBypass.test.ts`
- `node --import tsx tests/coach/stage2LegacyNoProviderBypass.test.ts`
- `node --import tsx tests/coach/stage2LegacyNoPlainViewBypass.test.ts`
- `node --import tsx tests/coach/stage2LegacyNoContinuationBypass.test.ts`
- `node --import tsx tests/coach/stage2LegacyNoPromotionBypass.test.ts`
- `node --import tsx tests/coach/stage2LegacyDebugOnlyNoBehavior.test.ts`
- `npm run test:coach-quality`
- `npm run test:trainer-debug`
- `npm run test:multi-move-qa`
- `npm run build`

## Test Outcome

- Audit-specific bypass tests: pass
- Coach-quality QA: pass
- Trainer debug QA: pass
- Multi-move QA: pass
- Production build: pass

## Notes

- `/api/explorer` remains a legacy/removable candidate and is not part of the normal trainer authority chain.
- `/api/brain` remains a parallel live annotation surface; it is guarded, but it is still a follow-up candidate for eventual simplification.
- `imports/stage2-sample/`, `docs30/`, and `stage2-canonical-all23-12ply/` are stale or sample-derived paths and are documented as dead/remove candidates for later cleanup.

## Status

- Stage 2 legacy/no-bypass audit: complete.
- No-bypass invariant: preserved.
