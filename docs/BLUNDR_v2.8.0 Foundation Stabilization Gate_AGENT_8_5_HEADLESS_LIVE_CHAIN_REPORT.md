# Agent 8.5 Report: Headless Live Chain Smoke Test

## Scope
Added a validation-only headless smoke test covering the full v2.8.0 chain from frame authority through safety gate fallback behavior, without UI wiring or product logic changes.

## Files Changed
- `tests/coach/liveChainSmoke.test.ts`
- `docs/BLUNDR_v2.8.0 Foundation Stabilization Gate_AGENT_8_5_HEADLESS_LIVE_CHAIN_REPORT.md`
- `.agent_runs/v2.8.0-intelligent-coach/20260603_145214/command_log.md`
- `.agent_runs/v2.8.0-intelligent-coach/20260603_145214/state.json`
- `.agent_runs/v2.8.0-intelligent-coach/20260603_145214/risk_register.md`
- `.agent_runs/v2.8.0-intelligent-coach/20260603_145214/08_5_headless_live_chain.md`
- `.agent_runs/v2.8.0-intelligent-coach/20260603_145214/phase_reports/08_5_headless_live_chain.md`

## Live Chain Cases Tested
1. Italian e4
2. Italian Nf3
3. Italian Bc4
4. Castling O-O
5. Branch complete before Continue
6. Opponent replying
7. Mismatch trap (mutated compiled target/visual target)
8. Plain leak trap (injected target leak phrase)
9. Unsupported strong claim trap

## Chain Functions Used
- `buildCurrentInstructionFrame`
- `lockInstructionTarget`
- `buildEvidenceGraph`
- `activateTeachingConcepts`
- `compileCoachFrame`
- `runCoachSafetyGate`

## SafetyGate Results
- All valid chain cases returned `allowed: true`.
- All trap cases returned `allowed: false` with blocked safe fallback behavior.

## Plain Leak Results
- Valid plain hints remained non-leaking.
- Injected plain leak phrase was blocked; safe frame text sanitized.

## Mismatch Trap Results
- Mutated target mismatch was blocked.
- Safe frame removed unsafe visuals and reveal action.

## Strong Claim Trap Results
- Injected unsupported strong claim text was blocked without engine/material evidence.

## Commands Run
- `npm run build` (sandbox failed due Turbopack process permission; escalated rerun passed)
- `node --import tsx tests/coach/liveChainSmoke.test.ts`
- `node --import tsx tests/coach/coachSafetyGate.test.ts`
- `node --import tsx tests/coach/coachCompiler.test.ts`
- `node --import tsx tests/coach/teachingConceptRegistry.test.ts`
- `node --import tsx tests/coach/dynamicConceptActivator.test.ts`
- `node --import tsx tests/coach/evidenceGraph.test.ts`
- `node --import tsx tests/coach/currentInstructionFrame.test.ts`
- `node --import tsx tests/coach/typeContracts.test.ts`
- `node --import tsx tests/coach/goldenPositions.test.ts`
- `node --import tsx tests/coach/targetInvariant.test.ts`
- `node --import tsx tests/coach/continuationFlow.test.ts`
- `node --import tsx tests/coach/plainLeak.test.ts`
- `node --import tsx tests/coach/showMoreVisualReveal.test.ts`
- `node --import tsx tests/coach/providerFailure.test.ts`
- `node --import tsx tests/coach/antiHallucination.test.ts`
- `node --import tsx tests/coach/browserContract.test.ts`
- `npm test` (missing script)
- `npm run lint` (missing script)

## Results
- Build passed.
- New headless live-chain smoke test passed.
- Required Package 8 regression/chain tests passed.

## Product Behavior Changed?
No. Test/report-only package.

## Known Remaining Risks
- This package is headless validation only; SafetyGate still needs final presentation-layer wiring.
- Legacy bypass removal remains deferred to later package scope.

## Handoff Notes for Package 9
Use this smoke test as pre-integration guard while wiring SafetyGate output into presentation/surface chain.
