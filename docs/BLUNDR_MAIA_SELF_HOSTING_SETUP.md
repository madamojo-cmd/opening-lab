# Blundr Maia self-hosting setup

The production implementation and operator procedure are maintained in
[`operations/blundr-maia-production.md`](./operations/blundr-maia-production.md).

Blundr production uses this single path:

`/train` -> `/api/maia/opponent-reply` -> authenticated HTTPS Maia service ->
pinned Maia/LCZero policy response -> app exact-frame, legal-move, and
provenance validation.

Local LCZero remains a development-only adapter. Production never spawns LCZero
inside Vercel, never sends model assets to the browser, and never substitutes a
different opponent when the Maia authority is unavailable.
