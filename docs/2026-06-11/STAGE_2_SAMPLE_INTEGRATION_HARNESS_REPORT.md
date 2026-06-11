# Stage 2 Sample Integration Harness Report (D-SPIKE.1)

## Scope
- D-SPIKE.1 sample-only harness to transform provided sample crawl/copy objects plus target context into a target-aligned sample Stage 2 packet (or null-equivalent status).
- No runtime UI wiring and no global Stage 2 enablement.

## Files created
- `lib/blundr/stage2/sample/sampleStage2Types.ts`
- `lib/blundr/stage2/sample/selectSampleStage2Copy.ts`
- `lib/blundr/stage2/sample/buildSampleStage2Packet.ts`
- `lib/blundr/stage2/sample/index.ts`
- `tests/coach/stage2SampleIntegrationHarness.test.ts`
- `tests/coach/stage2SampleIntegrationNoRuntimeWiring.test.ts`
- `docs/2026-06-11/STAGE_2_SAMPLE_INTEGRATION_HARNESS_REPORT.md`

## Production/runtime files changed
- None outside the allowed D-SPIKE.1 paths.

## app/page.tsx changed?
- No.

## Does sample code read files?
- No. Harness code accepts provided objects only and performs no filesystem I/O.

## Are fixtures test-only?
- Yes. Fixture paths are consumed by tests only; no runtime/module wiring to fixture paths.

## Packet matching behavior
- Validates opening membership in crawl bundle.
- Validates node when provided.
- Validates move candidate membership for resolved node.
- Never changes target `moveUci`.
- Returns:
  - `matched` when target and approved copy align.
  - `no_match` when opening/context/copy match is unavailable.
  - `blocked` when target node/move contradicts crawl constraints.

## Plain View no-leak behavior
- Plain mode before Show More suppresses full title/body answer copy.
- Optional safe hint may be returned when present.

## Assisted/Show More behavior
- Assisted mode can return full matched copy.
- Plain mode after Show More can return full target-aligned copy.

## Copy selection behavior
- Matches by `openingId`.
- Prefers exact `nodeKey + moveUci`.
- Falls back to `playKey(lineId) + moveUci` when available.
- Uses approved entries only.
- Excludes draft/disabled from visible copy.

## visualRecipeRefs status
- Metadata-only passthrough. No rendering or visual execution.

## Tests run
- `npm run test:coach-quality`
- `npm run test:trainer-debug`
- `npm run test:multi-move-qa`
- `npx tsx tests/coach/stage2FrameAuthorityLock.test.ts`
- `npx tsx tests/coach/stage2SurfaceOwnershipLock.test.ts`
- `npx tsx tests/coach/stage2PlainAssistedShowMoreLock.test.ts`
- `npx tsx tests/coach/stage2NoLegacyImportBoundary.test.ts`
- `npx tsx tests/coach/stage2BoardTruthBoundaryLock.test.ts`
- `npx tsx tests/coach/stage2CrawlBundleValidator.test.ts`
- `npx tsx tests/coach/stage2CopyBundleValidator.test.ts`
- `npx tsx tests/coach/stage2ValidatorsNoRuntimeIntegration.test.ts`
- `npx tsx tests/coach/stage2ReadinessGate.test.ts`
- `npx tsx tests/coach/stage2ReadinessNoRuntimeIntegration.test.ts`
- `npx tsx tests/coach/stage2LegacyRuntimeRiskRegistry.test.ts`
- `npx tsx tests/coach/stage2SamplePackageValidator.test.ts`
- `npx tsx tests/coach/stage2SampleIntegrationHarness.test.ts`
- `npx tsx tests/coach/stage2SampleIntegrationNoRuntimeWiring.test.ts`

## Pass/fail summary
- All listed tests passed.
- Direct sandbox `npx tsx` attempts hit EPERM on `/tmp/tsx-1000/*.pipe`; rerun unsandboxed and passed.

SAMPLE_INTEGRATION_HARNESS_STATUS: READY_FOR_MANUAL_REVIEW
