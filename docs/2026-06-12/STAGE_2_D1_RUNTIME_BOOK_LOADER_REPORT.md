# Stage 2 D.1 Runtime Book Loader Report

## Scope

- Implemented D.1 only: isolated Stage 2 runtime book loader and lookup helpers.
- Explicitly not performed:
  - trainer wiring
  - continuation integration
  - app runtime integration
  - `app/page.tsx` changes

## Files created

- `lib/blundr/runtimeBook/runtimeBookTypes.ts`
- `lib/blundr/runtimeBook/loadStage2RuntimeBook.ts`
- `lib/blundr/runtimeBook/runtimeBookIndex.ts`
- `lib/blundr/runtimeBook/getRuntimeBookMoves.ts`
- `lib/blundr/runtimeBook/index.ts`
- `tests/runtimeBook/runtimeBookLoader.test.ts`
- `tests/runtimeBook/runtimeBookLookup.test.ts`
- `tests/runtimeBook/runtimeBookNoRuntimeWiring.test.ts`
- `docs/2026-06-12/STAGE_2_D1_RUNTIME_BOOK_LOADER_REPORT.md`

## Runtime package path

- `data/blundr/stage2-21-opening-stepdown-runtime-v1/`

## JSONL fields observed

- Node JSONL (`opening-book.nodes.runtime.v1.jsonl`):
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
- Move JSONL (`opening-book.moves.runtime.v1.jsonl`):
  - `openingId`
  - `playKeyBefore`
  - `moveUci`
  - `totalGames`
  - `playPct`
  - `profiles`
  - `sources`
  - `rank`
  - `runtimeCandidate`

## Loader behavior

- Explicit function call only (`loadStage2RuntimeBook`), no load at module import time.
- Reads only committed runtime JSONL files:
  - `runtime/opening-book.nodes.runtime.v1.jsonl`
  - `runtime/opening-book.moves.runtime.v1.jsonl`
- Parses JSONL line-by-line with line-numbered parse errors.
- Validates minimum row shape (`openingId`; optional typed checks for `playKey`, `playKeyBefore`, `moveUci`, `rank`, `totalGames`, `playPct`, `ply`).
- Returns parsed node and move rows with package/runtime file metadata.

## Index behavior

- Builds node index by `openingId + playKey`.
- Builds move index by `openingId + playKeyBefore`.
- Preserves opening IDs and max ply per opening.
- Preserves node/move counts.
- Sorts each move group by:
  - `rank` ascending
  - `totalGames` descending
  - stable input order tie-break
- Avoids mutating caller-provided row objects (shallow clones used).

## Query behavior

- Query input: `openingId` + `playKeyBefore`.
- Returns candidates for exact key match only.
- Returns empty array for unknown opening or unknown `playKeyBefore`.
- Never invents/selects moves.
- Never calls Stockfish, Maia, continuation, or trainer modules.
- Returns cloned move objects to avoid accidental caller mutation of index storage.

## Count verification

- Node count: `49,232`
- Runtime move count: `116,508`
- Opening count: `21`

## Root candidate smoke checks

- Runtime candidate groups verified for:
  - `english-white`
  - `london-white`
  - `sicilian-black`
  - `caro-kann-black`

## No-runtime-wiring verification

- `app/page.tsx` does not import runtimeBook.
- Coach/trainer/runtime files are verified to not import runtimeBook yet.
- runtimeBook module files do not import:
  - React
  - Next.js
  - Stockfish
  - Maia
  - continuation modules
  - legacy liveCoach modules
  - sample fixtures

## Tests run

- `npm run test:coach-quality`
- `npm run test:trainer-debug`
- `npm run test:multi-move-qa`
- `npx tsx tests/runtimeBook/stage2Final21RuntimePackageAcceptance.test.ts`
- `npx tsx tests/runtimeBook/runtimeBookLoader.test.ts`
- `npx tsx tests/runtimeBook/runtimeBookLookup.test.ts`
- `npx tsx tests/runtimeBook/runtimeBookNoRuntimeWiring.test.ts`
- Note: direct sandboxed `tsx` execution hit `EPERM` (`/tmp/tsx-1000/91.pipe`), then required tests were rerun unsandboxed and passed.

## Pass/fail summary

- D.1 isolated runtime loader/index/query implementation: pass
- Required runtime package invariants and lookups: pass
- No runtime wiring/trainer integration: pass

## Known limitations

- Loader expects current runtime JSONL schema and validates minimally required keys; schema evolution may require type/validation updates.
- Loader is intentionally file-path scoped to this package and does not provide version auto-discovery.
- No app/trainer integration is included in D.1 by design.

## Next recommended step

- `D.2 — runtime book before continuation integration`

D1_RUNTIME_BOOK_LOADER_STATUS: ACCEPTED
