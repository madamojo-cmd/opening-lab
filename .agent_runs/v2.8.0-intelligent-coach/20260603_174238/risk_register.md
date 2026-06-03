# Risk Register — Package 11

## Open Risks
- Risk: Manual live QA matrix only partially executed (startup/runtime smoke completed, full action-flow matrix not fully click-tested).
  - Impact: Low/medium confidence gap on UX-level parity beyond automated checks.
  - Mitigation: Execute full matrix in Package 11.1 acceptance sweep and export debug JSON timelines.

- Risk: `next-env.d.ts` changed by build tooling in workspace.
  - Impact: None to product behavior; could create staging noise.
  - Mitigation: Exclude from explicit-path staging for Package 11 commit.
