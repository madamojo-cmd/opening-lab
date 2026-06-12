# Stage 2 Final 21-Opening Runtime Package Acceptance (C.1)

## Scope

- Phase: C.1 only (final 21-opening runtime package acceptance)
- Explicitly excluded:
  - runtime loader implementation
  - trainer wiring
  - Stage 2 runtime integration
  - `app/page.tsx` modifications

## Branch merged

- Runtime merge already present on current branch lineage:
  - merge commit: `ca49bd3`
  - commit subject: `Merge Stage 2 21-opening runtime book`
- Current working branch for this acceptance: `work/stage2-runtime-loader`

## Package path

- `data/blundr/stage2-21-opening-stepdown-runtime-v1/`

## Files verified

- `data/blundr/stage2-21-opening-stepdown-runtime-v1/README.md`
- `data/blundr/stage2-21-opening-stepdown-runtime-v1/manifests/stage2-stepdown-runtime-manifest.json`
- `data/blundr/stage2-21-opening-stepdown-runtime-v1/reports/merge-run.log`
- `data/blundr/stage2-21-opening-stepdown-runtime-v1/reports/opening-node-coverage.csv`
- `data/blundr/stage2-21-opening-stepdown-runtime-v1/reports/runtime-move-coverage.csv`
- `data/blundr/stage2-21-opening-stepdown-runtime-v1/reports/runtime-moves-ranked-before-filter.csv`
- `data/blundr/stage2-21-opening-stepdown-runtime-v1/reports/state-summary.csv`
- `data/blundr/stage2-21-opening-stepdown-runtime-v1/runtime/opening-book.nodes.runtime.v1.csv`
- `data/blundr/stage2-21-opening-stepdown-runtime-v1/runtime/opening-book.nodes.runtime.v1.jsonl`
- `data/blundr/stage2-21-opening-stepdown-runtime-v1/runtime/opening-book.moves.runtime.v1.csv`
- `data/blundr/stage2-21-opening-stepdown-runtime-v1/runtime/opening-book.moves.runtime.v1.jsonl`

## JSONL schema fields observed

- `opening-book.nodes.runtime.v1.jsonl` fields:
  - `nodeId`
  - `openingId`
  - `displayName`
  - `learnerPerspective`
  - `playKey`
  - `playSequenceUci`
  - `ply`
  - `sideToMove`
  - `source`
  - `profileId`
  - `whiteWins`
  - `draws`
  - `blackWins`
  - `totalGames`
  - `openingEco`
  - `openingName`
  - `trainerCutoff`
  - `needsLichessData`
  - `fetchedAt`
  - `rawPath`
  - `crawlSet`
- `opening-book.moves.runtime.v1.jsonl` fields:
  - `openingId`
  - `playKeyBefore`
  - `moveUci`
  - `totalGames`
  - `playPct`
  - `profiles`
  - `sources`
  - `rank`
  - `runtimeCandidate`

## Counts

- node count: `49,232`
- runtime move count: `116,508`
- opening count: `21`

## Opening IDs (exact 21)

- `caro-kann-black`
- `colle-white`
- `english-white`
- `french-black`
- `italian-black`
- `italian-white`
- `kings-indian-black`
- `london-white`
- `nimzo-indian-black`
- `petroff-black`
- `pirc-black`
- `qgd-black`
- `queens-gambit-white`
- `queens-indian-black`
- `reti-white`
- `ruy-lopez-white`
- `scandinavian-black`
- `scotch-white`
- `sicilian-black`
- `slav-black`
- `vienna-white`

## Max ply by opening

- All 21 openings reach max ply `12`:
  - `caro-kann-black`: `12`
  - `colle-white`: `12`
  - `english-white`: `12`
  - `french-black`: `12`
  - `italian-black`: `12`
  - `italian-white`: `12`
  - `kings-indian-black`: `12`
  - `london-white`: `12`
  - `nimzo-indian-black`: `12`
  - `petroff-black`: `12`
  - `pirc-black`: `12`
  - `qgd-black`: `12`
  - `queens-gambit-white`: `12`
  - `queens-indian-black`: `12`
  - `reti-white`: `12`
  - `ruy-lopez-white`: `12`
  - `scandinavian-black`: `12`
  - `scotch-white`: `12`
  - `sicilian-black`: `12`
  - `slav-black`: `12`
  - `vienna-white`: `12`

## Root candidate smoke checks

- Verified runtime candidates exist for:
  - `english-white`
  - `london-white`
  - `sicilian-black`
  - `caro-kann-black`
- Validation used actual move schema (`runtimeCandidate` presence by opening), since root rows are opening-shape dependent (`playKeyBefore` is non-empty for these opening families).

## Runtime rank ordering check

- `opening-book.moves.runtime.v1.jsonl` rows are non-decreasing by `rank` within each `openingId + playKeyBefore` group (applied because both `rank` and `playKeyBefore` exist in schema).

## Git tracking status for JSONL files

- Tracked by Git (`git ls-files` confirmed):
  - `data/blundr/stage2-21-opening-stepdown-runtime-v1/runtime/opening-book.nodes.runtime.v1.jsonl`
  - `data/blundr/stage2-21-opening-stepdown-runtime-v1/runtime/opening-book.moves.runtime.v1.jsonl`

## Package safety checks

- Package name/path does not include `all23`.
- No `.tgz` archive exists under `data/blundr/stage2-21-opening-stepdown-runtime-v1/`.
- No normalized/full crawl data file names were found inside the committed runtime package path.
- Acceptance is for 21 openings, not 23.

## Runtime/trainer integration status

- No runtime loader was implemented in this step.
- No trainer wiring was performed in this step.
- `app/page.tsx` remains unmodified.

## Tests run

- `npm run test:coach-quality` -> pass
- `npm run test:trainer-debug` -> pass
- `npm run test:multi-move-qa` -> pass
- `npx tsx tests/runtimeBook/stage2Final21RuntimePackageAcceptance.test.ts` -> pass (required unsandboxed rerun after sandbox `EPERM`)

## Pass/fail summary

- C.1 runtime package acceptance checks: pass
- Guardrails respected (no loader/trainer wiring, no `app/page.tsx` changes): pass

## Next recommended step

- `D.1 — isolated runtime book loader`

FINAL_21_RUNTIME_ACCEPTANCE_STATUS: ACCEPTED
