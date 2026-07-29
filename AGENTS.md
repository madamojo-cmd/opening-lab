# Blundr agent operating contract

This repository—not a chat transcript—is the permanent source of truth for
Blundr. Every engineer or AI agent must follow this contract before changing
code, data, migrations, flags, integrations, or user-facing behavior.

## Required orientation

Read these files before editing:

1. `docs/product/BLUNDR_SYSTEM_REGISTRY.md`
2. `docs/product/blundr-system-registry.json`
3. `docs/product/BLUNDR_CHANGE_PROTOCOL.md`
4. The registry entries and tests for every affected feature ID

Use the registry to locate the authoritative implementation. Do not create a
second reward system, progression store, opening-data loader, opponent path, or
minigame runner because the existing path is unfamiliar.

## Mandatory change protocol

Before implementation:

- Name every affected registry feature ID.
- Trace the current UI → state → API → service → persistence/RLS path.
- Identify contracts, flags, migrations, data packages, fallbacks, and tests
  that could be affected.
- Preserve unrelated worktree changes.

In the same coherent change:

- Make the smallest complete repair.
- Add regression coverage for the user promise and failure modes.
- Update affected registry entries and architectural decisions.
- Add forward-only migrations for schema changes.
- Declare every new environment variable and feature flag.
- Remove an old path only after all readers, writers, tests, and operations
  documents have moved to the replacement.

Before handoff:

- Run the real scripts from `package.json`; do not guess command names.
- Run registry, data, migration, security, type, test, and build gates that
  apply to the change.
- Record the exact passing Git SHA and exact-SHA staging evidence.
- Keep an entry `partial` or `blocked` when deployed proof is missing.

## Non-negotiable product boundaries

- Guided opening replies come from the versioned opening runtime. They are not
  Maia.
- Anything labeled Maia must originate from the approved server-side Maia
  adapter and record model/rating/fallback provenance. Stockfish, opening-book,
  random, fixture, or cached generic moves may never be silently labeled Maia.
- Rewards, rings, seen lines, weaknesses, and account progress require the
  hydrated authenticated user identity and idempotent durable writes.
- Protected Preview, staging, and Production routes must not fall back to
  local-demo or in-memory persistence.
- Minigame solutions, accepted moves, engine evidence, credentials, and
  service-role data remain server-owned until an explicit reveal permits the
  relevant answer.
- Opening JSONL runtime data and smaller CSV reference exports are not
  interchangeable. Follow the opening-data manifest and validators.

## Build and verification commands

Inspect `package.json` first. The main gates are:

```text
npm run typecheck
npm run lint
npm run format:check
npm run verify:registry
npm run verify:deep-minigame-catalog
npm run security:audit
npm run verify:migrations
npm run test:unit
npm run test:component
npm run test:integration
npm run test:security
npm run build
npm run bundle:audit
git diff --check
```

`npm run verify:registry:release` is intentionally stricter. It must remain red
until every release-critical entry has exact-SHA staging evidence. A green local
build does not authorize changing a registry entry to `verified`.

## Deprecation rules

- Mark the replacement and removal conditions in the registry before
  deprecating a path.
- Prefer additive migrations: add, backfill, switch readers, switch writers,
  verify, then remove in a later release.
- Never silently change a public response, completion key, reward amount,
  canonical identifier, dataset authority, or fallback.
- Do not delete historical migrations or rewrite an applied migration.

## Current project structure

- `app/`: Next.js routes and server endpoints.
- `components/`: user-facing React surfaces.
- `lib/blundr/`: product contracts, chess logic, services, and persistence.
- `supabase/migrations/`: forward-only database history.
- `scripts/`: deterministic validators and release checks.
- `docs/product/`: product contracts and registry.
- `docs/architecture/`: system and data-flow decisions.
- `docs/operations/`: environment, staging, and release procedures.

Stockfish browser assets must remain browser-safe and are copied through the
existing `scripts/copy-stockfish.js` flow. Do not add heavyweight binaries to
`public/stockfish`.
