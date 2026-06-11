# Stage 2 Sample Crawl Acceptance Report (C.0-SAMPLE v2)

## Fixture
- `tests/fixtures/stage2/sample/sample-crawl-bundle.json`

## Validator result (`validateCrawlBundle`)
- result: `ok`
- errors: `0`
- warnings: `4948` (`unknown_field` only)

## Counts
- opening count: `1`
- node count: `120`
- candidate count: `1027`

## Duplicate checks
- duplicate node keys: `0`
- duplicate candidate keys: `0`
- missing opening references: `0`

## Unknown-field warning summary
- total unknown warnings: `4948`
- top fields:
  - `playKey`: `1147`
  - `profileId`: `1147`
  - `totalGames`: `1147`
  - `blundrUse`: `1027`
  - `nodeId`: `120`
  - `playSequenceUci`: `120`
  - `sideToMove`: `120`
  - `source`: `120`

## Sample-only status
- Accepted for sample-only validation lane.
- Preserved source metadata is intentionally carried as unknown fields.
- No runtime integration is enabled.

SAMPLE_CRAWL_STATUS: ACCEPTED_FOR_SAMPLE_ONLY
