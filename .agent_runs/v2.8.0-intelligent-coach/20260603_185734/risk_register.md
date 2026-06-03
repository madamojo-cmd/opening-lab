# Risk Register — Package 12

## Open Risks
- `R12-001` Manual acceptance evidence pending
  - Severity: High (gate policy)
  - Details: Package 12 PASS requires full interactive continuation flow validation and debug export artifacts.

- `R12-002` Unrelated workspace modifications present
  - Severity: Low
  - Details: Pre-existing unrelated changes remain untouched per instruction (`next-env.d.ts`, root roadmap/prompt, `review_exports/`).

## Closed Risks
- User-turn continuation analyzing incorrectly rendered as opponent-replying.
- Continuation no-target user-visible fallback in normal flow.
- Missing terminal restart action in v2.8 visible surface.
- Action list parity drift between rendered and surface action ids.
