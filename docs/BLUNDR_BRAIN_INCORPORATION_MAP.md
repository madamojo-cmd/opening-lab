# BLUNDR Brain Incorporation Map (v2.7.39.x → v2.8.0)

**Status**: Initial per v2.0 Coach-First Roadmap (Coach Perfection Gate 3C + 3D).  
**Goal**: Define the public `BlundrBrainAnalysis` contract and map existing modules into `Brain.*` namespaces without breaking current behavior until v2.7.40+.

## Core Contract (Target for v2.7.40)

```ts
export type BlundrBrainAnalysis = {
  frameKey: string;                    // instructionFrameKey
  target: CurrentInstructionTarget | null;
  features: {
    kingSafety: any;
    pawnStructure: any;
    pieceQuality: any;
    tacticalMotifs: any[];             // from 2.7.39.7
    attackMap: any;
    // ...
  };
  plans: {
    recognized: any[];
    primaryPlan?: any;
  };
  opportunities: {
    ranked: any[];
    selectedId: string | null;
    scoreBreakdown?: any;
  };
  explanation: {
    claims: string[];
    evidenceScore: number;
    renderedCopy?: string;             // future
    safety: any;
  };
  candidateScoring?: {                 // v2.7.39.5
    legalMoves: Array<{uci: string; scores: Record<string, number>}>;
    selected: {uci: string; scoreBreakdown: Record<string, number>};
  };
  meta: {
    analysisMs: number;
    cacheHit: boolean;
    fallbackUsed: boolean;
    fallbackReason?: string;
    brainVersion: "v1";
  };
};
```

## Incorporation Map (Existing → Brain.*)

| Existing Module(s) | Target Brain Namespace | Phase | Wrapper Location | Deprecation Target | Notes |
|--------------------|------------------------|-------|--------------------|--------------------|-------|
| `geometry/attackMap.ts`, `mobilityMap.ts`, `kingZone.ts`, etc. | `Brain.board.attackMap`, `Brain.move.mobility`, `Brain.king.zone` | 2.7.39.6 | `lib/blundr/brain/board.ts` (new) | N/A (keep as lib) | Pure geometry stays. |
| `features/kingSafetyExtractor.ts` + `pawnStructureExtractor.ts` + `pieceQualityExtractor.ts` + `tacticalMotifExtractor.ts` | `Brain.features.*` | 2.7.39.6 + 2.7.39.7 | `lib/blundr/brain/features.ts` | legacy featurePacket in debug | Deterministic 100-FEN tests required. |
| `plans/planRecognitionEngine.ts` (and siblings) | `Brain.plans.recognition` | 2.7.39.6 | `lib/blundr/brain/plans.ts` | planPacket |  |
| `opportunity/multiLayerOpportunityRanker.ts` + related | `Brain.opportunities.ranking` + `Brain.candidates.scoring` | 2.7.39.5 (basic wrapper in 2.7.39.2) | `lib/blundr/brain/analyzeBlundrPosition.ts` (new) | opportunityPacket | Basic ranking from target now in Brain facade; full in 2.7.39.5. |
| `explanation/proceduralExplanationEngine.ts` + `coachTemplateLibrary.ts` + `evidenceConditionedCopyBuilder.ts` | `Brain.explanation.renderer` + `Brain.explanation.evidence` | 2.7.39.3 | `lib/blundr/brain/explanation.ts` | coachExplanationPipeline direct calls | Evidence-first copy. |
| `coachBrain/coachExplanationPipeline.ts` + `liveCoach/*` | `Brain.analyzeBlundrPosition(...)` (orchestrator) | 2.7.39.2 (facade) then 2.7.39.3 | `lib/blundr/brain/analyzeBlundrPosition.ts` (new) | intentFirstCoachEngine, coachDecisionEngine direct use | The single entry point. Pipeline accepts brainAnalysis; wired in main live coach path in app/page.tsx (debug mode for now). |
| `continuedPlay/continuedPlayMovePolicy.ts` | `Brain.candidates.continuationPolicy` + scoring | 2.7.39.5 (basic in facade) | `lib/blundr/brain/analyzeBlundrPosition.ts` | continuedPlay/* direct | Basic candidate scoring now in Brain (2.7.39.5 start). |
| Debug packets (featurePacket, planPacket, etc.) | `analysis.debug` + `analysis.coachTimeline` | 2.7.39.4 | trainerDebugSnapshot + Brain | All `*_not_exposed` legacy warnings | Brain becomes the only source of truth. |

## Implementation Order (Matches Versioned Roadmap)
1. v2.7.39.1: Locking + `instructionFrameKey` (complete).
2. v2.7.39.2: Facade + real delegation (features/plans/opportunities/scoring — complete).
3. v2.7.39.3: Coach pipeline consumes `BlundrBrainAnalysis` (wired + enrichment — complete).
4. v2.7.39.4: Debug consumes Brain (primary in snapshot — complete).
5. v2.7.39.5–7: Scoring + features + tactics in Brain (foundations complete).
6. v2.7.40: Brain v1 stable + gate exit foundations (strong base ready for final polish).
7. **2.8.0 (Testing Milestone per user correction)**: Comprehensive testing of the perfected Brain Coach. Minimal post-gate foundations only. Stop before 2.9.0 product expansion.

## Rules (from v2.0 Roadmap)
- Brain must **never** choose a target different from `CurrentInstructionFrame.target`.
- All golden positions must pass parity or improvement.
- Old modules stay on disk until Brain + tests prove equivalence and no surface consumes the old path directly.
- `docs/BLUNDR_COACH_ARCHITECTURE_INVENTORY.md` is the source of truth for classification.

## Open Items
- Exact TypeScript types for `BlundrBrainAnalysis` (start in `lib/blundr/brain/types.ts`).
- Caching strategy (reuse existing coachCache?).
- Error / fallback model inside Brain.

Update this map after every incorporation step.

---
*Authoritative per Blundr Comprehensive Coach-First Roadmap v2.0.*

---

## Production Convergence Status (2026-05-31) - Strict Brain V2 Production Spec

**Current Phase**: Step 3 - Production Brain (in progress; Steps 1-2 complete)

**Step 3 Progress**: 
- Core types updated to full production contracts.
- analyzeBlundrPosition wired to new submodules.
- boardTruth/, candidates/, engineValidation/, pedagogy/ now have real (delegating) implementations.
- More submodules coming in this step.

This session is now operating under the strict "Production-Ready Blundr Coach" mandate (no product features, full Brain ownership model, single TrainerPresentationFrame, mandatory Stockfish validation, etc.).

**High-Level Classification (Initial Pass)**:
- `coachBrain/coachExplanationPipeline.ts` → **Wrap inside Brain** (major refactor needed).
- `liveCoach/*` (pedagogicalOpportunityEngine, etc.) → **Migrate logic into `brain/pedagogy/`**.
- `openings/expectedMoveResolver.ts` → **Use as helper** (candidate source only).
- `presentation/trainerPresentationFrame.ts` → **Evolve** to the strict mandated `TrainerPresentationFrame` that owns *all* visible output.
- Most modules in `coach/`, `explanation/`, `opportunity/`, `plans/`, `features/` → Detailed wrap/use/deprecate/delete classification ongoing.

**Next**:
- Complete detailed audit (especially `app/page.tsx`).
- Produce full classification table.
- Proceed to Step 2 (remove any Brain debug-gating).