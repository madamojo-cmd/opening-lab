# Stage 2 D.7 Stage 2 Coaching Packet Resolver Shell

## Scope

- D.7 infrastructure shell only.
- No runtime book candidate authority changes.
- No move selection changes.
- No target override behavior.
- No Stage 2 markdown/sample content imports.
- No visual recipe rendering from Stage 2 coaching.
- No annotation factory implementation.

## Files Changed

- `lib/blundr/stage2Coaching/stage2CoachingTypes.ts`
- `lib/blundr/stage2Coaching/stage2CoachingFlags.ts`
- `lib/blundr/stage2Coaching/buildStage2CoachContext.ts`
- `lib/blundr/stage2Coaching/buildSafeStage2FallbackPacket.ts`
- `lib/blundr/stage2Coaching/resolveStage2CoachingPacket.ts`
- `lib/blundr/stage2Coaching/applyStage2CoachCopyEnrichment.ts`
- `lib/blundr/stage2Coaching/index.ts`
- `app/page.tsx`
- `lib/blundr/debug/trainerDebugSnapshot.ts`
- `components/debug/BlundrDiagnosticsPanel.tsx`
- `tests/coach/stage2CoachingResolverShell.test.ts`
- `tests/coach/stage2CoachingResolverSeamEnrichment.test.ts`

## Seam Chosen

- Chosen seam: immediately before `surfaceCoachCardDecision` materialization in `app/page.tsx`.
- Seam location is after:
  - `CurrentInstructionFrame.target` authority resolution
  - visible mode resolution via `v28VisibleSurface.mode`
  - Plain/Assisted/Show More gating
  - continuation/runtime-book candidate authority selection
- Resolver input at seam uses:
  - `openingId`
  - `playKeyBefore`
  - `targetUci`
  - `targetSan`
  - surface mapped from `v28VisibleSurface.mode`
  - runtime-book metadata (status/candidate/top rank/games/exhausted)

## Wiring Outcome

- UI wiring status: **optional enrichment wired at coach copy seam with strict gates**.
- Stage 2 resolver output only enriches copy when packet is explicitly approved/safe/matched/surface-aligned.
- Existing `v28CoachUiModel` copy is preserved unchanged for all non-approved outcomes.

## Feature Flags Added

- `STAGE2_COACHING_RESOLVER_ENABLED = true`
- `STAGE2_APPROVED_CONTENT_ENABLED = false`
- `STAGE2_SAFE_FALLBACK_ENABLED = true`

## Fallback Behavior

- Resolver API:
  - `{ kind: "approved_packet"; packet }`
  - `{ kind: "safe_fallback"; packet }`
  - `{ kind: "none"; reason }`
- With approved content disabled, resolver does not emit approved packets in runtime flow.
- Safe fallback packets are **not** used to replace stronger existing coaching at the seam.
- Sealed learner-facing enrichment gate:
  - `packet.status === "approved"`
  - `packet.safetyStatus === "safe"`
  - `packet.runtimeReconciliation.status === "matched"`
  - `packet.surface` matches current visible surface
  - no plain pre-show-more target leak

## Plain View No-Leak Confirmation

- For `plain_before_show_more` (`plain_hint`), enrichment is rejected when packet text contains target SAN/UCI.
- `plain_after_show_more` (`plain_show_more`) may apply approved packet `showMore` copy.
- Existing reveal mechanics/buttons remain unchanged.

## No-Content-Import Confirmation

- Resolver shell modules do not import:
  - `docs/content/stage2/`
  - `imports/stage2-sample/`
  - markdown content files
- Resolver behavior does not require canonical content source presence in D.7.

## No-Visual-Render Confirmation

- Resolver shell emits `visualRecipeRefs: []`.
- Enrichment helper never writes visual primitives/recipes to board render models.
- Board visuals remain sourced from existing visible-surface pipeline only.

## Target Authority Confirmation

- Resolver consumes already-selected target context only.
- Resolver does not select or mutate move authority.
- Runtime-book and continuation/Stockfish authority remains unchanged.
- `resolveEffectiveContinuationCandidate` and `buildCurrentInstructionFrame` were not modified.

## Debug Visibility Added

- Added debug fields in continuation snapshot/copy payload:
  - `stage2CoachingResolverEnabled`
  - `stage2ApprovedContentEnabled`
  - `stage2SafeFallbackEnabled`
  - `stage2CoachingPacketKind`
  - `stage2CoachingSafetyStatus`
  - `stage2CoachingSurface`
  - `stage2CoachingSourceFile`
  - `stage2CoachingRuntimeMatched`

## Tests Run

- `npm run test:coach-quality` -> pass
- `npm run test:trainer-debug` -> pass
- `npm run test:multi-move-qa` -> pass
- `npx tsx tests/coach/stage2FrameAuthorityLock.test.ts` -> pass
- `npx tsx tests/coach/plainViewNoLeakBeforeShowMore.test.ts` -> pass
- `npx tsx tests/coach/plainViewShowMoreParity.test.ts` -> pass
- `npx tsx tests/coach/revealTargetSourceContract.test.ts` -> pass
- `npx tsx tests/coach/runtimeBookBeforeContinuation.test.ts` -> pass
- `npx tsx tests/coach/runtimeBookExhaustionContinuation.test.ts` -> pass
- `npx tsx tests/coach/effectiveContinuationCandidateAuthority.test.ts` -> pass
- `npx tsx tests/coach/stage2CoachingResolverShell.test.ts` -> pass (required unsandboxed rerun after sandbox EPERM)
- `npx tsx tests/coach/stage2CoachingResolverSeamEnrichment.test.ts` -> pass (required unsandboxed rerun after sandbox EPERM)

## Pass/Fail Summary

- Resolver shell infrastructure: pass
- Optional seam enrichment gating: pass
- Candidate authority regression checks: pass
- Plain-view leak guard checks: pass
- No-content-import guard checks: pass

## Next Recommended Step

- D.8 canonical content source stabilization execution.

D7_STAGE_2_COACHING_PACKET_RESOLVER_SHELL_STATUS: ACCEPTED
