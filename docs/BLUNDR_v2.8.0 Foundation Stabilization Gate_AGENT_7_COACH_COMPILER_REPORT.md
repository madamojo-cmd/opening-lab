# Agent 7 Report: BlundrCoachCompiler MVP

## Scope
Implemented a deterministic compiler pipeline that converts `CurrentInstructionFrame` + `EvidenceGraph` + activated concepts into `CompiledCoachFrame` without UI wiring and without changing target authority.

## Package 6 Concept Activator Consumed
- `activateTeachingConcepts(...)` output is consumed directly as compiler input.
- Compiler uses activated and suppressed concept IDs only as evidence-guided inputs.

## Files Inspected
- Agent 1/2/3/4/5/6 reports
- `.agent_runs/v2.8.0-intelligent-coach/20260603_135016/state.json`
- `.agent_runs/v2.8.0-intelligent-coach/20260603_135016/risk_register.md`
- existing `lib/blundr/coachCompiler/types.ts`
- `lib/blundr/runtime/currentInstructionFrame.ts`
- `lib/blundr/brain/buildEvidenceGraph.ts`
- `lib/blundr/concepts/*`
- `tests/coach/*`

## Files Changed
- `lib/blundr/coachCompiler/types.ts`
- `lib/blundr/coachCompiler/compileCoachFrame.ts`
- `lib/blundr/coachCompiler/templateRenderer.ts`
- `lib/blundr/coachCompiler/slotBuilder.ts`
- `lib/blundr/coachCompiler/copyPolicy.ts`
- `lib/blundr/coachCompiler/visualIntentBuilder.ts`
- `lib/blundr/coachCompiler/revealActionBuilder.ts`
- `lib/blundr/coachCompiler/compilerDebug.ts`
- `lib/blundr/coachCompiler/index.ts`
- `tests/coach/coachCompiler.test.ts`
- `tests/coach/plainLeak.test.ts`
- `tests/coach/showMoreVisualReveal.test.ts`
- `tests/coach/targetInvariant.test.ts`
- `tests/coach/antiHallucination.test.ts`
- `tests/coach/typeContracts.test.ts`

## New Files Created
- `lib/blundr/coachCompiler/compileCoachFrame.ts`
- `lib/blundr/coachCompiler/templateRenderer.ts`
- `lib/blundr/coachCompiler/slotBuilder.ts`
- `lib/blundr/coachCompiler/copyPolicy.ts`
- `lib/blundr/coachCompiler/visualIntentBuilder.ts`
- `lib/blundr/coachCompiler/revealActionBuilder.ts`
- `lib/blundr/coachCompiler/compilerDebug.ts`
- `lib/blundr/coachCompiler/index.ts`
- `tests/coach/coachCompiler.test.ts`

## Compiler Flow Implemented
1. Read frame
2. Read graph
3. Read activated concepts
4. Build template slots (`frame.target` authority)
5. Build plain block (leak-safe generic)
6. Build assisted block (target-aware)
7. Build showMore block (same target as assisted)
8. Build visual intents (target-locked)
9. Build reveal action (target-locked or continuation-safe)
10. Run precheck mismatch guards
11. Return `CompiledCoachFrame`

## Plain Leak Controls
- Plain template rendering strips SAN/UCI/from/to/piece tokens.
- Plain block text is generic and non-answer-revealing.
- New tests enforce no `Bc4`, `f1c4`, `f1`, `c4`, `bishop` leak in plain for Italian Bc4 case.

## Target Alignment Controls
- Slots are sourced from `CurrentInstructionFrame.target` only.
- Compiler does not switch target when graph target differs.
- Precheck adds critical issue on frame/graph mismatch.
- Assisted/showMore/reveal/visual alignment tested.

## Visual Intent Controls
- Visual intents generated only for target frames.
- All target-specific visual intents use `frame.target.uci`.
- `pressure_arrow` requires pressure evidence.
- `king_safety_aura` requires castling/king-safety evidence.
- Display modes are `assisted` + `show_more` only.

## Reveal Action Controls
- target frame -> `reveal_target`
- `branch_complete` + continuation eligibility -> `continue_from_here`
- opponent/terminal/blocked/null-target non-branch -> `none`
- reveal target always from frame target.

## Tests Added or Updated
- Added: `tests/coach/coachCompiler.test.ts`
- Updated:
  - `tests/coach/plainLeak.test.ts`
  - `tests/coach/showMoreVisualReveal.test.ts`
  - `tests/coach/targetInvariant.test.ts`
  - `tests/coach/antiHallucination.test.ts`
  - `tests/coach/typeContracts.test.ts`

## Commands Run
- Step A inspection commands
- `npm run build` (sandbox failure due Turbopack process permission; escalated rerun passed)
- Required test sequence from Package 7 prompt (`node --import tsx ...`)
- `npm test` and `npm run lint` (scripts missing)

## Results
- Build: pass
- Required tests: pass
- Existing Package 2–6 tests in required list remained passing

## Product Behavior Changed?
No intentional UI behavior changes. No edits to `app/page.tsx` or `components/`.

## Known Remaining Risks
- Copy policy strong-term gating is deterministic and conservative but still pre-safety-gate; Package 8 should enforce final policy centrally.
- Compiler precheck warnings are local to compiled frame and not yet integrated into runtime safety gate.
- Visual intents are abstract intents and not yet mapped to final `VisibleTeachingSurface`/`VisualRecipe` pipeline.

## Handoff Notes for Package 8
- Implement `CoachSafetyGate` using compiler output + precheck to enforce final visible safety.
- Preserve strict target authority and plain leak protections.
- Keep reveal/visual target alignment checks as hard failures in safety gate.
