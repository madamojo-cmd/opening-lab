# BLUNDR v2.8.0 Foundation Stabilization Gate - Agent 1 Authority Audit Report

## Package
- Package 1: Authority Audit and Legacy Bypass Map
- Mode: Audit-only (no product code changes)
- Branch: `v2.8.0-intelligent-coach-live`
- Commit: `88f47e1685b0f80dc5cb1b07041f7c7b021afeda`

## Prerequisite Check
Confirmed Package 0 artifacts exist:
- `docs/BLUNDR_v2.8.0_BASELINE_FREEZE_REPORT.md`
- `.agent_runs/v2.8.0-intelligent-coach/20260603_125720/command_log.md`
- `.agent_runs/v2.8.0-intelligent-coach/20260603_125720/state.json`
- `.agent_runs/v2.8.0-intelligent-coach/20260603_125720/risk_register.md`

## Surface Authority Table
| Surface | Current Producer | Current Consumer | Should Remain? | Replacement |
|---|---|---|---|---|
| coach title | `buildVisibleTeachingSurface` fed by `computeTrainerPresentationFrame` / `instructionTarget` fallback (`app/page.tsx`, `lib/blundr/presentation/buildVisibleTeachingSurface.ts`) | `CoachCard` (`components/coach/CoachCard.tsx`) | Yes, with stricter chain | `CurrentInstructionFrame -> EvidenceGraph -> DynamicConceptActivator -> BlundrCoachCompiler -> CoachSafetyGate -> buildVisibleTeachingSurface` |
| coach body | Same as above, plus plain pre-showMore hint ladder path | `CoachCard` | Yes, with stricter chain | Same as above |
| hint | `buildHintLadder` inside `buildVisibleTeachingSurface` | `CoachCard` decision.hint | Yes | Route through compiler+safety then surface hint contract |
| Show More text | `visibleTeachingSurface.showMore.content` from presentation/surface | `CoachCard`/action handler (`show_more`) | Yes | Keep only surface-owned Show More payload |
| Reveal Move | `handleReveal()` uses `instructionTarget` and `phaseActionGate` (`app/page.tsx`) | local action handling + `runBrain("reveal")` | No as primary teaching path | Convert to strict surface action policy + locked target reveal contract |
| Continue from Here | branch transition surface + direct `bookComplete` card in `app/page.tsx` | CoachCard actions and standalone buttons | Partially | Keep only one surface-owned branch transition action path |
| level selector | `RATING_PRESETS` buttons (`app/page.tsx`) | local state (`ratingFilter`) influences analysis/provider context | Yes (non-teaching control) | keep as control-only, never teaching target authority |
| visual arrow | `presentationFrame.visual` then `visibleTeachingSurface.visual`, fallback to instruction target | board line renderer in `TapChessboard` | Yes | enforce single visual owner = surface |
| source square highlight | `squareStyles` from board logic/instructionTarget/visual contexts | `TapChessboard` square rendering | Yes, with constraints | derive only from surface-approved visual payload |
| destination square highlight | same as source highlight | `TapChessboard` | Yes, with constraints | same as above |
| pressure line | legacy/visual model/recipe line candidates (`legacyVisualLines`, visual model) | board lines | No for teaching frames | remove legacy pressure path from teaching frames |
| attack/defense/plan toggles | active board view state in `app/page.tsx` | board visualization | Yes (debug/aux visual mode) | never allowed to set teaching target |
| Plain View UI | surface plain pre-showMore suppression and hint ladder | `CoachCard` + board rendering decisions | Yes | keep surface as hard gate, no alternate reveal paths |
| Assisted View UI | surface + presentation visual path | `CoachCard` + board rendering | Yes | keep surface as single owner |
| terminal surface | `endingInfo`/`GameEndCard` and branch/continuation terminal paths | terminal card + coach/status text | Yes | keep explicit non-teaching terminal owner |
| debug panel | `collectTrainerDebugSnapshot` / `BlundrDiagnosticsPanel` | debug UI | Yes (debug-only) | keep read-only observer, no teaching control |

## Target / Calculator Inventory
1. Canonical target builder: `buildCurrentInstructionFrame(...)` in `lib/blundr/runtime/currentInstructionFrame.ts`.
2. Guided target feed: `resolveExpectedMoveForFrame(...)` in `lib/blundr/openings/expectedMoveResolver.ts`.
3. Continuation candidate feed: `selectContinuedPlayMove(...)` in `lib/blundr/continuedPlay/continuedPlayMovePolicy.ts`.
4. In-page synthetic frame fallbacks (`branch_transition`, `thinking`) appear before canonical builder in `app/page.tsx`.

## Reveal / Visual / Continuation Calculators
1. Reveal target calculator: `handleReveal()` uses `instructionTarget?.uci` (`app/page.tsx`).
2. Visual target calculators:
- `computeTrainerPresentationFrame(...).visual`
- `buildVisibleTeachingSurface(...).visual`
- in-page board post-filtering to forced primary line by `instructionTarget`.
3. Continuation candidate calculators:
- `continuationPolicyCandidate` memo in `app/page.tsx`
- `buildContinuationCandidateVisual(...)` in `lib/blundr/visual/continuationCandidateVisual.ts`

## Legacy Bypass Findings
1. `orchestrateTeaching(...)` still runs in `app/page.tsx` and feeds legacy context/recipe paths.
2. Direct branch card (`bookComplete` block) still renders outside canonical surface action ownership.
3. `handleCoachAction(...)` still supports non-canonical legacy actions (`answer`, `show_move`, `show_plan`, `analyze_idea`, `why`, `hide`, `replay`) even though visible policy restricts UI buttons.
4. `legacyCoachDecision` input remains available in `buildVisibleTeachingSurface(...)` for non-active frames.
5. Legacy training/answer cards are hard-disabled via `false && ...`, but code remains present and therefore is a latent bypass surface.

## Stale / Drift Risks
1. `expectedMovesForValidation` remains an in-page parallel move channel; target truth and validation channel are not fully collapsed.
2. `TrainerPresentationFrame` declared owner union and runtime owner values are not perfectly aligned (`brain_skeleton` usage in runtime builder).
3. API producers (`/api/brain`, `/api/blundr-visual-model`) can emit copy/visual cues that rely on downstream suppression instead of single upstream authority.

## Acceptance Mapping
1. Legacy direct-rendered surfaces: identified.
2. Target calculators: identified.
3. Reveal target calculators: identified.
4. Visual target calculators: identified.
5. Continuation candidate calculators: identified.
6. Old buttons to remove/quarantine: identified.
7. Stale `expectedMovesForValidation` consumption risk: identified.
8. Coach-copy paths not strictly tied to `CurrentInstructionFrame` (legacy/parallel): identified.

## Gate Result
- `PASS_WITH_UNRESOLVED_RISKS`
- No product-code edits were performed.
