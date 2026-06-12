# Stage 2 D.2 Runtime Book Before Continuation Report

## Scope

- Implemented D.2 only: runtime-book candidate authority is checked before Stockfish continuation authority.
- Used approved exception for minimal `app/page.tsx` seam wiring.
- No Stage 2 copy/content integration.
- No sample harness integration.
- No visual recipe rendering integration.
- No UI redesign.

## Integration seam chosen

- Seam: continuation target resolution path in `app/page.tsx` where `continuationResolvedTarget*` values are chosen before `resolveEffectiveContinuationCandidate`.
- Added minimal seam logic:
  - derive `openingId` (mapped to Stage 2 runtime IDs)
  - derive `playKeyBefore` from current SAN move history
  - query `/api/runtime-book/candidates`
  - if runtime candidates exist, promote runtime candidate before Stockfish
  - if runtime candidates do not exist, preserve existing Stockfish continuation target flow

## Files changed

- `app/page.tsx`
- `app/api/runtime-book/candidates/route.ts`
- `lib/blundr/runtime/resolveEffectiveContinuationCandidate.ts`
- `lib/blundr/runtimeBook/runtimeBookTypes.ts`
- `lib/blundr/runtimeBook/runtimeBookCandidateAdapter.ts`
- `lib/blundr/runtimeBook/getStage2RuntimeCandidatesForFrame.ts`
- `lib/blundr/runtimeBook/index.ts`
- `tests/coach/runtimeBookBeforeContinuation.test.ts`
- `tests/coach/runtimeBookExhaustionContinuation.test.ts`
- `tests/coach/runtimeBookNoCopyOrVisualIntegration.test.ts`
- `tests/coach/continuationSafetyBlockedRegression.test.ts`
- `tests/coach/effectiveContinuationCandidateAuthority.test.ts`
- `docs/2026-06-12/STAGE_2_D2_RUNTIME_BOOK_BEFORE_CONTINUATION_REPORT.md`

## Runtime book query key used

- Query key: `openingId + playKeyBefore`
- `openingId` source: selected repertoire ID, with explicit mapping where needed:
  - `caro-black` -> `caro-kann-black`
  - `ruy-white` -> `ruy-lopez-white`
- `playKeyBefore` source: UCI sequence reconstructed from `moveHistory` SAN list.

## Candidate adapter behavior

- Adapter converts runtime-book move rows into candidate objects for trainer authority path.
- Preserves metadata when available:
  - `rank`
  - `totalGames`
  - `playPct`
  - `profile` / `profiles`
  - `sourceDetail` / `sources`
- Candidate source is marked as runtime book (`stage2-runtime-book` context).
- Adapter is pure and does not mutate inputs.

## Book-before-continuation behavior

- When runtime candidates exist for frame key:
  - runtime candidate is promoted as continuation resolved target
  - source is `stage2-runtime-book`
  - status is `runtime_book_ready`
  - Stockfish is not candidate authority for that frame

## Book-exhaustion behavior

- When runtime candidates do not exist:
  - runtime returns `bookExhausted: true`
  - existing Stockfish continuation target resolution remains active
  - continuation gates and fallback behavior remain unchanged

## Plain View behavior confirmation

- No Plain View reveal logic changes were introduced.
- Changes are constrained to candidate authority seam before continuation target promotion.

## Assisted/Show More behavior confirmation

- No direct Assisted/Show More rendering logic changes were introduced.
- Existing surfaces consume whichever candidate authority is selected by the seam.

## Continuation gate confirmation

- Existing continuation gate logic (`ready_for_user`, user turn, explicit continuation, pause gating) was preserved.
- Runtime query only runs inside existing continuation-ready seam conditions.

## Stockfish/Maia confirmation

- Stockfish remains fallback authority after runtime-book exhaustion.
- Maia path was not modified.
- No Stockfish/engine override is applied when runtime-book candidate is present for frame key.

## Tests run

- `npm run test:coach-quality`
- `npm run test:trainer-debug`
- `npm run test:multi-move-qa`
- `npx tsx tests/runtimeBook/stage2Final21RuntimePackageAcceptance.test.ts`
- `npx tsx tests/runtimeBook/runtimeBookLoader.test.ts`
- `npx tsx tests/runtimeBook/runtimeBookLookup.test.ts`
- `npx tsx tests/runtimeBook/runtimeBookNoRuntimeWiring.test.ts`
- `npx tsx tests/coach/stockfishReadyNoSafetyBlocked.test.ts`
- `npx tsx tests/coach/continuationSafetyBlockedRegression.test.ts`
- `npx tsx tests/coach/effectiveContinuationCandidateAuthority.test.ts`
- `npx tsx tests/coach/runtimeBookBeforeContinuation.test.ts`
- `npx tsx tests/coach/runtimeBookExhaustionContinuation.test.ts`
- `npx tsx tests/coach/runtimeBookNoCopyOrVisualIntegration.test.ts`

## Pass/fail summary

- Runtime-book-before-Stockfish seam: pass
- Book-exhaustion fallback preservation: pass
- No copy/visual/sample integration in runtime candidate source path: pass

## Known limitations

- Runtime `playKeyBefore` uses SAN->UCI replay from tracked move history; if SAN history is invalid, runtime query is skipped and fallback behavior is preserved.
- Runtime opening coverage only applies to the 21 Stage 2 runtime opening IDs.
- Runtime candidate promotion currently uses top sorted runtime candidate for target authority frame.

## Next recommended step

- `D.3 — runtime book UI alignment review`

D2_RUNTIME_BOOK_BEFORE_CONTINUATION_STATUS: ACCEPTED
