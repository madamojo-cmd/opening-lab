# Stage 2 Provider Warning Policy Report

## Scope

- Repair pass for Stage 2 provider warning policy.
- No move authority changes.
- No runtime-book behavior changes.
- No continuation behavior changes.
- No branch-complete behavior changes.
- No live Lichess calls introduced.

## Branch / Commit

- Branch: `work/stage2-approved-content-activation-phase5`
- Starting commit: `148602b` (`Add Stage 2 provider warning policy`)

## Files Changed

- `lib/blundr/providers/providerWarningPolicy.ts`
- `data/blundr/stage2-provider-warning-policy.json`
- `docs/architecture/STAGE2_PROVIDER_WARNING_POLICY.md`
- `tests/coach/stage2ProviderWarningPolicy.test.ts`
- `tests/coach/stage2ProviderWarningDebugTruth.test.ts`
- `tests/coach/stage2ProviderWarningTestHelpers.ts`
- `tests/coach/stage2ProviderWarningPolicyInventory.test.ts`
- `tests/coach/stage2ProviderWarningTaxonomy.test.ts`
- `tests/coach/stage2ProviderLocalRuntimeHealthy.test.ts`
- `tests/coach/stage2ProviderNoLiveLichessTruth.test.ts`
- `tests/coach/stage2ProviderMaiaRoleNoAuthority.test.ts`
- `tests/coach/stage2ProviderStockfishRoleNoAuthority.test.ts`
- `tests/coach/stage2ProviderFallbackWarningTruth.test.ts`
- `tests/coach/stage2ProviderContinuationWarningTruth.test.ts`
- `tests/coach/stage2ProviderDebugCopyEverythingTruth.test.ts`
- `tests/coach/stage2ProviderNoNoiseOnHealthyFrame.test.ts`
- `tests/coach/stage2CoachingResolverShell.test.ts`
- `lib/blundr/debug/buildStage2FeatureTrace.ts`
- `lib/blundr/debug/trainerDebugSnapshot.ts`
- `lib/blundr/debug/stage2FeatureTraceTypes.ts`
- `lib/blundr/debug/trainerDebugTypes.ts`
- `lib/blundr/debug/trainerFrameResolutionTypes.ts`
- `components/debug/BlundrDiagnosticsPanel.tsx`

## Provider IDs Defined

- `local_runtime_package`
- `historical_lichess_source`
- `maia`
- `stockfish`
- `approved_content`
- `safe_fallback`
- `debug_snapshot`

## Warning IDs Defined

- `local_runtime_loaded`
- `local_runtime_missing`
- `no_live_lichess_required`
- `live_lichess_disabled`
- `live_lichess_call_blocked`
- `maia_unavailable`
- `maia_not_required_for_restricted_frame`
- `maia_opponent_reply_only`
- `maia_not_user_move_authority`
- `stockfish_unavailable`
- `stockfish_validation_unavailable`
- `stockfish_not_user_move_authority`
- `continuation_provider_fallback_used`
- `approved_content_not_matched`
- `approved_content_fallback_used`
- `safe_fallback_used`
- `provider_warning_debug_only`
- `provider_warning_user_visible`
- `provider_no_authority_impact`

## Policy Summary

### User-Facing Warning Policy

- Only genuine degradation states are user-facing.
- `local_runtime_missing`, `live_lichess_call_blocked`, and the optional Stockfish/Maia degradation paths can surface visible warnings when they represent real frame degradation.
- Approved-content mismatch is not user-facing when safe fallback preserves the lesson flow.

### Debug-Only Warning Policy

- Local runtime health, no-live-Lichess truth, approved-content mismatch, and safe fallback truth are reported through debug and Copy Everything.
- Debug warnings do not alter learner-facing behavior or authority.

### Maia Role Result

- Maia remains an opponent-reply / continuation-assist role only where explicitly allowed.
- Maia does not become user move authority.

### Stockfish Role Result

- Stockfish remains a continuation validation / optional fallback role only.
- Stockfish does not become user move authority.

### Local Runtime Result

- `runtimeDataSource = local_crawled_package`
- Local runtime health is reported as a positive debug truth.

### No-Live-Lichess Result

- `liveLichessCalled = false` is treated as the expected local-training state.
- No live Lichess call is required for the normal Stage 2 local runtime.

### Fallback Warning Result

- Safe fallback warnings are truthful and preserve lesson flow.
- Fallback is reported explicitly rather than hidden.

### Continuation Warning Result

- Continuation-provider fallback is reported when continuation validation cannot complete.
- The warning is descriptive only and does not change authority.

### Copy Everything / Diagnostics Result

- Copy Everything includes provider warnings and provider-warning summary fields.
- Diagnostics renders provider warnings without crashing.
- Provider warning data is visible in debug tooling, not just hidden in code.

### No-Provider-Authority Result

- Provider warnings do not create or override move authority.
- Provider warnings do not change `CurrentInstructionFrame.target`.

## Tests Run

- `npx tsx tests/coach/stage2ProviderWarningPolicy.test.ts`
- `npx tsx tests/coach/stage2ProviderWarningDebugTruth.test.ts`
- `npx tsx tests/coach/stage2ProviderWarningPolicyInventory.test.ts`
- `npx tsx tests/coach/stage2ProviderWarningTaxonomy.test.ts`
- `npx tsx tests/coach/stage2ProviderLocalRuntimeHealthy.test.ts`
- `npx tsx tests/coach/stage2ProviderNoLiveLichessTruth.test.ts`
- `npx tsx tests/coach/stage2ProviderMaiaRoleNoAuthority.test.ts`
- `npx tsx tests/coach/stage2ProviderStockfishRoleNoAuthority.test.ts`
- `npx tsx tests/coach/stage2ProviderFallbackWarningTruth.test.ts`
- `npx tsx tests/coach/stage2ProviderContinuationWarningTruth.test.ts`
- `npx tsx tests/coach/stage2ProviderDebugCopyEverythingTruth.test.ts`
- `npx tsx tests/coach/stage2ProviderNoNoiseOnHealthyFrame.test.ts`
- `npx tsx tests/coach/stage2CoachingResolverShell.test.ts`

## Build Result

- `npm run test:coach-quality` -> pass
- `npm run test:trainer-debug` -> pass
- `npm run test:multi-move-qa` -> pass
- `npm run build` -> pass

## Known Limitations

- Provider warnings are debug/reporting policy only.
- They intentionally do not alter move authority or target selection.
- The policy only covers the Stage 2 provider set currently used by the local runtime and debug surfaces.

## Recommended Next Phase

- Continue the existing Stage 2 activation work with the provider-warning policy now fully validated and documented.

STAGE_2_PROVIDER_WARNING_POLICY_REPAIR_STATUS: ACCEPTED
