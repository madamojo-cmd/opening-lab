# 14B.3 Continuation State Machine

## Summary
Implemented a deterministic runtime state derivation layer and wired it into frame/opponent scheduling decisions.

## Key outcomes
- Restricted opponent-turn now deterministically routes to opponent-replying unless selected-line exhaustion forces branch-complete.
- Continuation entry no longer assumes user-to-move.
- Continuation no-target generic stable status is replaced by analyzing/safe-blocked state handling.
- Maia selected-move legality is tracked at selection time.
- Stale pending-opponent requests are cleared on stale-commit paths.
