# Maia Service (Package 14B)

This folder documents runtime deployment options for Blundr Maia integration.

## MVP Mode
Run Maia through Next.js internal API routes:
- `/api/maia/health`
- `/api/maia/opponent-reply`

Mount/install:
- `lc0` binary
- Maia weights (`.pb.gz`)

## Docker Note
`Dockerfile` and `docker-compose.example.yml` are best-effort templates.
Actual lc0 install path may be platform-specific and should be validated per environment.

## Health Check
Use:
- `npm run maia:check`
- optional: `npm run maia:bench`
