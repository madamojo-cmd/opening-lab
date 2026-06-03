# Package 1 Risk Register - Authority Audit

## Scope Risks
- `app/page.tsx` remains a high-concentration orchestration file with many legacy/parallel paths; accidental bypass risk is elevated until deeper refactor packages.
- `currentInstructionFrame` occasionally returns synthetic `as any` branch/thinking objects in `app/page.tsx` before normal `buildCurrentInstructionFrame(...)` path; contract drift risk for consumers expecting strict runtime type.
- Dual data channels still exist for move truth in-page (`expectedMovesForValidation` vs `instructionTarget`) even though current rendering is mostly surface-driven.

## Legacy/Bypass Risks Found
- Direct branch transition UI card still renders from `bookComplete` block in `app/page.tsx` in parallel with surface/CoachCard architecture.
- `handleCoachAction(...)` still contains handlers for non-canonical actions (`answer`, `show_move`, `show_plan`, `analyze_idea`, `why`, `hide`, `replay`) even though policy filters visible actions.
- `handleReveal()` still exposes reveal flow from action plumbing; this is documented as internal/debug but remains live code path.
- `orchestrateTeaching(...)` + legacy cue machinery still executes in-page and contributes context/visual intermediates; surface attempts to quarantine, but bypass surface area remains.
- `TrainerPresentationFrame` type/owner unions do not fully match runtime values (e.g. `brain_skeleton`), increasing risk of hidden type drift.

## Unresolved Mapping Risks
- Legacy board primitives components (`components/board/VisualRecipeLayer.tsx`, `components/board/TeachingOverlay.tsx`) appear available but are not primary render path in `app/page.tsx`; kept as unresolved legacy exposure until package-level cleanup decides keep/remove.
- API outputs (`/api/brain`, `/api/blundr-visual-model`) can still generate teaching/visual wording that is later filtered by UI logic; guard strength is distributed rather than fully centralized.

## Net Gate
- Package 1 audit can pass with unresolved risks documented.
