# Risk Register — Package 14B.4

## Open Risks

1. `manual_browser_gate_pending` (high)
- Description: Final PASS requires real browser manual QA (`/?debug=1` load + long continuation sequence).
- Mitigation: User runs required checklist in local browser and confirms no crash / no generic status stabilization.

2. `sandbox_build_variability` (medium)
- Description: `next build` can fail in restricted sandbox due process spawn/bind limitations.
- Mitigation: Use escalated build command for release verification in this environment.

3. `preexisting_workspace_delta` (medium)
- Description: Significant pre-existing unrelated file deltas remain in workspace.
- Mitigation: Use explicit path staging for Package 14B.4-only files before any commit.
