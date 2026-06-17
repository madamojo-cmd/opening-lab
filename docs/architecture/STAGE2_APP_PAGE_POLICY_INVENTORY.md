# Stage 2 App Page Policy Inventory

## Scope

- Inventory-only pass for `app/page.tsx`.
- No behavior changes.
- No new product features.
- No content generation changes.
- No move-authority changes.

## Branch And Starting Point

- Branch: `work/stage2-approved-content-activation-phase5`
- Starting commit: `767fd89` (`Audit Stage 2 opening availability readiness`)

## Inventory Summary

`app/page.tsx` still contains meaningful policy, but the strongest authorities are already externalized into helpers. The remaining page-level work is mostly composition, event wiring, and a few stateful gates that should stay local for now.

## Policy Areas

| Area | Classification | Notes |
|---|---|---|
| CurrentInstructionFrame / target selection | `already_resolved_elsewhere` | Final target authority is produced by `buildCurrentInstructionFrame`, `resolveExpectedMoveForFrame`, and the trainer frame resolution helpers. The page still consumes the result and threads it into render/debug state. |
| restricted vs continuation mode | `should_remain_in_page_for_now` | This is still driven by page state, user interaction, and React lifecycle. It is tightly coupled to the screen flow. |
| branch complete | `should_move_to_resolution` | The contract helper exists and should remain the authority for completion eligibility, while the page keeps only the wiring and latch state. |
| Continue From Here | `should_remain_in_page_for_now` | This is a direct user action / React event flow and should stay local while the surrounding contract is preserved. |
| continuation candidate selection | `should_move_to_resolution` | Candidate validation and effective selection already have dedicated helpers and should be the authority path. |
| opponent reply / provider request | `should_move_to_provider_policy` | Provider choice, request timing, and fallback behavior belong in provider policy helpers, not inline page policy. |
| promotion picker and promotion suffix | `should_move_to_resolution` | Promotion authority is already helper-driven; page should only collect the final selected/accepted values. |
| move submission / accepted target | `should_remain_in_page_for_now` | The user interaction handler must stay in the page, but acceptance/authority values should be sourced from helpers. |
| CoachCard selection | `should_move_to_resolution` | Final rendered coach-card authority is already split through `TrainerFrameResolution`, rendered copy authority, and stage2 coaching resolution. |
| approved-content enrichment | `should_move_to_stage2_coaching` | Exact-match packet resolution and enrichment belong in the Stage 2 coaching layer, not page-local policy. |
| fallback CoachCard | `already_resolved_elsewhere` | Fallback behavior is owned by the coach brain / copy authority helpers; the page should just render the selected result. |
| visual arrows / highlights | `should_move_to_visual_resolution` | Visual selection and normalization should come from visual-resolution helpers, with the page only applying the chosen result. |
| Plain View hint / Show More gating | `should_remain_in_page_for_now` | This is a UI interaction gate that depends on live session state and should remain page-local for now. |
| opening availability / visibility | `should_move_to_opening_availability` | Runtime catalog status, public readiness, and selector visibility are better represented by the opening-availability layer. |
| provider warnings | `should_move_to_provider_policy` | Provider warnings and live-Lichess/no-Lichess truth should come from provider/opening/runtime policy helpers. |
| feature trace construction | `should_move_to_resolution` | Feature trace is a final-frame debug artifact and should be shaped from resolution outputs rather than recomputed ad hoc in the page. |
| trainer debug snapshot / Copy Everything | `should_move_to_resolution` | Snapshot shaping should consume already-resolved frame data and stay consistent with `TrainerFrameResolution`. |
| terminal / checkmate / draw frames | `already_resolved_elsewhere` | Terminal-state detection is driven by game state and existing runtime helpers; page should render the resolved terminal frame. |
| error / loading / empty states | `page_state_only` | These are presentation states that depend on React/session flow and should remain local. |
| diagnostics panel fields | `render_only` | Diagnostics should render the snapshot and resolution truth, not create policy. |

## What Is Already In Good Shape

- `TrainerFrameResolution` exists and already carries final frame truth.
- Stage 2 coaching exact-match resolution already exists.
- Opening availability already has a dedicated runtime/product-readiness model.
- Feature trace and debug snapshot shaping already live outside the main UI tree.
- The page is no longer the sole source of truth for target authority.

## What Still Feels Page-Dense

- Continuation entry and gating state.
- User action handling for move submission, promotion, and Continue From Here.
- Final composition of coach, visual, and debug outputs.
- A few remaining debug-facing fields that could be shaped more cleanly by helper functions.

## Recommended Next Move

- Extract the remaining pure shaping helpers around coach/debug/visual composition into named helper modules.
- Keep user-action and React lifecycle code in `app/page.tsx` for now.
- Re-run the no-bypass and parity tests after each extraction so target authority stays locked.

