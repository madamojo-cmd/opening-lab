# BLUNDR v2.8.0 Agentic Runbook

## Execution Model
Sequential supervised package flow with hard gates and recorded artifacts per package.

## Package 0 Objective
Establish baseline, working branch, and auditable artifacts without touching product code.

## Package 0 Required Artifacts
- `.agent_runs/v2.8.0-intelligent-coach/<timestamp>/state.json`
- `.agent_runs/v2.8.0-intelligent-coach/<timestamp>/command_log.md`
- `.agent_runs/v2.8.0-intelligent-coach/<timestamp>/risk_register.md`
- `.agent_runs/v2.8.0-intelligent-coach/<timestamp>/00_baseline.md`
- `.agent_runs/v2.8.0-intelligent-coach/<timestamp>/phase_reports/00_baseline.md`
- `docs/BLUNDR_v2.8.0_BASELINE_FREEZE_REPORT.md`

## Package 0 Gate Decision Options
- `PASS`
- `PASS_WITH_BASELINE_RISKS`
- `BLOCKED`

## Transition Rule
Proceed to Package 1 only after Package 0 artifacts are complete and product code change flag remains false.
