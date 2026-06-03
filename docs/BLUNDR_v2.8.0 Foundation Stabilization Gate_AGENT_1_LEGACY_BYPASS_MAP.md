# BLUNDR v2.8.0 Foundation Stabilization Gate - Agent 1 Legacy Bypass Map

## Objective
Map every known path where visible teaching output could bypass strict `CurrentInstructionFrame.target` authority.

## Bypass Map
| ID | Path | Type | Current State | Risk |
|---|---|---|---|---|
| LB-01 | `app/page.tsx` direct `orchestrateTeaching(...)` + derived cue/visual context | legacy teaching orchestration | active | high |
| LB-02 | `bookComplete` standalone "Line complete" card in `app/page.tsx` | parallel action surface | active | medium |
| LB-03 | `handleCoachAction(...)` handlers for legacy actions (`answer`, `show_move`, `show_plan`, `analyze_idea`, `why`, `hide`, `replay`) | action-policy bypass surface | active code path | high |
| LB-04 | `handleReveal()` reveal flow | reveal target path outside strict surface action list | active | medium |
| LB-05 | `buildVisibleTeachingSurface(...legacyCoachDecision...)` | compatibility bypass inlet | conditional | medium |
| LB-06 | legacy training/answer cards in `app/page.tsx` behind `false && ...` | dormant direct render path | disabled but present | low-medium |
| LB-07 | API-generated teaching/visual text (`/api/brain`, `/api/blundr-visual-model`) | upstream content bypass pressure | active | medium |
| LB-08 | type-contract drift (`TrainerPresentationFrame` owner unions vs runtime values) | compile-time safety gap | active | medium |

## Mandatory Future Convergence
1. Collapse all visible teaching actions into `visibleActionPolicy` + `buildVisibleTeachingSurface`.
2. Remove standalone branch transition card rendering outside surface/CoachCard.
3. Retire dormant legacy UI blocks after validation package.
4. Narrow `handleCoachAction` and reveal plumbing to canonical action set.
5. Resolve type drift in presentation/surface contracts before deep feature work.
