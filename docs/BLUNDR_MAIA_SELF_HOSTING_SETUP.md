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
Frontend -> `/api/maia/opponent-reply` -> MaiaLc0RuntimeAdapter -> `lc0 --weights=<maia weights>` -> legal UCI candidate -> frontend stale/legal guards -> opponent reply.

## Environment Variables
- `NEXT_PUBLIC_MAIA_API_ENABLED=true`
- `MAIA_ENABLED=true`
- `MAIA_LC0_PATH=/absolute/path/to/lc0`
- `MAIA_WEIGHTS_PATH=/absolute/path/to/.maia/maia-1500.pb.gz`
- `MAIA_SKILL_LEVEL=maia-1500`
- `MAIA_TIMEOUT_MS=1500`
- `MAIA_NODES=1`
- `MAIA_MAX_CONCURRENT_REQUESTS=2`
- `MAIA_CACHE_ENABLED=true`

## Setup
1. `npm run maia:setup 1500`
2. Install `lc0` for your platform.
3. Set env vars above.
4. Run `npm run maia:check`.
5. Optionally run `npm run maia:bench`.

## Disable/Fallback
Set `MAIA_ENABLED=false` and/or `NEXT_PUBLIC_MAIA_API_ENABLED=false`; continuation fallback path remains active.

## Known Limitations
- Package 14B adapter uses per-request process spawn for safety/simplicity.
- Warm worker pool deferred to Package 14C.

## Deployment Notes
- Serverless targets may be unsuitable for engine process work.
- Containerized backend/worker deployment is preferred for production.

## License Note
Maia and lc0 are GPL-family licensed. Obtain legal review for commercial distribution.

## Security Note
- Validate FEN and legal moves.
- Never shell-execute user input.
- Add route auth/rate-limit before public exposure.
