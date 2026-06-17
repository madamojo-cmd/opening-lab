# Stage 2 App Page Cleanup and Resolution Consolidation Report

## Scope

- Consolidate app/page.tsx trainer-resolution wiring without changing runtime behavior.
- Keep move authority, continuation, branch-complete, Plain View, and opening availability behavior intact.
- Reduce policy sprawl by centralizing Stage 2 coach render-state assembly.
- Preserve no-bypass guarantees for approved-content, fallback, and debug truth.

## Branch and Baseline

- Branch: `work/stage2-approved-content-activation-phase5`
- Starting commit: `767fd89`
- Current commit at report time: working tree changes only, not yet committed

## Files Changed

- Modified:
  - `app/page.tsx`
  - `lib/blundr/stage2Coaching/index.ts`
  - `tests/coach/runtime21OpeningTrainability.test.ts`
- Added:
  - `docs/architecture/STAGE2_APP_PAGE_POLICY_INVENTORY.md`
  - `lib/blundr/stage2Coaching/resolveStage2CoachRenderState.ts`
  - `tests/coach/stage2AppPagePolicyInventory.test.ts`
  - `tests/coach/stage2TrainerFrameResolutionNoBypass.test.ts`
  - `tests/coach/stage2AppPageResolverParity.test.ts`
  - `tests/coach/stage2AppPageApprovedContentParity.test.ts`
  - `tests/coach/stage2AppPagePlainViewParity.test.ts`
  - `tests/coach/stage2AppPageContinuationParity.test.ts`
  - `tests/coach/stage2AppPageOpeningAvailabilityParity.test.ts`

## Policy Inventory Summary

- The app-page policy inventory is documented in `docs/architecture/STAGE2_APP_PAGE_POLICY_INVENTORY.md`.
- It classifies policy areas into:
  - `already_resolved_elsewhere`
  - `should_remain_in_page_for_now`
  - `should_move_to_resolution`
  - `should_move_to_stage2_coaching`
  - `should_move_to_opening_availability`
  - `should_move_to_visual_resolution`
  - `should_move_to_provider_policy`
  - `page_state_only`
  - `render_only`
- The inventory confirms the main page now has less policy sprawl, while target selection, continuation gating, branch-complete, and visual truth remain where they must stay.

## What Moved Out Of app/page.tsx

- Stage 2 coach render-state assembly moved into `lib/blundr/stage2Coaching/resolveStage2CoachRenderState.ts`.
- The page no longer separately threads:
  - `buildStage2CoachContext`
  - `resolveStage2CoachingPacket`
  - `selectRenderedCoachCardCopyAuthority`
  - `applyStage2CoachCopyEnrichment`
- The page now builds one consolidated render-state object and then consumes its final outputs.

## What Stayed In app/page.tsx

- CurrentInstructionFrame and instruction-target authority.
- Runtime-book query and continuation gating.
- Branch-complete logic.
- Promotion suffix behavior.
- Plain View gating and reveal timing.
- Visible surface and top-level final render wiring.
- Provider, runtime, and opening-selection state.

## No-Bypass Result

- Approved-content enrichment still only applies through exact gates.
- Fallback behavior still works when approved packets do not match.
- Candidate/rejected/unvalidated packets do not render as approved.
- The consolidated helper does not change move authority or continuation authority.

## Parity Results

- Approved-content parity: pass.
- Plain View parity: pass.
- Continuation parity: pass.
- Opening availability parity: pass.
- No-bypass parity: pass.

## runtime21OpeningTrainability Adjustment

- One stale assertion in `tests/coach/runtime21OpeningTrainability.test.ts` expected three `sample` openings.
- The current truth source reports all 21 runtime openings as `approved` in the opening availability matrix.
- The test was updated to assert the live contract:
  - 21 approved openings
  - 0 sample openings
- This was a test-contract fix only, not a runtime behavior change.

## Tests Run

- `node --import tsx tests/coach/stage2OpeningAvailabilityProductReadiness.test.ts`
- `node --import tsx tests/coach/stage2OpeningVisibilityNoPublicByAccident.test.ts`
- `node --import tsx tests/coach/stage2ApprovedContentAvailabilityMatchesBundles.test.ts`
- `node --import tsx tests/coach/stage2OpeningVisibilityDebugTruth.test.ts`
- `node --import tsx tests/coach/openingVisibilityMatrix.test.ts`
- `node --import tsx tests/coach/stage2ApprovedLiveRenderingOpeningAvailability.test.ts`
- `node --import tsx tests/coach/stage2ApprovedLiveRenderingExactMatch.test.ts`
- `node --import tsx tests/coach/stage2ApprovedLiveRenderingNegativeMatch.test.ts`
- `node --import tsx tests/coach/stage2ApprovedLiveRenderingPlainView.test.ts`
- `node --import tsx tests/coach/stage2ApprovedLiveRenderingShowMore.test.ts`
- `node --import tsx tests/coach/stage2ApprovedLiveRenderingFallback.test.ts`
- `node --import tsx tests/coach/stage2ApprovedLiveRenderingCastlingNormalization.test.ts`
- `node --import tsx tests/coach/stage2ApprovedLiveRenderingFeatureTrace.test.ts`
- `node --import tsx tests/coach/stage2ApprovedLiveRenderingNoAuthorityOverride.test.ts`
- `node --import tsx tests/coach/runtimeCanonical21Openings.test.ts`
- `node --import tsx tests/coach/runtime21OpeningTrainability.test.ts`
- `node --import tsx tests/coach/noLiveLichessRuntimeCalls.test.ts`
- `node --import tsx tests/coach/promotionPickerAuthority.test.ts`
- `node --import tsx tests/coach/plainViewNoLeakBeforeShowMore.test.ts`
- `node --import tsx tests/coach/effectiveContinuationCandidateAuthority.test.ts`
- `node --import tsx tests/coach/stage2FeatureTrace.test.ts`
- `node --import tsx tests/coach/runtimeDataSourceDebug.test.ts`
- `npm run test:trainer-debug`
- `npm run test:coach-quality`
- `npm run test:multi-move-qa`

## Build Result

- `npm run build` passed.

## Known Limitations

- The page still owns some stateful gating and render-time selection.
- Public/beta/dev visibility remains intentionally explicit and unchanged.
- Approved-content handling remains separate from runtime availability.
- The helper consolidation is a wiring cleanup, not a resolver rewrite.

## Recommended Next Phase

- Continue with the next approved cleanup only after this parity layer is committed and reviewed.

STAGE_2_APP_PAGE_CLEANUP_CONSOLIDATION_STATUS: ACCEPTED_FOR_COMMIT
