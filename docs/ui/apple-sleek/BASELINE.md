# Baseline Evidence

The pre-Apple-sleek presentation baseline is the exact release commit:

`cf8bafd0be884c51a880504d4b82818c446a2fe6`

This commit is preserved by:

- branch `checkpoint/pre-apple-sleek-ui-20260819`
- tag `checkpoint-pre-apple-sleek-ui-20260819`

The UI integration branch started from that exact commit:

`feat/apple-sleek-ui-20260819`

The baseline commit is the PR #20 merge that introduced server-verified learner-checkmate Battery authority. UI work must not weaken or reinterpret that authority.

## Evidence captured by setup

The checkpoint setup intentionally did not alter the user's original worktree. The original worktree may contain unrelated uncommitted files; those are not part of this UI branch.

## Baseline ring fingerprint

The governance setup records the SHA-256 of:

`components/daily-rings/NestedDailyRings.tsx`

at the frozen baseline.

The UI diff guard additionally prevents that file from changing.
