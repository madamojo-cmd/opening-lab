# Package 0 Baseline Report

## Branch before
- `checkpoint/v2.7.42-continuation-stabilization`

## Branch after
- `v2.8.0-intelligent-coach-live`

## Base SHA
- `88f47e1685b0f80dc5cb1b07041f7c7b021afeda`

## Current SHA
- `88f47e1685b0f80dc5cb1b07041f7c7b021afeda`

## Working tree status before
```txt
?? BLUNDR_v2.8.0_INTELLIGENT_COACH_LIVE_VERSION_ROADMAP.md
?? BLUNDR_v2.8.0_PACKAGE_0_CODEX_PROMPT.md
```

## Working tree status after
```txt
?? .agent_runs/
?? BLUNDR_v2.8.0_INTELLIGENT_COACH_LIVE_VERSION_ROADMAP.md
?? BLUNDR_v2.8.0_PACKAGE_0_CODEX_PROMPT.md
?? docs/BLUNDR_v2.8.0_AGENTIC_RUNBOOK.md
?? docs/BLUNDR_v2.8.0_BASELINE_FREEZE_REPORT.md
?? docs/BLUNDR_v2.8.0_GROUND_TRUTH_TESTING_MATRIX.md
?? docs/BLUNDR_v2.8.0_INTELLIGENT_COACH_EXECUTION_CONTRACT.md
?? docs/BLUNDR_v2.8.0_INTELLIGENT_COACH_LIVE_VERSION_ROADMAP.md
?? docs/BLUNDR_v2.8.0_PROVIDER_FAILURE_POLICY.md
```

## Package scripts discovered
- `build`
- `copy-stockfish`
- `dev`
- `postinstall`
- `start`
- `test:coach-quality`
- `test:multi-move-qa`
- `test:trainer-debug`

## Commands run
- `npm run build` -> pass
- `npm run test:trainer-debug` -> pass
- `npm run test:coach-quality` -> pass
- `npm run test:multi-move-qa` -> pass
- `npm test` -> did not exist
- `npm run lint` -> did not exist

## Build result
- PASS

## Test result
- PASS for available custom test scripts
- `npm test` unavailable (no `test` script)

## Lint result
- NOT AVAILABLE (`lint` script missing)

## Custom script results
- `test:trainer-debug`: PASS
- `test:coach-quality`: PASS
- `test:multi-move-qa`: PASS

## Known failures
- None in executed commands.

## Known dirty files
- `.agent_runs/**` (Package 0 artifacts)
- `docs/**` (Package 0 baseline docs)

## Known untracked files
- `BLUNDR_v2.8.0_INTELLIGENT_COACH_LIVE_VERSION_ROADMAP.md` (uploaded source)
- `BLUNDR_v2.8.0_PACKAGE_0_CODEX_PROMPT.md` (uploaded source)

## Whether product code changed
- `false`

## Risk notes
- See `risk_register.md`.

## Gate verdict
- `PASS_WITH_BASELINE_RISKS`
