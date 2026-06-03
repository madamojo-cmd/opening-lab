# Risk Register — Package 13.1

## Open Risks
- `R13.1-001` Manual QA evidence pending
  - Severity: High (gate policy)
  - Details: PASS requires verified UI behavior immediately after `9. Nbd2` and full required debug export bundle.

- `R13.1-002` Pre-existing unrelated workspace changes
  - Severity: Low
  - Details: Unrelated paths remain untouched per instruction (`next-env.d.ts`, root roadmap/prompt files, `review_exports/`).

## Closed Risks
- Restricted final guided move exhausted line downgraded to opponent_replying instead of branch_complete.
- Missing Continue from Here / Train Again action rendering after final guided user move.
- Lack of explicit critical issue when this branch-complete regression occurs.
