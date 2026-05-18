# v2.7.35 Patch Notes

## Teaching Intelligence Orchestrator
Blundr now runs a full teaching-intelligence pipeline instead of binary cue gating:
- TeachingEvidence collection
- multi-story candidate generation
- story scoring and ranking
- trust classification
- permission derivation
- visual overlay routing
- learning metadata capture

## Major Improvements
- Added story candidate ranking with explicit rejection reasons and score breakdowns.
- Added context-safe Assisted View that stays useful when answer visuals are blocked.
- Added richer position intelligence for tactical and strategic themes.
- Added book-support evaluation as an evidence source.
- Added strong-alternative handling with respectful, evidence-based framing.
- Fixed loose-piece teaching logic:
  - `attack_loose_piece` for non-capturing pressure
  - `win_loose_piece` only for immediate capture/material-win cases
- Added advanced visual routing with reveal levels, emphasis, suppression reasons, and visual budget control.
- Expanded local learning metadata with story, trust tier, permission, and visual decisions.

## Preserved
- Move Quality Gate remains intact.
- No automatic `/api/brain` calls on position updates, wrong moves, or normal training.
- Manual Reveal behavior remains available.
- Plain View remains strict no-hint mode.

## Not Included
- Maia integration
- Bot refactor
- Automatic GPT coaching loop
