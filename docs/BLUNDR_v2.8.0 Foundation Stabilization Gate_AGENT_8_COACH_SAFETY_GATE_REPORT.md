# Agent 8 Report: CoachSafetyGate + Invariant Enforcement

## Scope
Implemented deterministic safety validation and fallback enforcement over compiled coach output. The gate validates target authority, plain leak constraints, strong claims, null-target behavior, and provider authority boundaries.

## Package 7 Compiler Consumed
- Consumed `CompiledCoachFrame` output from `compileCoachFrame(...)`.
- Reused compiler precheck metadata as additive context; SafetyGate performs independent deterministic validation.

## Files Inspected
- Agent 1–7 reports
- latest Package 7 state/risk artifacts
- `lib/blundr/safety/types.ts`
- `lib/blundr/coachCompiler/*`
- `lib/blundr/runtime/currentInstructionFrame.ts`
- `lib/blundr/brain/buildEvidenceGraph.ts`
- `tests/coach/*` safety/compiler related tests

## Files Changed
- `lib/blundr/safety/types.ts`
- `lib/blundr/safety/coachSafetyGate.ts`
- `lib/blundr/safety/targetInvariantPolicy.ts`
- `lib/blundr/safety/plainLeakPolicy.ts`
- `lib/blundr/safety/strongClaimPolicy.ts`
- `lib/blundr/safety/nullTargetPolicy.ts`
- `lib/blundr/safety/providerAuthorityPolicy.ts`
- `lib/blundr/safety/safeFallbackFrame.ts`
- `lib/blundr/safety/index.ts`
- `tests/coach/coachSafetyGate.test.ts`
- `tests/coach/targetInvariant.test.ts`
- `tests/coach/plainLeak.test.ts`
- `tests/coach/showMoreVisualReveal.test.ts`
- `tests/coach/antiHallucination.test.ts`
- `tests/coach/coachCompiler.test.ts`
- `tests/coach/providerFailure.test.ts`
- `tests/coach/browserContract.test.ts`

## New Files Created
- `lib/blundr/safety/coachSafetyGate.ts`
- `lib/blundr/safety/targetInvariantPolicy.ts`
- `lib/blundr/safety/plainLeakPolicy.ts`
- `lib/blundr/safety/strongClaimPolicy.ts`
- `lib/blundr/safety/nullTargetPolicy.ts`
- `lib/blundr/safety/providerAuthorityPolicy.ts`
- `lib/blundr/safety/safeFallbackFrame.ts`
- `lib/blundr/safety/index.ts`
- `tests/coach/coachSafetyGate.test.ts`

## Safety Policies Implemented
- `validateTargetInvariants(...)`
- `detectPlainLeaks(...)` + `textContainsTargetLeak(...)`
- `validateStrongClaims(...)`
- `validateNullTargetFrame(...)`
- `validateProviderAuthority(...)`
- `buildSafeFallbackCompiledFrame(...)`
- `runCoachSafetyGate(...)`

## Critical Invariants Enforced
- Frame target is canonical authority for graph/compiled/visual/reveal alignment.
- Compiled from/to/pieceType must match locked frame target.
- Graph target mismatches and compiled target mismatches are critical.
- Reveal mismatch and visual mismatch are critical.
- Null-target frames cannot include target metadata, reveal_target action, or move visuals.

## Plain Leak Controls
- Safety policy detects SAN/UCI/from/to/piece leakage in plain text.
- Phrase-level leak detection includes direct imperative target patterns.
- Plain leak violations are critical and trigger fallback frame behavior.

## Strong Claim Controls
- Strong term scanner across plain/assisted/showMore.
- Engine-dependent claims (`best`, `engine-approved`, `Stockfish says`, etc.) require provider evidence.
- `mate/checkmate` requires checkmate proof.
- `wins/winning/wins material` requires verified material-gain evidence.
- Unsupported strong claims produce critical issues.

## Null-Target Controls
- Opponent/branch/terminal/blocked frames are validated for no move-target coaching surface.
- branch_complete continuation action allowed only when frame metadata supports it.

## Provider Authority Controls
- Provider-origin claims cannot override frame target authority.
- Provider target implication mismatches produce critical authority violations.

## Safe Fallback Behavior
- On blocked output, gate returns deterministic fallback compiled frame.
- Fallback removes unsafe target details and clears visuals under critical conditions.
- Reveal action downgrades to `none` when safety invariants fail.
- Original compiled object remains unchanged.

## Tests Added or Updated
- Added: `tests/coach/coachSafetyGate.test.ts`
- Updated:
  - `tests/coach/targetInvariant.test.ts`
  - `tests/coach/plainLeak.test.ts`
  - `tests/coach/showMoreVisualReveal.test.ts`
  - `tests/coach/antiHallucination.test.ts`
  - `tests/coach/coachCompiler.test.ts`
  - `tests/coach/providerFailure.test.ts`
  - `tests/coach/browserContract.test.ts`

## Commands Run
- Step A inspection command set
- `npm run build` (sandbox Turbopack permission failure; escalated rerun passed)
- required Package 8 test list via `node --import tsx ...`
- `npm test` and `npm run lint` (scripts missing)

## Results
- Build: pass
- Required tests: pass
- Safety gate test suite: pass
- Previous Package 2–7 tests in required run list: pass

## Product Behavior Changed?
No UI wiring changes were made. No edits to `app/page.tsx` or `components/`.

## Known Remaining Risks
- SafetyGate currently acts on compiled output and is not yet wired into final presentation chain.
- Legacy bypass paths from Package 1 remain unresolved by design.
- Provider evidence semantics remain deterministic placeholders until richer provider integration packages.

## Handoff Notes for Package 9
- Integrate SafetyGate output into presentation/surface layer as the sole gate before user-visible rendering.
- Preserve fallback behavior and ensure blocked frames cannot leak target details through downstream layers.
- Continue converging legacy bypass paths to canonical chain only.
