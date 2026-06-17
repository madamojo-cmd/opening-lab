# Stage 2 Opening Availability Product Readiness Audit

## Executive Summary

- Runtime-trainable openings remain visible for all 21 Stage 2 openings.
- Opening availability is honest about product readiness: publicReady is false for all 21 openings.
- Italian White (italian-white) is the only leading MVP candidate and is marked beta.
- All other openings remain dev and require browser QA before any public promotion.
- runtimeAvailable is true for all 21 openings, approvedContentAvailable is true for all 21 openings, and liveLichessCalled remains false.

## Final Readiness Status

- Runtime data source: local_crawled_package
- Runtime package: stage2-21-opening-stepdown-runtime-v1
- Opening count: 21
- Visible opening count: 21
- Public opening count: 0
- Beta opening count: 1
- Dev opening count: 20
- Hidden opening count: 0
- Approved content inventory count: 21
- Approved content matched count: 21
- Approved content available count: 21
- Opening availability status: smoke_pass
- Live Lichess called: false

## Product-Safe Availability Rules

- runtimeAvailable means the local crawled runtime package can train the opening.
- approvedContentAvailable means approved content bundles are present for the opening.
- userVisible means the opening appears in the trainer selector.
- publicReady remains false for all openings in this checkpoint.
- betaReady is true only for Italian White.
- needsBrowserQA remains true for all openings.
- reasonHidden is explicit for every opening so nothing is accidentally promoted to public status.

## Key Opening Notes

- Italian White is the only leading MVP candidate.
- No opening is public yet.
- No opening was hidden from the runtime catalog.
- The visibility model keeps runtime-trainable openings available without claiming public release readiness.

## Validation Checks

- Verified the 21-opening runtime catalog remains intact.
- Verified the approved-content inventory still matches the approved bundles.
- Verified the debug path reports public/beta/dev counts and selected-opening readiness truth.
- Verified Copy Everything payloads remain null-safe and now include the readiness fields.

## Tests Run

- npx tsx tests/coach/stage2OpeningAvailabilityProductReadiness.test.ts -> pass
- npx tsx tests/coach/stage2OpeningVisibilityNoPublicByAccident.test.ts -> pass
- npx tsx tests/coach/stage2ApprovedContentAvailabilityMatchesBundles.test.ts -> pass
- npx tsx tests/coach/stage2OpeningVisibilityDebugTruth.test.ts -> pass
- npx tsx tests/coach/openingVisibilityMatrix.test.ts -> pass
- npx tsx tests/coach/stage2ApprovedLiveRenderingOpeningAvailability.test.ts -> pass
- npx tsx tests/coach/stage2ApprovedLiveRenderingExactMatch.test.ts -> pass
- npx tsx tests/coach/stage2ApprovedLiveRenderingPlainView.test.ts -> pass
- npx tsx tests/coach/stage2ApprovedLiveRenderingFallback.test.ts -> pass
- npx tsx tests/coach/stage2ApprovedLiveRenderingCastlingNormalization.test.ts -> pass
- npx tsx tests/coach/stage2ApprovedLiveRenderingNoAuthorityOverride.test.ts -> pass
- node --import tsx tests/coach/stage2FeatureTrace.test.ts -> pass
- node --import tsx tests/coach/runtimeDataSourceDebug.test.ts -> pass
- npm run test:coach-quality -> pass
- npm run test:trainer-debug -> pass
- npm run test:multi-move-qa -> pass
- npm run build -> pass

## Product Readiness Conclusion

The Stage 2 visibility model is product-safe and honest: all 21 openings remain runtime-visible and trainable, but none are public yet. Italian White is the leading MVP candidate only, and browser QA is still pending across the catalog.

STAGE2_OPENING_AVAILABILITY_PRODUCT_READINESS_STATUS: ACCEPTED
