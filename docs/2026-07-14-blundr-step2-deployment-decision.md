# Combined Step 2 deployment decision

The repository has no existing durable worker platform or scheduled Edge Function. The bounded job runner therefore uses the authenticated Vercel Cron-compatible route:

`POST /api/blundr/jobs/process-game-import`

The route requires `Authorization: Bearer $CRON_SECRET` or `x-blundr-cron-secret: $CRON_SECRET`, processes at most three leased jobs per invocation, and each job processes at most 100 games. The worker requires `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `CRON_SECRET`, and `BLUNDR_FEATURE_PROVIDER_INGESTION=true`; user-facing connections additionally require `BLUNDR_FEATURE_GAME_DATA_CONNECTIONS=true` and the matching provider flag. These are isolated-staging environment values only and must never be committed.

Database-backed leases expire after one minute, are heartbeated while a batch is active, and are recovered as queued work after expiry. Every lease increments the existing attempt count. Retryable failures remain truthful as `retryable_error`, are retried up to five attempts, and then become `dead_letter`; permanent account failures remain `permanent_error`. The route returns only sanitized error codes and aggregate counts, never credentials, provider bodies, or PGNs.

The worker uses only server-side provider clients and the service-role persistence adapter. It emits sanitized job status/error codes through the import-job read model; provider response bodies, PGNs, credentials, and access tokens are not logged or returned.
