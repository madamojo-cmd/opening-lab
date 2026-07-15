# Blundr MVP release-candidate rollback runbook

This is a staging/release-candidate procedure. It does not authorize live
provider imports, canary rollout, or destructive database rollback.

1. Disable the affected Daily generation flag on the server.
2. Disable the affected provider independently (`BLUNDR_FEATURE_GAME_DATA_CHESS_COM`
   or `BLUNDR_FEATURE_GAME_DATA_LICHESS`).
3. Disable `BLUNDR_GAME_DATA_WORKER_ENABLED` and allow leased jobs to expire;
   inspect dead-letter and retryable states.
4. Switch Learning Core reads to the previous projection implementation when
   that compatibility switch is available; do not delete written events.
5. Disable `BLUNDR_FEATURE_REPERTOIRE_OPENING_DETAIL` if insight data is stale,
   unauthorized, or answer-bearing.
6. If runtime content is implicated, deploy the previous immutable runtime
   package/checksum rather than editing source datasets.
7. Redeploy the previous immutable checkpoint:
   `checkpoint-v2.10.7q0-step4-repertoire-intelligence-deep-minigames`.

Database rollback is forward-only. Preserve source facts, pause workers, and
apply a reviewed repair migration if needed. Never drop production tables or
rewrite append-only learning events as part of rollback.
