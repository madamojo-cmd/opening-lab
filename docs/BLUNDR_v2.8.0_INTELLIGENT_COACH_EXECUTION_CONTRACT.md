# BLUNDR v2.8.0 Intelligent Coach Execution Contract

## Release Identity
- Release: `v2.8.0 Intelligent Coach`
- Working branch: `v2.8.0-intelligent-coach-live`
- Future RC tag target: `v2.8.0-intelligent-coach-rc1`

## Package 0 Boundaries
- Protective baseline package only.
- No product behavior changes.
- No implementation of coach logic.
- No dependency changes.
- No deployment or tags.

## Allowed Change Surfaces in Package 0
- `docs/`
- `.agent_runs/`

## Non-Negotiable Teaching Authority Rules
1. `CurrentInstructionFrame.target` is the only visible teaching authority.
2. No UI component may invent or reveal unauthorized teaching targets.
3. Visible teaching output flow must remain:
   `CurrentInstructionFrame -> EvidenceGraph -> DynamicConceptActivator -> BlundrCoachCompiler -> CoachSafetyGate -> buildVisibleTeachingSurface -> UI`.
4. Plain View cannot leak exact answer details before Show More.
5. After Show More, Plain View must match Assisted text and board visual recipe for the same locked target.
6. Stockfish is evidence only; never target owner.
7. Maia is continuation context only; never target owner.
8. Opening knowledge is contextual evidence only.
9. Provider failure cannot crash the app.
10. No false testing.
11. Browser QA required before release.

## Package 0 Deliverables
- Baseline freeze report.
- Agent run artifacts under `.agent_runs/v2.8.0-intelligent-coach/<timestamp>/`.
- Command log, risk register, state tracking, and baseline phase report.
