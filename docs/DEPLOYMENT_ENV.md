# Deployment Environment

This document is the launch reference for Blundr production environment variables and hosting constraints.

## Core App

| Variable | Required | Notes |
| --- | --- | --- |
| `OPENAI_API_KEY` | Optional for local deterministic training, required for GPT-backed `/api/brain` paths | Keep server-only. Never expose with `NEXT_PUBLIC_`. |
| `OPENAI_COACH_MODEL` | Optional | Defaults in code to `gpt-4o-mini` when not set. |
| `LICHESS_TOKEN` | Optional | Used by `/api/brain` and `/api/explorer` for authenticated Lichess requests. |
| `NEXT_PUBLIC_BLUNDR_DEBUG` | Optional | Set to `1` only for controlled diagnostics. Normal production should leave unset. |

`STOCKFISH_ENDPOINT` is not required. Browser Stockfish uses the copied `public/stockfish/` assets.

## Maia

| Variable | Required | Recommended production value | Notes |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_MAIA_API_ENABLED` | Optional | `false` unless Maia is deployed and tested | Client-side gate for calling `/api/maia/opponent-reply`. This is safe to expose. |
| `MAIA_ENABLED` | Optional | `true` only when the remote service has passed health checks | Server-side runtime gate. |
| `MAIA_REMOTE_URL` | Required in production when `MAIA_ENABLED=true` | Authenticated `https://` move endpoint | Production rejects HTTP and local-process configuration. |
| `MAIA_REMOTE_HEALTH_URL` | Optional | Authenticated `https://` health endpoint | Defaults to `/health` beside `MAIA_REMOTE_URL`. The response must include `ready: true`. |
| `MAIA_REMOTE_TOKEN` | Required in production when `MAIA_ENABLED=true` | Scoped service token | Server-only bearer credential. Never expose with `NEXT_PUBLIC_`. |
| `MAIA_LC0_PATH` | Development only | Absolute local path to `lc0` | Rejected as a production transport. Must never ship to browser bundles. |
| `MAIA_WEIGHTS_PATH` | Development only | Absolute local path to Maia weights | Rejected as a production transport. Must never ship to browser bundles. |
| `MAIA_SKILL_LEVEL` | Optional | `maia-1500` | Allowed values: `maia-1100` through `maia-1900`. Rating-band mapping may override request skill. |
| `MAIA_TIMEOUT_MS` | Optional | `1500` to `2500` | Server clamps requests to a bounded timeout. |
| `MAIA_NODES` | Optional | `1` | Keep low for launch because lc0 is spawned per request. |
| `MAIA_CACHE_ENABLED` | Optional | `true` | Reserved runtime configuration; safe to keep enabled. |
| `MAIA_MAX_CONCURRENT_REQUESTS` | Optional | `1` or `2` | Hard concurrency guard. Overload returns a stable unavailable response. |
| `MAIA_BACKEND` | Optional | Host-specific | Passed to lc0 as `--backend=...` when present. |

Local `lc0` plus weights is acceptable for development and test only. Production and isolated staging require the authenticated HTTPS remote service. If that service is unavailable, continuation stops with an explicit error and plays no Stockfish, Lichess, random, runtime, fixture, or cached substitute move. The app can run safely with Maia disabled by setting both `NEXT_PUBLIC_MAIA_API_ENABLED=false` and `MAIA_ENABLED=false`.

No `lc0` binary or Maia weights should ship to the browser. `.maia/`, `*.pb.gz`, and engine model formats are ignored as local/server runtime assets.

## Visual Model

`/api/blundr-visual-model` currently uses the in-repo rule visual selector path and does not require a dedicated visual-model environment variable.

Operational controls:

- Leave `NEXT_PUBLIC_BLUNDR_DEBUG` unset for normal production.
- If visual-model behavior must be rolled back, disable the route at the deployment layer or revert to the last known-good deployment. There is no current runtime env switch for this route.

## Approved Content

Approved content is backed by in-repo generated packages and server route validation. There are no production env vars required for the default approved-content API path.

Relevant code-level constants:

- `STAGE2_APPROVED_CONTENT_ENABLED`
- `STAGE2_COACHING_RESOLVER_ENABLED`
- `STAGE2_SAFE_FALLBACK_ENABLED`

These are compile-time flags in `lib/blundr/stage2Coaching/stage2CoachingFlags.ts`, not deployment env vars. Do not use approved content as runtime move authority; runtime move authority remains with the runtime opening/book paths.

## Launch Build Environment

Use the webpack production build path:

```bash
NEXT_TELEMETRY_DISABLED=1 NODE_OPTIONS="--max_old_space_size=4096" npm run build
```

`npm run build` and `npm run build:launch` both use `next build --webpack`.

## Route Health Commands

Set a base URL first:

```bash
BASE_URL="http://localhost:3000"
```

Root page:

```bash
curl -fsS "$BASE_URL/" >/tmp/blundr-root.html
```

Maia health:

```bash
curl -fsS "$BASE_URL/api/maia/health"
```

Maia opponent reply:

```bash
curl -fsS "$BASE_URL/api/maia/opponent-reply" \
  -H "Content-Type: application/json" \
  -d '{
    "requestId": 1,
    "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    "fen4": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -",
    "sideToMove": "w",
    "legalMovesUci": ["e2e4", "d2d4", "g1f3", "c2c4"],
    "skillLevel": "maia-1500",
    "timeoutMs": 1500,
    "ratingBandId": "club",
    "requestedRating": 1500
  }'
```

Approved-content packet:

```bash
curl -fsS "$BASE_URL/api/stage2-approved-content/packet" \
  -H "Content-Type: application/json" \
  -d '{
    "openingId": "italian-white",
    "targetUci": "e2e4",
    "surface": "assisted",
    "playKeyBefore": "",
    "playKey": "e2e4",
    "targetSan": "e4",
    "learnerSide": "white",
    "sideToMove": "white"
  }'
```

Visual model:

```bash
curl -fsS "$BASE_URL/api/blundr-visual-model" \
  -H "Content-Type: application/json" \
  -d '{
    "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    "openingName": "Italian Game",
    "userColor": "white",
    "expectedMove": { "uci": "e2e4", "san": "e4" }
  }'
```
