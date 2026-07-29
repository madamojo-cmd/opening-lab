# Blundr system registry

The machine-readable authority is
[`blundr-system-registry.json`](./blundr-system-registry.json). This document
explains how to use it.

| Feature ID | Promise | Current state |
| --- | --- | --- |
| `AUTH-ACCOUNT-001` | Authenticated account state survives recovery and reauthentication | Partial |
| `ONBOARD-001` | Onboarding owns starter selection and persists completion | Partial |
| `TRAIN-RUNTIME-001` | Guided opening play uses the versioned runtime | Partial |
| `TRAIN-MAIA-001` | Maia-labelled continuation uses a proven Maia provider | Blocked |
| `REWARD-001` | Completions award exactly once to the authenticated user | Partial |
| `RINGS-001` | Tempo, Battery, and Blundr fill only their intended rings | Partial |
| `REVIEW-SRS-001` | Review/SRS records durable learning outcomes | Partial |
| `REPERTOIRE-001` | Repertoire and canonical seen lines persist | Partial |
| `IMPORT-001` | Provider imports produce truthful games and weaknesses | Partial |
| `MINIGAME-PROCEDURAL-001` | Procedural games are varied, legal, and solvable | Partial |
| `MINIGAME-DEEP-001` | Deep games use server-owned, engine-certified multi-step content | Partial |
| `DATA-OPENINGS-001` | One versioned opening package is canonical | Partial |
| `OBSERVABILITY-001` | Failures are measurable without leaking private data | Partial |
| `RELEASE-001` | One exact SHA, migration state, and rollback target define release | Blocked |

`partial` is not failure; it is an honest statement that implementation exists
but required exact-SHA or end-to-end evidence is incomplete. The strict release
validator rejects all release-critical entries that are not `verified`.

## Status meanings

- `verified`: the exact recorded SHA passed every required automated and
  deployed check, and its evidence is recorded.
- `partial`: implementation exists, but one or more required contracts or
  deployed proofs are outstanding.
- `blocked`: the user promise cannot be truthfully released.
- `deprecated`: no new callers are allowed; the replacement and removal gate
  must be recorded.

## Maintenance rule

Any pull request that changes a registered promise, implementation path,
persistent field, migration, feature flag, integration, dataset, fallback, or
required test must update the corresponding JSON entry. Structural validation
runs in CI. Exact-SHA evidence is never copied forward automatically.
