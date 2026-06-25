# Step C Preflight Cleanup Report

## Before largest client chunk

`15.22 MB` at `.next/static/chunks/0tjr9-rbkxrms.js`

## After largest client chunk

`15.22 MB` at `.next/static/chunks/0r~6qgi.~~ob6.js`

## Before dev TTFB

The baseline dev request never returned a page body in the first probe window. The saved timing line in `dev-curl-before.txt` shows the request only ended after the server was interrupted, with `ttfb=213.043478s` and `bytes=0`.

## After dev TTFB

The after-change probe timed out without receiving bytes in `20.002533s`. See `dev-curl-after.txt`.

## Files changed

- [`app/page.tsx`](/workspaces/opening-lab/app/page.tsx)
- [`tests/coach/stage2NoUnsafePerformanceSplit.test.ts`](/workspaces/opening-lab/tests/coach/stage2NoUnsafePerformanceSplit.test.ts)
- [`docs/2026-06-25/step-c-preflight-cleanup/dev-curl-after.txt`](/workspaces/opening-lab/docs/2026-06-25/step-c-preflight-cleanup/dev-curl-after.txt)
- [`docs/2026-06-25/step-c-preflight-cleanup/STEP_C_PREFLIGHT_CLEANUP_REPORT.md`](/workspaces/opening-lab/docs/2026-06-25/step-c-preflight-cleanup/STEP_C_PREFLIGHT_CLEANUP_REPORT.md)

## Tests added or updated

- Updated `tests/coach/stage2NoUnsafePerformanceSplit.test.ts`
- Verified the existing `tests/coach/stage2SelectableOpeningsStartable.test.ts`
- Verified the existing `tests/coach/stage2AllOpeningsMidlineNonTerminalBehavior.test.ts`

## Tests passed

- `node --import tsx tests/coach/stage2SelectableOpeningsStartable.test.ts`
- `node --import tsx tests/coach/stage2AllOpeningsMidlineNonTerminalBehavior.test.ts`
- `node --import tsx tests/coach/stage2NoUnsafePerformanceSplit.test.ts`
- `node --import tsx tests/coach/stage2AllOpeningsNoContinuationAtPly6Of12.test.ts`
- `node --import tsx tests/coach/stage2AllOpeningsCompleteAtPly12Of12.test.ts`
- `node --import tsx tests/coach/stage2BookEndTransitionsToContinuationOnlyAfterUserClick.test.ts`
- `npm run build`

## Manual browser checks required

1. App opens from a normal Codespaces browser link, not only the editor preview.
2. Every visible Stage 2 opening can start.
3. `Continue From Here` only appears at true line completion.
4. Plain View still hides the answer until the intended reveal flow.

## Remaining risks

- The largest client chunk did not move in a measurable way because the app is still dominated by the runtime and chess payloads.
- Dev-server first response is still not reliable in this sandbox, so browser smoke is still required.
- The runtime repertoire loader remains synchronous and authoritative; I did not take the riskier async line-body split.
