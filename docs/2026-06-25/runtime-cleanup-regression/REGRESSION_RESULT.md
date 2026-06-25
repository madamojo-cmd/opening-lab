# Runtime Cleanup Regression Result

The performance cleanup commit `b979852 Lazy load runtime repertoire data from app shell` was reverted by `fab5c08` after manual testing showed runtime regressions.

## Regression observed after b979852

- Some openings would not load/start.
- Some openings that did start had broken mid-line pause/non-terminal behavior around move 6.
- This indicated the optimization changed runtime line availability semantics, not only bundle shape.

## Recovery

`git revert b979852` produced:

- `fab5c08 Revert "Lazy load runtime repertoire data from app shell"`

After revert, the app returned to the prior working behavior.

## Verification after revert

Passed:

- `npm run build`
- `npm run test:trainer-debug`
- `npm run test:coach-quality`
- `npm run test:multi-move-qa`
- `node --import tsx tests/coach/adaptiveOpeningIdentity.test.ts`
- `node --import tsx tests/coach/lichessOpeningIdentity.test.ts`
- `node --import tsx tests/coach/stage2AllOpeningsNoContinuationAtPly6Of12.test.ts`
- `node --import tsx tests/coach/stage2AllOpeningsCompleteAtPly12Of12.test.ts`
- `node --import tsx tests/coach/stage2BookEndTransitionsToContinuationOnlyAfterUserClick.test.ts`

Manual browser testing confirmed the fallback/restored runtime behavior works as before and passes the expected app behavior checks.

## Rule for future optimization

Do not lazy-load or split runtime repertoire data unless tests prove:

1. Every selectable Stage 2 opening can load/start.
2. The selected opening has non-empty line data before start logic runs.
3. Runtime line availability semantics are unchanged.
4. Mid-line non-terminal behavior remains correct.
5. Ply-12 terminal behavior remains correct.
6. Continue From Here remains explicit-click gated and terminal-only.

Any future cleanup must optimize bundle shape without changing training authority or runtime availability.
