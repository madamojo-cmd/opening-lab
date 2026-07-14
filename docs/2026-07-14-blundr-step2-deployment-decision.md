# Combined Step 2 deployment decision

The repository has no existing durable worker platform or scheduled Edge Function. The bounded job runner therefore uses the authenticated Vercel Cron-compatible route:

`POST /api/blundr/jobs/process-game-import`

The route requires `x-blundr-cron-secret`, processes at most three leased jobs per invocation, and each job processes at most 100 games. Database-backed leases expire after one minute and can be taken over by a later invocation. `BLUNDR_GAME_DATA_WORKER_ENABLED` is a server-side kill switch and defaults off. `BLUNDR_GAME_DATA_ENABLED` separately gates user-facing connection creation.

The worker uses only server-side provider clients and the service-role persistence adapter. It emits sanitized job status/error codes through the import-job read model; provider response bodies, PGNs, credentials, and access tokens are not logged or returned.
