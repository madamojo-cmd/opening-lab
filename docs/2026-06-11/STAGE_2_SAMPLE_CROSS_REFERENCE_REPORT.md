# Stage 2 Sample Cross-Reference Report (C.0-SAMPLE v2)

## Scope
- Crawl: `tests/fixtures/stage2/sample/sample-crawl-bundle.json`
- Copy: `tests/fixtures/stage2/sample/sample-copy-bundle.json`

## Checks
- copy openingId exists in crawl openingIds: `PASS`
- copy nodeKey exists in crawl nodes: `PASS`
- copy moveUci exists for referenced node when present: `PASS`
- copy conceptId from Colle/approved concept docs when present: `PASS`
- visualRecipeRefs are metadata only: `PASS`
- missing opening references: `0`
- missing node references: `0`
- missing move references: `0`
- synthetic ID prefix (`sample_`) violations: `0`
- forbidden sample filenames (`latest/canonical/v1/approved`) violations: `0`
- markdown/spec draft node IDs used as runtime authority: `0`

## Notes
- Copy entries bind line reconciliation via `lineId` equal to crawl `playKey` for `nodeKey + moveUci`.
- Visual recipe refs are stored as metadata only and are not rendered.

SAMPLE_CROSS_REFERENCE_STATUS: ACCEPTED_FOR_SAMPLE_ONLY
