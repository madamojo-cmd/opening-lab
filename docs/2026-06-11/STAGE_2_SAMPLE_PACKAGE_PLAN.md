# Stage 2 Sample Package Plan (C.0-SAMPLE v2)

## Selected openingId
- `colle-white`

## Source crawl files inspected
- `imports/stage2-sample/blundr-sample-lane-source/canonical-all23-colle-white/sample-only.colle-white.opening-nodes.jsonl`
- `imports/stage2-sample/blundr-sample-lane-source/canonical-all23-colle-white/sample-only.colle-white.candidate-moves.jsonl`
- `imports/stage2-sample/blundr-sample-lane-source/canonical-all23-colle-white/sample-only.colle-white.summary.json`
- `imports/stage2-sample/blundr-sample-lane-source/canonical-all23-colle-white/README_SAMPLE_ONLY.md`

## Source content files inspected
- `imports/stage2-sample/content-base/docs/content/stage2/openings/colle-white.md`
- `imports/stage2-sample/content-base/docs/content/stage2/openings/colle-white.json-spec.md`
- `imports/stage2-sample/content-base/docs/content/stage2/07_COPY_LIBRARY.md`
- `imports/stage2-sample/content-base/docs/content/stage2/06_FEATURE_TO_CONCEPT_MAPPING.md`
- `imports/stage2-sample/content-base/docs/content/stage2/08_VISUAL_RECIPE_LIBRARY.md`

## Source dataset description
- Crawl source is the previously prepared sample-only Colle lane from older canonical 21-opening, 12-ply, top10-played imports.
- Content source is approved Stage 2 content-base Colle documentation and supporting concept/copy/visual mapping docs.
- Output is a small sample-only package for validation and reconciliation testing; no runtime integration is included.

## Counts
- Node count (sample source jsonl): `120`
- Candidate count (sample source jsonl): `1177`
- Candidate count (validator-shaped crawl fixture): `1027`

## Colle content sections found
- Opening Identity
- Opening Summary
- Curriculum Goals
- Core Plans
- Main Line
- Feature Detection Map
- Feature-to-Concept Map
- Copy Library
- Visual Recipe Library

## Colle concept IDs found
- `colle-d4-claim-center`
- `colle-nf3-develop-support-center`
- `colle-e3-solid-structure`
- `colle-bd3-kingside-aim`
- `colle-c3-center-support`
- `colle-nbd2-coordinate-break`
- `colle-castle-king-safety`
- `colle-re1-support-e4`
- `colle-dxe5-clarify-center`
- `colle-nxe5-central-recapture`

## Copy/content field mapping
- Content concept -> copy fixture `conceptId`
- Colle sequence key (`playKey`) -> copy fixture `lineId` for reconciliation evidence
- Crawl `nodeId` -> crawl fixture `nodeKey` -> copy fixture `nodeKey`
- Crawl `uci` -> crawl fixture `moveUci` -> copy fixture `moveUci`
- Colle visual recipe hints -> copy fixture `visualRecipeRefs` metadata only

## Crawl/content reconciliation strategy
- Reconcile each copy entry against crawl using `openingId + lineId(playKey) + moveUci`.
- `nodeKey` in copy must resolve to a real crawl node.
- `moveUci` in copy must resolve to a real candidate for that `nodeKey`.
- Old markdown/spec draft node IDs (e.g., `colle-white-nX`) are not used as runtime authority.
- Content does not choose moves; crawl references remain the move reference in this sample lane.

## Missing fields
- Crawl fixture intentionally omits some optional schema fields (`fen`, `fen4`, `movePathSan`) where source data did not provide them.
- Copy fixture is intentionally small and does not attempt full concept coverage.
- Visual recipes are metadata references only; no visual rendering mapping is implemented in this lane.

## Sample-only assumptions
- Unknown-field warnings in crawl validation are expected and accepted for preserved source metadata (`playKey`, `profileId`, `totalGames`, `blundrUse`, etc.).
- Sample copy text is normalized from Colle content and kept short/safe.
- No production IDs were synthesized; all synthetic IDs use `sample_` prefix.

## Confirmations
- This is not final Phase C.
- This is not final 5/4/3/2 data.
- This is not runtime integration.
