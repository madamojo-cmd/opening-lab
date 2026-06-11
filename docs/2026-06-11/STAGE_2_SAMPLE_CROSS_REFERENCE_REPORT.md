# Stage 2 Sample Cross-Reference Report

## Scope
- Crawl fixture: `tests/fixtures/stage2/sample/sample-crawl-bundle.json`
- Copy fixture: `tests/fixtures/stage2/sample/sample-copy-bundle.json`
- Opening scope: `colle-white`

## Cross-check results
- copy openingId exists in crawl openingIds: `PASS`
- copy nodeKey exists in crawl nodes: `PASS`
- copy moveUci exists for referenced node when moveUci present: `PASS`
- missing opening references: `0`
- missing node references: `0`
- missing move references: `0`
- synthetic ID prefix compliance (`sample_`): `PASS` (`0` violations)
- sample fixture filename policy (`latest/canonical/v1/approved` forbidden in filenames): `PASS` (`0` violations)

## Notes
- Cross-reference checks were run only against sample fixture files under `tests/fixtures/stage2/sample`.
- No production data directories were used for these sample fixture checks.

SAMPLE_CROSS_REFERENCE_STATUS: ACCEPTED_FOR_SAMPLE_ONLY
