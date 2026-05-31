# TrainerPresentationFrame Ownership Table (Blockers 1–3 Pass)
**Date**: 2026-05-31  
**Purpose**: Exact before/after status for every listed surface. Single source of truth for closure proof.

## Surface Ownership Matrix

| Surface | Pre-Blockers-1-3 (Legacy Dominant) | Post-Blockers-1-3 (This Pass) | Owner (Post) | Proof Location | Notes / Gaps |
|---------|------------------------------------|-------------------------------|--------------|----------------|--------------|
| Coach card title | rawCoachDecision / liveCoachState / displayedCoachDecision | presentationFrame.coach.title (exclusive construction on Brain teaching frames) | trainer_presentation_frame (Brain path) | app/page.tsx:1777-1820 (bypass); trainerPresentationFrame.ts:206 | Still falls back to coachDecision in some fields inside bypass |
| Coach card body | Same legacy | presentationFrame.coach.body | trainer_presentation_frame | Same | Good for Brain frames |
| Coach plan / pedagogical focus | liveCoach opportunity + pipeline | (presentationFrame.coach as any).brainPedagogicalFocus | trainer_presentation_frame | trainerPresentationFrame.ts:208 + page bypass debug | Not yet a top-level plan field in contract |
| Visual arrows / board lines | visualRecipe + legacyLines + continuationCandidateVisual + currentView | presentationFrame.visual.lines (preferred when brain + shouldRender) | trainer_presentation_frame (brain source) | app/page.tsx:3092-3093; trainerPresentationFrame.ts:187-203 | Strong preference already present |
| Visual squares / highlights / pressure | Mixed (currentView.cues + visualModel + recipe) | presentationFrame.visual (brain source when active) + visualSquares derivation | trainer_presentation_frame | app/page.tsx:3052-3065 | Partial — legacy cues still in else branch |
| Reveal target (UCI/label) | instructionTarget directly + multiple resolvers | presentationFrame.revealTargetUci (centralized) | trainer_presentation_frame | trainerPresentationFrame.ts:217-232 | Already good |
| Hint target / text | instructionTarget + liveCoach | presentationFrame.hintTargetUci | trainer_presentation_frame | Same | Already centralized |
| Mistake diagnosis (user wrong move) | None or scattered in debug | presentationFrame.coach.mistake + top-level .mistake (when brainAnalysis.mistakeDiagnosis) | trainer_presentation_frame | trainerPresentationFrame.ts:206-226, 270; diagnose wired in analyze | New in this pass |
| Debug-visible coach info (packets) | displayedCoachDecision.debug + liveCoachState | presentationFrame + brainAnalysis (preferred in debug panels) | Mixed (debug only) | page.tsx debug sections still read displayedCoachDecision heavily | Debug surface intentionally allows legacy for parity |
| Legacy training/answer cards | Direct `!displayedCoachDecision?.shouldShowCoachCard` checks | Now guarded by presentationFrame.legacyVisibleCoachOwnerDetected === false (3102) | legacy suppressed when Brain + presentationFrame owns teaching frame | app/page.tsx:3102 + trainerPresentationFrame.ts guard | Guard + suppression added this continuation |

## Key Invariants (Post-Pass)

- On any frame where `brainAnalysisForCoach && isTeachingFrame`: the **visible** coach card the student sees must come from presentationFrame construction (enforced by bypass).
- revealTargetUci / hintTargetUci / visual lines are single-computed in presentationFrame.
- Mistake is now inside the presentation owner.

## Remaining Violations (for next iteration)

1. rawCoachDecision and liveCoachState memos still run unconditionally and feed the presentationFrame input (architectural smell).
2. Several render conditionals still key off displayedCoachDecision without presentationFrame guard.
3. Total reference count (118) not reduced; only the decision path for the card was rerouted.

**Verdict contribution**: Major convergence on visible surfaces for Brain teaching frames, but not yet "exclusive across every surface and path" as required for full Blocker 2 closure.
