# Blundr change protocol

Every change starts with feature IDs from
`docs/product/blundr-system-registry.json`. The goal is to make agents
replaceable without making product behavior disposable.

## 1. Impact statement

Record:

- affected feature IDs;
- user promise being changed or repaired;
- current authoritative path from UI to persistence;
- expected files, flags, migrations, datasets, external services, and tests;
- compatibility and rollback risks.

If no registry entry covers the promise, add one before implementation. Do not
hide a new subsystem inside an unrelated entry.

## 2. Implementation

- Keep one authoritative writer for each durable state.
- Reuse the existing identity, idempotency, and RLS contracts.
- Keep answers and provider secrets on the server.
- Make failure states truthful; a named provider cannot silently become a
  different provider.
- Use additive migrations and preserve rollback compatibility.
- Version generated data and make the build deterministic.

## 3. Proof

Use the smallest test pyramid that proves the full promise:

1. unit and contract tests for deterministic rules;
2. component tests for loading, error, concurrency, and accessibility states;
3. API/service integration tests for identity and persistence;
4. RLS/security tests for cross-user and signed-out isolation;
5. browser journeys for critical user promises;
6. exact-SHA staging/database evidence for release-critical entries.

An endpoint returning `200` is not evidence that rewards, rings, Maia, imports,
or progress worked. Verify the visible UI and the durable record.

## 4. Registry update

Update the same feature entry in the same commit:

- authoritative paths and dependencies;
- migrations, flags, and fallback behavior;
- regression tests;
- status and remaining blockers;
- exact SHA and evidence only after that exact SHA is verified.

Use `partial` when code exists but exact deployed proof is absent. Use `blocked`
when a release-critical dependency or contract is unproven.

## 5. Release discipline

- Deploy the exact passing SHA to one immutable Preview.
- Verify deployment metadata reports that SHA.
- Confirm environment-variable names and migration parity without recording
  secret values.
- Complete the registry acceptance evidence.
- Move the stable staging alias only after the strict registry release gate,
  critical browser journeys, and rollback target pass.
- Never touch Production unless the user explicitly authorizes it.
