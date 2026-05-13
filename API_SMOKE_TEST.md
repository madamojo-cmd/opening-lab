# Blundr Visual Model API Smoke Test

This smoke test is local-only and does not call any external service.

## Prerequisites

1. Build the app:
   - `npm run build`
2. Start the production server on a known local port:
   - `npm start -- --port 3200`

## Run smoke script

In a second terminal:

```bash
node scripts/smoke-visual-model.mjs
```

Optional override:

```bash
BLUNDR_BASE_URL=http://127.0.0.1:3000 node scripts/smoke-visual-model.mjs
```

## What it validates

1. A valid payload returns HTTP 200 and does not include `suppress: ["recommendation_pending"]`.
2. An invalid-fen payload returns HTTP 200 fallback output that includes `suppress: ["recommendation_pending"]`.
3. Response shape includes visual fields (`source`, `fallback`, `arrows`, `squares`).

