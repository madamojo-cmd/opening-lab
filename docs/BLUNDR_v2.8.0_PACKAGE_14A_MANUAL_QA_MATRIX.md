# BLUNDR v2.8.0 Package 14A Manual QA Matrix

Status: Pending full browser execution.

## Scenario 1: Restricted opening unaffected
- Steps: start fresh, play `1. e4`.
- Expected:
  - Continue from Here does not appear.
  - Maia does not run.
  - Opponent reply proceeds.

## Scenario 2: Final guided line
- Steps: play full Italian line to final `Nbd2`.
- Expected:
  - Continue from Here + Restart/Train Again appear only at true line end.
  - Maia does not run before Continue click.

## Scenario 3: Continue from Here
- Steps: click Continue from Here after line complete.
- Expected:
  - Continuation starts only after click.
  - Stockfish validation still owns user continuation target.
  - Maia does not select user target.

## Scenario 4: User continuation move
- Steps: play one continuation move.
- Expected:
  - MultiPV 32 rating badge behavior unchanged.
  - No visible Ungraded in normal UI.
  - Maia may run only on opponent turn.

## Scenario 5: Maia unavailable
- Setup: runtime disabled/unavailable.
- Expected:
  - Fallback opponent reply used.
  - No user-facing error.
  - Debug warning allowed.

## Scenario 6: Stale request
- Steps: trigger continuation request, then restart/change board quickly.
- Expected:
  - stale result ignored.
  - no stale move applied.

## Debug Export Checklist
- Export full debug session JSON.
- Export Maia timeline JSON.
- Confirm no critical issues related to target/surface/rating/branch-complete mutation.
