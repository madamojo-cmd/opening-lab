# Blundr Apple-Sleek UI Migration Governance

This directory governs the presentation-only Apple-sleek UI transformation.

## Source authority

- Release baseline: `release/blundr-staging-3.99`
- Frozen pre-UI SHA: `cf8bafd0be884c51a880504d4b82818c446a2fe6`
- Checkpoint branch: `checkpoint/pre-apple-sleek-ui-20260819`
- Checkpoint tag: `checkpoint-pre-apple-sleek-ui-20260819`
- Integration branch: `feat/apple-sleek-ui-20260819`

## Absolute rules

1. This is a presentation migration, not a product-architecture rewrite.
2. Preserve the currently reachable behavior owner for every surface.
3. Do not normalize route-gate differences, state enums, modal lifecycles, persistence contracts, APIs, IDs, or authority models.
4. Do not perform dead-code cleanup in this migration.
5. Do not regenerate or modify protected opening/runtime data.
6. `components/daily-rings/NestedDailyRings.tsx` is frozen.
7. The exact three concentric Tempo/Battery/Blundr rings remain on Home and Progress.
8. No linear bar may replace the Daily rings.
9. Only the lead/integration agent may modify `app/page.tsx`.
10. Do not rewrite `TapChessboard`.
11. Preserve the keyed Trainer remount by canonical opening ID.
12. Preserve Assisted/Plain semantics and no-answer-leak behavior.
13. Preserve restricted completion, explicit continuation, Maia fail-closed/retry behavior, and server-verified learner-checkmate Battery authority.
14. Preserve Daily first-attempt, Reveal, Retry, checkpoint, Continue, version conflict, ring refresh, and reward refresh semantics.
15. Preserve Rewards V2 ownership and explicit server state transitions. Do not add new Escape/backdrop dismissal semantics.
16. Preserve all nine Settings areas and their existing persistence/rollback behavior.
17. Preserve standalone auth and Settings-embedded auth as separate lifecycle owners.
18. Preserve all nine V11 onboarding steps and explicit Level-choice semantics.
19. Preserve existing manifest-managed assets while integrating the newly approved transparent assets later.
20. Any visual goal that requires changing product architecture is omitted or deferred.

## Subagent policy

Subagents work in isolated branches/worktrees from the current UI integration head.

Subagents:
- receive a narrow file allowlist;
- receive one page cluster;
- must not merge themselves;
- must not modify `app/page.tsx`;
- must run the UI-only diff guard;
- must report exact changed files and commit SHA.

The lead:
- owns AppShell integration;
- owns Home because of current ownership ambiguity/history;
- owns all edits to `app/page.tsx`;
- owns Trainer;
- reviews Daily/minigame diffs;
- reviews reward lifecycle;
- integrates all subagent commits;
- owns final responsive and functional QA.

## Planned waves

1. Governance baseline.
2. Shared tokens + AppShell.
3. Parallel low-risk clusters:
   - Review + Progress
   - Repertoire + Opening Detail
   - Settings + Profile
   - Auth + Onboarding + system states
4. New transparent assets and motion system.
5. Daily + minigames under lead review.
6. Home under lead ownership.
7. Trainer under lead ownership only.
8. Rewards/modals/system-state polish.
9. Full responsive/function matrix.
10. Immutable staging candidate.

## Required development widths

- 390
- 768
- 1024
- 1440

## Required final acceptance widths

- 360
- 390
- 430
- 768
- 1024
- 1280
- 1440

## Required pre-merge commands

At minimum for a local UI cluster:

```bash
npm run typecheck
npm run test:component
bash scripts/verify-ui-only-diff.sh
git diff --check
```

Run broader tests based on the touched feature surface.

The final integration candidate must run the release-appropriate regression matrix in the master plan.
