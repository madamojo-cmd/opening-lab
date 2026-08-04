# Blundr staging 3.99 rollback runbook

This is a staging/release-candidate procedure. It does not authorize live
provider imports, canary rollout, or destructive database rollback.

Before acceptance, record the previous accepted full Git SHA, immutable
deployment URL, migration head, runtime package, and health response in the
golden-journey artifact. A rollback rehearsal is required; a declared SHA is
not evidence by itself.

1. Stop the game-import cron by removing its cron credential, and let active
   leases expire. Do not delete jobs or imported games.
2. Disable the affected Daily generation flag on the server.
3. Disable the affected provider independently (`BLUNDR_FEATURE_GAME_DATA_CHESS_COM`
   or `BLUNDR_FEATURE_GAME_DATA_LICHESS`).
4. Switch Learning Core reads to the previous projection implementation when
   that compatibility switch is available; do not delete written events.
5. Disable `BLUNDR_FEATURE_REPERTOIRE_OPENING_DETAIL` if insight data is stale,
   unauthorized, or answer-bearing.
6. If runtime content is implicated, deploy the previous immutable runtime
   package/checksum rather than editing source datasets.
7. Redeploy the previous accepted full SHA recorded in the exact-SHA artifact.
8. Request `/api/build-info` with the release-evidence header and verify the
   returned SHA is the rollback SHA. Confirm `/api/health` reports ready.
9. Re-run the account, progress, and provider-status read journeys against the
   rollback deployment. Record the deployment ID/URL and results at the HTTPS
   evidence URL supplied to the golden-journey runner.

Database rollback is forward-only. The 3.99 migrations are additive and must
remain applied when code rolls back. Preserve source facts, pause workers, and
apply a reviewed repair migration if needed. Never drop production tables,
decrement the migration ledger, or rewrite append-only learning events.
