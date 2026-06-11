# Stage 2 Sample Package Plan (C.0-SAMPLE)

## Selected openingId
- `colle-white`

## Source files inspected
- `imports/stage2-sample/opening-nodes.stage2.canonical-all23.12ply.jsonl`
- `imports/stage2-sample/candidate-moves.stage2.canonical-all23.12ply.top10-played.jsonl`
- `imports/stage2-sample/blundr-sample-lane-source/canonical-all23-colle-white/sample-only.colle-white.opening-nodes.jsonl`
- `imports/stage2-sample/blundr-sample-lane-source/canonical-all23-colle-white/sample-only.colle-white.candidate-moves.jsonl`
- `imports/stage2-sample/blundr-sample-lane-source/canonical-all23-colle-white/sample-only.colle-white.summary.json`
- `imports/stage2-sample/blundr-sample-lane-source/canonical-all23-colle-white/README_SAMPLE_ONLY.md`

## Source dataset description
- Lane: imported older canonical 21-opening, 12-ply, top10-played source files.
- Scope for this sample package: single opening (`colle-white`) only.
- Selection policy used in sample source generation:
  - target about 120 nodes
  - up to 10 candidate moves per node
  - prioritize nodes with candidate coverage
  - deterministic ordering by `ply asc`, `totalGames desc`, `nodeId asc`

## Sample source counts
- Node count: `120`
- Candidate count (sample source jsonl): `1177`
- Candidate count (validator-shaped crawl fixture after dedupe): `1027`

## Source field mapping to sample crawl fixture
- Node mappings:
  - `openingId -> openingId`
  - `nodeId -> nodeKey`
  - `ply -> ply`
  - `playSequenceUci -> movePathUci` (split sequence)
  - `parentNodeKey -> parentNodeKey` (when present)
  - sample source metadata preserved as unknown-field metadata: `playKey`, `playSequenceUci`, `sideToMove`, `totalGames`, `source`, `profileId`, `nodeId`
- Candidate mappings:
  - `openingId -> openingId`
  - `nodeId -> nodeKey`
  - `uci -> moveUci`
  - `san -> moveSan`
  - `blundrTopPlayedRank -> rank`
  - `totalGames -> games`
  - `whiteWins -> white`
  - `draws -> draws`
  - `blackWins -> black`
  - sample metadata preserved as unknown-field metadata: `blundrUse`, `profileId`, `playKey`, `totalGames`

## Missing fields (by validator schema)
- Node-level optional fields not fully populated in every record: `fen`, `fen4`, `movePathSan`, `sourceGroup`.
- Candidate-level optional fields not fully populated in every record: `childNodeKey`, `sourceGroup`.
- No final Phase C crawl package metadata is implied by this sample fixture.

## Sample-only assumptions
- Unknown-field warnings are acceptable in this sample lane because source metadata is intentionally preserved.
- Copy fixture is intentionally tiny and product-safe, with sample IDs prefixed `sample_`.
- No production IDs were synthesized.

## Confirmations
- This package is sample-only and does not replace final Phase C.
- This package is not final 5/4/3/2 data.
