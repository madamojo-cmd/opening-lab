# Stage 2 Sample Crawl Acceptance Report

## Scope
- Lane: `C.0-SAMPLE`
- Fixture: `tests/fixtures/stage2/sample/sample-crawl-bundle.json`
- Opening scope: `colle-white` only

## Validator result (`validateCrawlBundle`)
- `ok`: `true`
- errors: `0`
- warnings: `4948` (all `unknown_field`)

## Summary metrics
- opening count: `1`
- node count: `120`
- candidate count: `1027`
- duplicate node count: `0`
- duplicate candidate count: `0`
- missing opening reference count: `0`

## Unknown field warning summary
- total unknown-field warnings: `4948`
- top unknown fields:
  - `playKey`: `1147`
  - `profileId`: `1147`
  - `totalGames`: `1147`
  - `blundrUse`: `1027`
  - `nodeId`: `120`
  - `playSequenceUci`: `120`
  - `sideToMove`: `120`
  - `source`: `120`

## Sample-only status
- Accepted as sample-only validator-shaped crawl fixture.
- Unknown-field warnings are expected from intentionally preserved source metadata.
- No runtime integration is enabled by this fixture.

SAMPLE_CRAWL_STATUS: ACCEPTED_FOR_SAMPLE_ONLY
