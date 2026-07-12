# Final App Integration Audit

## Specification source

The requested path under `opening-lab-rewards-final` was absent. The authoritative specification was found at `/workspaces/opening-lab/blundr-final-integration-master-prompt.txt`, read in full, and used for this integration. This path discrepancy is recorded as a bootstrap conflict; no copy was written into the target worktree.

## Ownership and change boundary

- `RINGS_PROFILE_AGENT`: Daily Rings loop repair, Profile route/components, and scoped tests.
- `REWARDS_AGENT`: canonical rewards validation console and reactive popup queue state.
- `MINIGAMES_AGENT`: uploaded package installation, generated runtime content, lazy loader, and player integration.
- `INFRA_QA_ARCHIVE_AGENT`: cleanup, integrated validation, evidence, and archive.
- `MASTER`: protected shared files, conflict resolution, final reports, and acceptance decisions.

## Protected behaviors

Rewards remain remote-first and idempotent. Preview controls are presentation-only. Failure and `shared_sync_failed` paths do not publish success. Opening Fragment and Choice Token unlocks remain selected-opening transactions. Minigame completion does not grant Repertoire Points.

## Audit status

The prior rewards popup adapter, host, queue, and Tempo Cache card remain canonical. The current completion pass adds validation-console wiring and queue observability rather than replacing that architecture. Profile and Daily Rings changes are isolated to their assigned paths. The minigame package is isolated to generated/runtime minigame paths and is being checked for eager imports before final acceptance.

## Remaining validation

Integrated tests, differential TypeScript, production build, route smoke, archive verification, and human browser QA are final-gate activities. Browser QA must remain pending unless directly performed.

## Change classification

Prior dirty paths include the earlier rewards foundation and its direct account, persistence, repertoire, daily-ring, and API dependencies. This completion pass adds the scoped Daily Rings/Profile repairs, rewards console/queue fixes, minigame package/runtime files, and final evidence documents. Generated `.next` output and caches are reproducible build artifacts and are not feature source. The minigame rollback backup is preserved. Uncertain pre-existing paths such as `next`, `node_modules`, and unrelated Figma design sources were left untouched.
