# Risk Register — Package 11.1D

## Open Risks
- `R11.1D-001` Manual strict acceptance pending
  - Severity: High (gate policy)
  - Description: Automated contract/tests passed, but strict package rule requires interactive in-browser line-completion confirmation.
  - Mitigation: Execute manual scenario and capture required debug/action evidence.

- `R11.1D-002` Historical dev log warning entries
  - Severity: Medium
  - Description: Existing dev log includes prior `useEffect` dependency-size warning lines; not observed as blocking build/tests in this run.
  - Mitigation: Separate targeted audit/fix if warning reproduces on clean browser session.

## Closed Risks
- Opponent pending request overriding true exhausted-line branch-complete surface.
  - Closed by: branch-complete contract + latch + pending cancellation + test coverage.
