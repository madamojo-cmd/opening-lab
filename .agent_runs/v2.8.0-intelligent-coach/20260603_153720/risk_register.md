# Risk Register — Package 10.5B

## Open Risks

1. Timeline/UI parity risk
- Area: `app/page.tsx` coach timeline logger
- Risk: timeline entry title/body is still computed from presentation/legacy decision path, not the exact rendered CoachCard surface decision.
- Impact: debug timeline may diverge from visible CoachCard in some transitions.
- Mitigation: follow-up in next patch to source timeline visible fields from rendered surface decision object.

2. Manual browser QA not executed
- Area: live runtime verification
- Risk: automated tests pass but specific live sequences (e4/Nf3/Bc4/Bxc4/Be3, plain show-more, terminal/checkmate) were not manually replayed in-browser in this environment.
- Impact: residual confidence gap for runtime wiring.
- Mitigation: run requested manual QA checklist before merge.
