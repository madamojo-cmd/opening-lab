# Rollback Plan

Use this plan when a production deployment shows launch-blocking behavior.

## Checkpoint Strategy

Before deploying, create both a branch and an annotated tag from the known-good commit:

```bash
git branch checkpoint/2026-06-26-launch-ready
git tag -a blundr-launch-2026-06-26 -m "Blundr launch-ready checkpoint"
```

For each promoted build, record:

- Commit SHA
- Deployment URL
- Build command output
- Test command output
- Largest `.next/static/chunks` summary
- Maia mode: enabled or disabled

## Known-Good Build Tag

Use `blundr-launch-2026-06-26` as the launch known-good tag once the checklist passes.

If a later deployment fails, redeploy the tag or the provider's previous successful deployment.

## Fast Env Rollbacks

Maia:

```text
NEXT_PUBLIC_MAIA_API_ENABLED=false
MAIA_ENABLED=false
```

This disables client Maia requests and server lc0 spawning. Continuation training should continue through existing safe fallback behavior.

Visual model:

- There is no current dedicated visual-model env flag.
- If `/api/blundr-visual-model` causes production issues, disable or block that route at the deployment layer, or redeploy the known-good tag.
- Normal trainer move authority does not depend on visual-model output.

Debug:

```text
NEXT_PUBLIC_BLUNDR_DEBUG=
```

Leave unset in production unless collecting controlled diagnostics.

## Approved-Content Fallback Behavior

Approved content is not runtime move authority. If approved-content packet resolution fails or returns no packet, the trainer should use safe fallback copy and keep runtime move authority with the selected opening/book path.

Do not roll back by replacing runtime authority with approved content.

## Safe Fallback Copy Behavior

Safe fallback copy is allowed to keep the UI stable when provider data is unavailable. It must not:

- Claim engine certainty when Stockfish is unavailable.
- Reveal Plain View answers before Show More.
- Override the current runtime target.
- Make Maia a restricted-opening move source.

## Reverting A Bad Deployment

Preferred provider rollback:

1. Open the hosting provider deployment list.
2. Select the previous known-good deployment or the deployment built from `blundr-launch-2026-06-26`.
3. Promote it.
4. Set `NEXT_PUBLIC_MAIA_API_ENABLED=false` and `MAIA_ENABLED=false` if Maia is part of the incident.
5. Run route health checks.
6. Run the browser smoke script from `docs/LAUNCH_CHECKLIST.md`.

Git rollback option:

```bash
git switch main
git revert <bad_commit_sha>
npm run build
```

For a multi-commit incident, prefer a new revert commit over history rewriting. Do not use destructive commands on shared branches.

## Confirm Rollback Works

After rollback, confirm:

- `/` returns 200 and renders the trainer.
- `/api/maia/health` returns a stable disabled or ready response.
- `/api/stage2-approved-content/packet` returns a stable packet response or validation error for invalid payloads.
- `/api/blundr-visual-model` returns JSON for a simple valid payload or is intentionally blocked by deployment config.
- White opening starts.
- Black opening initial opponent handoff works.
- Legal move dots appear in Assisted View and Plain View.
- Plain View remains non-leaking before Show More.
- Continue From Here enters continuation.
- Maia disabled mode falls back safely.

## Incident Notes

Capture:

- Exact deploy URL
- Exact commit SHA
- Env var diff
- Browser console errors
- Server logs
- `/api/maia/health` response
- Whether the issue reproduces with Maia disabled
- Whether the issue reproduces in Plain View and Assisted View
