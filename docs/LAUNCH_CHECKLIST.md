# Launch Checklist

Use this checklist before promoting a Blundr deployment.

## Clean Install And Build

From a clean checkout:

```bash
npm install --registry=https://registry.npmjs.org/
npm run postinstall
NEXT_TELEMETRY_DISABLED=1 NODE_OPTIONS="--max_old_space_size=4096" npm run build
```

Confirm:

- `npm run build` uses `next build --webpack`.
- Build finishes without `/tmp/next-panic-*` logs.
- `find public/stockfish -size +50M -print` prints nothing.
- No `lc0` binary or Maia weights are present in browser assets.

## Required Automated Tests

Run:

```bash
npx tsx tests/coach/stage2NoUnsafePerformanceSplit.test.ts
npx tsx tests/coach/stage2NoNodeFsInAppPageClientGraph.test.ts
npx tsx tests/coach/stage2BlackOpeningInitialOpponentHandoff.test.ts
npx tsx tests/coach/legalMoveDotsVisibility.test.ts
npx tsx tests/coach/plainViewNoLeakBeforeShowMore.test.ts
npx tsx tests/coach/plainViewShowMoreParity.test.ts
npx tsx tests/coach/stage2ContinuationMaiaReplyFlow.test.ts
npx tsx tests/coach/maiaApiRoute.test.ts
npx tsx tests/coach/maiaHealthRoute.test.ts
npm run test:trainer-debug
npm run test:multi-move-qa
npm run build
```

Expected high-level output:

- `stage2NoUnsafePerformanceSplit ok`
- `stage2NoNodeFsInAppPageClientGraph ok`
- `stage2BlackOpeningInitialOpponentHandoff ok`
- `legalMoveDotsVisibility ok`
- `plainViewNoLeakBeforeShowMore ok`
- `plainViewShowMoreParity ok`
- `stage2ContinuationMaiaReplyFlow ok`
- `maiaApiRoute ok`
- `maiaHealthRoute ok`
- Trainer debug QA passes.
- Multi-move QA passes.
- Production build route summary includes `/`, `/api/maia/health`, `/api/maia/opponent-reply`, `/api/stage2-approved-content/packet`, and `/api/blundr-visual-model`.

## Generated Payload And Bundle Guard

After `npm run build`, confirm the initial app payload does not reintroduce monolithic runtime or approved-content bodies:

```bash
rg -n "runtimeLines/|stage2RuntimeTrainableRepertoires.generated|stage2ApprovedContentPackage.generated" \
  .next/static/chunks \
  .next/server/app/page.js \
  .next/server/app/index.html \
  .next/server/app/api
```

Expected: no matches in the initial page client payload. Server API chunks may contain approved-content route code only where expected.

Record the largest static chunks:

```bash
find .next/static/chunks -type f -printf '%s %p\n' | sort -nr | head -30
```

## Route Health Checks

Set:

```bash
BASE_URL="http://localhost:3000"
```

Check:

```bash
curl -fsS "$BASE_URL/" >/tmp/blundr-root.html
curl -fsS "$BASE_URL/api/maia/health"
```

Use the POST commands in `docs/DEPLOYMENT_ENV.md` for:

- `/api/maia/opponent-reply`
- `/api/stage2-approved-content/packet`
- `/api/blundr-visual-model`

## Maia Smoke Tests

Maia disabled:

- Set `NEXT_PUBLIC_MAIA_API_ENABLED=false`.
- Set `MAIA_ENABLED=false`.
- Start the app.
- Confirm `/api/maia/health` reports `enabled: false` and `status: "disabled"`.
- Enter continuation and verify the app falls back safely without blocking training.

Maia enabled:

- Set `NEXT_PUBLIC_MAIA_API_ENABLED=true`.
- Set `MAIA_ENABLED=true`.
- Set valid `MAIA_LC0_PATH` and `MAIA_WEIGHTS_PATH`.
- Confirm `/api/maia/health` reports `ready: true`.
- Enter continuation, make a legal user continuation move, and confirm an opponent reply is applied only after continuation is active.

## Browser Manual Smoke Script

1. Load `/` and confirm the home/repertoire catalog renders.
2. Start one White-user opening, for example Italian Game.
3. Select a legal White piece in Assisted View and confirm legal move dots appear.
4. Make the instructed White move and confirm the opponent reply proceeds.
5. Switch to Plain View, select a legal piece, and confirm legal move dots still appear.
6. Confirm Plain View does not reveal answer copy before Show More.
7. Start one Black-user opening, for example Sicilian Defense.
8. Confirm the first opponent/book move auto-plays for the Black-user opening.
9. Select a legal Black piece and confirm legal move dots respect board orientation.
10. Train until line complete and confirm the line-complete surface appears.
11. Click Continue From Here.
12. Make a legal user continuation move.
13. Confirm Maia replies when enabled, or safe continuation fallback replies when disabled.
14. Reset/restart the line and confirm no stale dots or pending opponent reply remain.
15. Switch openings and confirm only the selected opening loads for training.
16. Switch rating bands and confirm openings remain visible even when rating metadata is missing.

## Assisted And Plain View Checks

- Assisted View can show instructional guidance and answer-supporting overlays.
- Plain View hides answer-revealing guidance until Show More.
- Both views show basic legal destination dots when the user selects a legal piece.
- Dots clear after move, deselect, reset, opening switch, opponent move, or Maia reply.

## Black And White Opening Checks

- White-user openings begin on the learner's first move.
- Black-user openings auto-play the first opponent/book move before learner input.
- Restricted mode uses runtime book authority before continuation.
- Maia is continuation-only and never restricted-opening move authority.

## Rollback Confirmation

Before launch, create a checkpoint branch and tag as described in `docs/ROLLBACK_PLAN.md`.

Confirm rollback path:

- Current deployment can be replaced by the previous known-good deployment.
- `MAIA_ENABLED=false` and `NEXT_PUBLIC_MAIA_API_ENABLED=false` disable Maia without code changes.
- Visual model route can be disabled at the deployment layer if needed.
- Approved-content route falls back safely and does not replace runtime move authority.
