# BLUNDR Maia Self-Hosting Setup

## Purpose
Blundr uses Maia only for continuation-mode opponent replies.

## Maia Is Not Allowed To Control
- user teaching target
- CurrentInstructionFrame.target
- VisibleTeachingSurface mode/copy/actions
- Stockfish suggestion validation
- MultiPV 32 user move rating
- branch-complete timing

## Why Self-Hosted
Blundr uses an internal route and local runtime adapter, not unofficial public endpoints.

## Architecture
Production: Frontend -> `/api/maia/opponent-reply` -> authenticated HTTPS Maia service -> exact-frame legal UCI candidate -> frontend stale/legal guards -> opponent reply.

Development/test may use `MaiaLc0RuntimeAdapter` with local `lc0` and weights. That transport is rejected when `NODE_ENV=production`.

## Environment Variables
- `NEXT_PUBLIC_MAIA_API_ENABLED=true`
- `MAIA_ENABLED=true`
- `MAIA_REMOTE_URL=https://maia.example.internal/move`
- `MAIA_REMOTE_HEALTH_URL=https://maia.example.internal/health`
- `MAIA_REMOTE_TOKEN=<scoped-service-token>`
- `MAIA_SKILL_LEVEL=maia-1500`
- `MAIA_TIMEOUT_MS=1500`
- `MAIA_NODES=1`
- `MAIA_MAX_CONCURRENT_REQUESTS=2`
- `MAIA_CACHE_ENABLED=true`

## Setup
1. Deploy a persistent Maia service with authenticated move and health endpoints.
2. Set the remote environment variables above on the isolated app target.
3. Confirm `/api/maia/health` reports `transport: remote` and `ready: true`.
4. Run an exact-position continuation journey and retain the request/deployment evidence.

## Disable / Fail Closed
Set `MAIA_ENABLED=false` and/or `NEXT_PUBLIC_MAIA_API_ENABLED=false`. Continuation reports Maia unavailable and plays no substitute opponent move.

## Known Limitations
- The local Package 14B adapter remains development-only.
- Remote service capacity and model lifecycle are operated separately from the app deployment.

## Deployment Notes
- The app deployment never spawns the production Maia process.
- The remote service must expose HTTPS and require the scoped bearer token.

## License Note
Maia and lc0 are GPL-family licensed. Obtain legal review for commercial distribution.

## Security Note
- Validate FEN and legal moves.
- Never shell-execute user input.
- Add route auth/rate-limit before public exposure.
