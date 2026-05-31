# Legacy Coach Path Status (Blockers 1–3 Pass)
**Date**: 2026-05-31  
**Rule (verbatim)**: After TrainerPresentationFrame convergence, every legacy module may only be helper / claim / evidence / debug / deprecated. None may be the visible authority for coach text, visuals, reveal, hint, or mistake on teaching frames.

## Exact Classification Table

| Module / Symbol | File(s) | Pre-Pass Role | Post-Pass Allowed Role | Visible Output? | Evidence / Notes |
|-----------------|---------|---------------|------------------------|-----------------|------------------|
| liveCoach/pedagogicalOpportunityEngine (rankPedagogicalOpportunities) | lib/blundr/liveCoach/ | Primary opportunity ranking for coach text | Claim/evidence source (WRAP for pedagogy) | NO on Brain teaching frames | Still imported and called in rawCoachDecision memo (page.tsx:1256). Must become internal to Brain only. |
| liveCoach/liveCoachCommentRanker (selectBestLiveComment) | lib/blundr/liveCoach/ | Selected comment for card | Debug / evidence only | NO | Same memo |
| liveCoach/* (positionEvidenceBuilder, candidateMoveProfiler, liveCoachCopyLibrary, liveCoachIntentSelector, liveCoachSilencePolicy, liveCoachSafety, liveCoachDebug) | lib/blundr/liveCoach/ | Full live coach pipeline | All deprecated for visible output; evidence packets only | NO | Heavy usage in liveCoachState (page.tsx:1244) |
| coachBrain/coachExplanationPipeline (buildCoachExplanationPipeline) | lib/blundr/coachBrain/ | Core visible explanation builder | Helper for Brain explanations/claims (already partially WRAP'd) | NO (Brain now owns) | Still called in page.tsx:391 and 1259. Brain enriches it. |
| rawCoachDecision (useMemo) | app/page.tsx:1377 | Primary source of displayed coach decision | Input aggregator → presentationFrame only; visible output forbidden on teaching frames | NO (post-bypass) | Now secondary after bypass at 1777 |
| liveCoachState (useMemo) | app/page.tsx:1244 | Primary live coach state | Same as above | NO (post-bypass) | Feeds presentationFrame input |
| displayedCoachDecision (useMemo + renders) | app/page.tsx:1759+ | The actual object rendered to <CoachCard/> and many conditionals | Thin adapter (Brain path = presentationFrame exclusive; legacy only for non-Brain or debug) | PARTIAL (bypass made exclusive for Brain teaching) | 71 references — highest count. Many still used in render logic. |
| buildCoachContext / decideCoachOutput (old coach/*) | lib/blundr/coach/ | Old decision engines | Deprecated / evidence | NO | Not primary anymore |
| coachDecision (derived from raw) | app/page.tsx | Intermediate | Input to presentationFrame | NO for visible on Brain | Still heavily passed into presentationFrame |
| legacyTrainingCardActuallyRendered / legacyAnswerCard | app/page.tsx:3085-3086 | Fallback cards | Explicit legacy fallback only when presentationFrame suppresses | YES (allowed fallback, not Brain teaching authority) | Documented as intentional non-Brain path |
| coachExplanationPipeline (old) | lib/blundr/coachBrain/ | Visible copy source | Brain claim builder only | NO | Already partially migrated |

## Runtime Guard Status

- `legacyVisibleCoachOwnerDetected`: **IMPLEMENTED** (trainerPresentationFrame.ts ~227-243).
- Exposed on TrainerPresentationFrame contract.
- Used in page.tsx to suppress legacyTrainingCardActuallyRendered / legacyAnswerCard on clean Brain teaching frames.
- Proving tests (3/3 green) assert it is false when presentationFrame enforces on Brain + teaching frames.
- New dedicated test: lib/blundr/presentation/__tests__/trainerPresentationFrameLegacyGuard.test.ts

## Reference Count Trend (page.tsx only)

- Total legacy symbols (raw + live + displayed): 118 (measured 2026-05-31)
- Target for full Blocker 3 closure: >80% reduction in **visible-ownership** usages on teaching frames (memos may remain as input sources if clearly marked deprecated-for-visible).

## Allowed Future State (Post Full Closure)

- Legacy modules exist only for:
  - Debug snapshots / parity tests
  - Claim/evidence generation that Brain consumes
  - Non-teaching surfaces (branch transitions, terminal, opponent reply)
  - Gradual deprecation wrappers

Any direct use of legacy outputs to decide what the student sees on a Brain teaching frame = violation (caught by guard + tests).

**Verdict contribution**: Classification complete. Implementation of guard + proving tests + actual reference pruning still required for Blocker 3 closure.
