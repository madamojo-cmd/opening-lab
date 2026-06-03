# Risk Register — Package 13.3

## Open Risks
- `R13.3-001` Manual QA acceptance pending
  - Severity: High
  - Details: PASS requires explicit manual confirmation that `e4` does not render branch_complete and final `Nbd2` does.

- `R13.3-002` MultiPV 32 behavior pending manual confirmation
  - Severity: Medium
  - Details: Automated tests pass; interactive run still needed to confirm live continuation rating UX path.

## Closed Risks
- Premature branch_complete after early restricted user move (`e4`).
- Overbroad branch-complete inference from opponent-turn exact-node states.
- Missing debug backstop for premature branch_complete rendering.
