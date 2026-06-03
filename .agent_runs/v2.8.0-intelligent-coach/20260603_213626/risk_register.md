# Risk Register — Package 14B

- Risk: Runtime not verified with actual `lc0` + Maia weights in this environment.
- Impact: Cannot claim full PASS.
- Mitigation: setup docs/scripts provided; run `npm run maia:setup`, configure env, run `npm run maia:check`, then manual QA C-F.
- Status: Open.

- Risk: Full manual browser QA matrix not completed for runtime-enabled scenarios.
- Impact: Runtime behavior remains unconfirmed in real interaction flow.
- Mitigation: Execute documented manual matrix and debug export checklist.
- Status: Open.

- Risk: Dockerfile is best-effort due platform-specific lc0 packaging.
- Impact: container deployment may require environment-specific adaptation.
- Mitigation: use documented mount/install path and verify with maia:check in container.
- Status: Open.
