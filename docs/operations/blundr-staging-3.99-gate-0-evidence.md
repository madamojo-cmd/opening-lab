# BLUNDR-STAGING 3.99 Gate 0 Evidence

Date: 2026-08-03 UTC

## Repository and preservation

- Repository remote: `https://github.com/madamojo-cmd/opening-lab`
- The pre-existing dirty primary worktree was inspected read-only and preserved unchanged.
- The verified baseline worktree was clean.
- No baseline test suite was repeated.

## Authoritative data verification

Only the user-supplied JSONL files were treated as production inputs. CSV exports were not used.

Command:

```bash
wc -l docs/release-inputs/01-opening-nodes.v1.jsonl docs/release-inputs/04-candidate-moves.v1.jsonl
sha256sum docs/release-inputs/01-opening-nodes.v1.jsonl docs/release-inputs/04-candidate-moves.v1.jsonl
```

Results:

```text
7430 docs/release-inputs/01-opening-nodes.v1.jsonl
170860 docs/release-inputs/04-candidate-moves.v1.jsonl
fbc7d750a84b47ccc1e9c0b95d7fd2b511246beda2e65f99b1b5d2caf4ed9512 docs/release-inputs/01-opening-nodes.v1.jsonl
a8e76805524f256afb90583140f277d734266efb831155c8e9b98f424e5f97d4 docs/release-inputs/04-candidate-moves.v1.jsonl
```

Both files are ignored by the repository's `*.jsonl` rule and were not staged or committed.

## Baseline and lineage

Commands:

```bash
git -C .worktrees/blundr-agent-workflow-deep-minigames-overlay rev-parse HEAD
git rev-parse 1f6008a0506946f52a734be05ae7a757388b294f^
git merge-base --is-ancestor 4a14f78545e31f2147788c091a7d6b65eb12009d 1f6008a0506946f52a734be05ae7a757388b294f
git merge-base 4a14f78545e31f2147788c091a7d6b65eb12009d 1f6008a0506946f52a734be05ae7a757388b294f
```

Results:

```text
baseline HEAD: 1f6008a0506946f52a734be05ae7a757388b294f
baseline parent: 4a14f78545e31f2147788c091a7d6b65eb12009d
ancestor command status: 0
common ancestor: 4a14f78545e31f2147788c091a7d6b65eb12009d
```

The UI/onboarding SHA is the direct parent of the required baseline, so its lineage is preserved.

## Rollback tag and release branch

Created from the exact baseline:

```text
checkpoint/pre-blundr-staging-3.99-20260803
release/blundr-staging-3.99
```

The rollback ref is an annotated tag. Local verification produced:

```text
tag object type: tag
tag peeled target: 1f6008a0506946f52a734be05ae7a757388b294f
release branch target: 1f6008a0506946f52a734be05ae7a757388b294f
```

Only those two refs were pushed. Remote verification with `git ls-remote` produced:

```text
1f6008a0506946f52a734be05ae7a757388b294f refs/heads/release/blundr-staging-3.99
84094755508d5d52375ca29573611ccfab745012 refs/tags/checkpoint/pre-blundr-staging-3.99-20260803
1f6008a0506946f52a734be05ae7a757388b294f refs/tags/checkpoint/pre-blundr-staging-3.99-20260803^{}
```

Gate 0 passed. Wave 1 may begin from the verified baseline.
