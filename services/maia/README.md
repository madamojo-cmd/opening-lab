# Blundr Maia production service

This directory is the deployable Maia authority used by Blundr continuation
play. It is a standalone service; it does not run the Next.js application.

## Guarantees

- Authenticated `POST /move`, `GET /health`, and `GET /metrics` endpoints.
- Unauthenticated boolean-only `GET /live` and `GET /ready` container probes.
- Nine Maia v1 networks (1100–1900), pinned to one upstream commit and checked
  by SHA-256 before the image is built and again at service startup.
- LCZero 0.32.1 pinned to one source commit and built with classic search.
- Exactly one policy evaluation (`nodes=1`), as specified by upstream Maia.
- Exact FEN4 and complete legal-move-set enforcement before inference.
- Persistent, bounded, least-recently-used LCZero workers. One inference runs
  per container; production scales horizontally with container instances.
- Fail-closed behavior. Timeouts, bad model output, overload, and auth failure
  never produce a substitute move.
- Structured logs that omit FENs, legal moves, tokens, and request bodies.

The wire contract is `blundr-maia-move.v1`. Every successful response carries
the service, provider, model SHA-256, engine version/commit, search mode, node
count, and backend. The Blundr adapter rejects a response whose provenance does
not match `model-manifest.json`.

## Local verification

```bash
npm ci
npm run verify
docker build -t blundr-maia:local .
docker run --rm -p 127.0.0.1:8080:8080 \
  -e MAIA_SERVICE_TOKEN="$(openssl rand -hex 32)" \
  blundr-maia:local
```

In another terminal, export the same token and run `npm run smoke`.

## Production configuration

| Variable                  | Required | Default                         | Purpose                                                          |
| ------------------------- | -------- | ------------------------------- | ---------------------------------------------------------------- |
| `MAIA_SERVICE_TOKEN`      | Yes      | none                            | Bearer token, at least 32 bytes. Store in a secret manager.      |
| `PORT`                    | Platform | `8080`                          | HTTP listener required by Cloud Run.                             |
| `MAIA_BACKEND`            | No       | `blas`                          | LCZero inference backend.                                        |
| `MAIA_REQUEST_TIMEOUT_MS` | No       | `2500`                          | Server-side inference deadline, 250–5000 ms.                     |
| `MAIA_STARTUP_TIMEOUT_MS` | No       | `30000`                         | LCZero startup/readiness deadline.                               |
| `MAIA_QUEUE_LIMIT`        | No       | `32`                            | Bounded per-container waiting requests.                          |
| `MAIA_MAX_WARM_WORKERS`   | No       | `3`                             | Maximum rating-specific LCZero workers retained in one instance. |
| `MAIA_PREWARM_SKILLS`     | No       | `maia-1100,maia-1500,maia-1900` | Skills proven and loaded before readiness.                       |
| `MAIA_LOG_LEVEL`          | No       | `info`                          | `debug`, `info`, `warn`, or `error`.                             |

`MAIA_ALLOW_INSECURE_DEV_TOKEN=true` exists only for isolated tests. Never set
it in staging or production.

## Capacity model

Configure the hosting platform for concurrency `1`. Each request consumes one
LCZero worker, and the platform scales containers horizontally. Keep at least
one instance warm for interactive latency. Set a finite maximum instance count
to cap cost, and alert on HTTP 503/504 responses and the authenticated metrics.

## Third-party licensing

LCZero is GPL-3.0-or-later and its license is included in the image. The Maia
repository publishes the networks alongside its GPL license, but the upstream
weights do not carry a separate explicit license grant. The image therefore
records `redistributionReviewRequired: true`; obtain counsel/maintainer
confirmation before commercial redistribution. No weight or LCZero binary is
committed to the Blundr repository.
