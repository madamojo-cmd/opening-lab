# Stage 2 D.6 Final 21 Coaching Packet Adapter Plan

## Scope

- D.6 planning/stabilization only for final 21-opening coaching packet readiness.
- No `app/page.tsx` changes.
- No trainer behavior changes.
- No runtime candidate authority changes.
- No Stage 2 coaching copy rendering.
- No visual recipe rendering.
- No runtime content import/integration in this step.

## D.5 Findings Recap (Evidence-Carried Forward)

- Runtime opening set remains fixed at 21 (`data/blundr/stage2-21-opening-stepdown-runtime-v1/`).
- Preferred tracked content source `docs/content/stage2/` was missing/incomplete.
- D.5 inspected fallback source: `imports/stage2-sample/content-base/docs/content/stage2/` (untracked).
- `openingSummaries` coverage: `partial` for all 21 openings, `complete` for none, `blocked` for none.
- Concept extraction:
  - Openings with concept IDs: 15/21.
  - Openings with no extractable concept IDs: `colle-white`, `italian-black`, `italian-white`, `petroff-black`, `queens-indian-black`, `ruy-lopez-white`.
- Highest reconciliation-failure burden (by D.5 inventory):
  - `nimzo-indian-black` (28)
  - `scotch-white` (28)
  - `queens-indian-black` (25)
  - `reti-white` (25)
  - `slav-black` (25)
  - `vienna-white` (25)
- Warning classes preventing learner-facing acceptance:
  - `draft_needs_mergeSource`
  - `mergeSource_mentioned`
  - `placeholder_or_todo_detected`
  - `unsupported_claim_language_detected`
  - `legacy_node_id_pattern_detected`
- Candidate openings for first renderable upgrade batch (not render-ready yet, but strongest starting evidence):
  - `london-white`, `french-black`, `scandinavian-black`, `sicilian-black`, `english-white`, `caro-kann-black`, `queens-gambit-white`.

## Why All 21 Remain Partial

- Source location is untracked fallback content rather than canonical tracked source.
- Extraction is not yet deterministic enough for copy/visual metadata in all files.
- Reconciliation gaps remain between move/playKey references and runtime package keys.
- Placeholder/draft/mergeSource and unsupported-claim warnings are still present.
- Several openings currently have no extractable concept IDs under current parsing rules.

## Canonical Content Source Stabilization Strategy

## Decision Direction

- Plan to promote reviewed content into tracked canonical path: `docs/content/stage2/`.
- Do not promote in D.6; promotion is a controlled D.7 execution step.

## Pre-Promotion Review Checklist

- Verify source-of-truth branch/commit for `imports/stage2-sample/content-base/docs/content/stage2/`.
- Confirm file set contains exactly the runtime 21 opening IDs plus shared registries.
- Run deterministic lint/scan for placeholder/todo/mergeSource and unsupported-claim markers.
- Run reconciliation dry-run against runtime nodes/moves JSONL and produce per-opening deltas.
- Remove sample-only artifacts, generator leftovers, and stale crawl outputs from promotion list.

## What To Track vs Keep Untracked

- Track in `docs/content/stage2/`:
  - Opening `.md` and `.json-spec.md` files for the final 21 openings.
  - Shared registries/libraries needed for concept/copy/reference mapping.
  - Canonical index/manifest file documenting final 21 inventory.
- Keep untracked:
  - Sample harness material.
  - Generated crawl/normalization intermediates.
  - Any `.tgz` or exported bundle artifacts.
  - Alternate 23-opening sample snapshots.

## 21 vs 23 Naming Policy

- Canonical naming for this phase is `final-21` only.
- Any `all23` references must be marked as legacy/non-authoritative metadata.
- Missing 2 openings are documented as explicit future scope, not hidden:
  - Keep a short section in canonical docs: "Deferred openings (not in final-21 runtime package)".

## Proposed Final Coaching Packet Schema (For Future Adapter)

```ts
type CoachingSurface = "assisted" | "plain_hint" | "plain_show_more" | "review" | "debug_only";
type CoachingStatus = "approved" | "draft" | "disabled" | "blocked";
type RuntimeReconciliation =
  | { status: "matched"; openingId: string; playKey?: string; lineId?: string; moveUci?: string }
  | { status: "unmatched"; reason: string; openingId: string; playKey?: string; lineId?: string; moveUci?: string };
type SafetyStatus = "safe" | "needs_review" | "blocked";

type Stage2CoachingPacketEntry = {
  openingId: string;
  playKey?: string;
  lineId?: string;
  moveUci?: string;
  moveSan?: string;
  conceptId?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  surface: CoachingSurface;
  status: CoachingStatus;
  title: string;
  body: string;
  hint?: string;
  showMore?: string;
  commonMistake?: string;
  remediation?: string;
  visualRecipeRefs: string[];
  evidenceIds: string[];
  sourceFile: string;
  sourceSection: string;
  runtimeReconciliation: RuntimeReconciliation;
  safetyStatus: SafetyStatus;
};
```

## Safety Rules For `approved`

- No placeholders/todos/mergeSource markers.
- No internal labels leaking to learner-facing fields.
- No unsupported best/only/forced/winning claims without evidence policy support.
- Move-specific entries must reconcile to runtime (`openingId + playKey|lineId + moveUci`).
- Pre-Show-More Plain View uses safe hints only.
- `visualRecipeRefs` remain metadata only until visual rendering is separately approved.

## Content Normalization Requirements

Each opening file must contain normalized sections with stable headings:

- Opening Identity
- Opening Summary
- Curriculum Goals
- Core Plans
- Main Line / Branch Families
- Feature Detection Map
- Feature-to-Concept Map
- Copy Library
- Visual Recipe Library
- Common Mistakes
- Remediation Copy
- Review Prompts
- Acceptance Matrix

## Extraction Format Contract

- `conceptId`: explicit key-value or fenced structured list; unique per concept row.
- Copy variants: explicit per-surface blocks keyed by `surface` and `status`.
- `moveUci`: explicit lowercase UCI token, one authority field.
- `playKey`/`lineId`: explicit deterministic key field; no inferred prose parsing.
- `visualRecipeRefs`: explicit array-like field, stable IDs only.
- `difficulty`: enum-only (`beginner|intermediate|advanced`).
- `surface`: enum-only (`assisted|plain_hint|plain_show_more|review|debug_only`).
- `status`: enum-only (`approved|draft|disabled|blocked`).

## First Upgrade Batches (Planning Recommendation)

## Batch A — First Renderable Candidates (after normalization + safety pass)

- `london-white`
- `english-white`
- `caro-kann-black`
- `french-black`
- `sicilian-black`
- `scandinavian-black`
- `queens-gambit-white`

Rationale: stronger concept extraction + lower reconciliation-failure burden + high beginner relevance + runtime coverage.

## Batch B — Next Candidates

- `qgd-black`
- `pirc-black`
- `kings-indian-black`
- `slav-black`
- `vienna-white`
- `reti-white`
- `nimzo-indian-black`
- `scotch-white`

Rationale: concept coverage present but reconciliation burden elevated and requires deeper line-key cleanup.

## Batch C — High-Risk/Low-Concept Openings

- `colle-white`
- `italian-black`
- `italian-white`
- `petroff-black`
- `queens-indian-black`
- `ruy-lopez-white`

Rationale: missing extractable concept IDs and/or major reconciliation cleanup needed before render-safe packet approval.

## Blocked/Missing Source Issues

- No hard file-missing blockers for runtime-21 in D.5.
- Structural blockers remain for deterministic extraction and canonical source tracking.

## Renderable Content Acceptance Gates

1. Gate 1 — Source Stabilized
- Canonical tracked path established (`docs/content/stage2/`).
- All runtime 21 openings represented.
- 21-vs-23 naming and deferred openings explicitly documented.

2. Gate 2 — Structured Extraction
- All opening files parse deterministically.
- Concepts/copy/visual refs extracted with stable schema fields.

3. Gate 3 — Runtime Reconciliation
- Move-specific entries reconcile by `openingId + playKey|lineId + moveUci`.
- Unmatched rows are documented and `disabled`/`blocked`, not silently accepted.

4. Gate 4 — Learner Safety
- No placeholders/internal markers in approved learner-facing fields.
- Unsupported claims removed or downgraded.
- Plain pre-Show-More text restricted to safe hint surfaces.

5. Gate 5 — Adapter Readiness
- Final packet schema validation passes.
- Tests prove no runtime import/integration until feature-flagged enablement step.
- Adapter output supports packet retrieval without move-authority selection.

6. Gate 6 — UI Rendering Readiness
- Feature flag strategy documented.
- Plain/Assisted/Show More surface rules locked.
- Target-alignment invariants and debug visibility are preserved.

## Adapter Design Overview (Future D-Step)

- Build a read-only packet builder that consumes canonical stage2 content + runtime reconciliation index.
- Emit structured `Stage2CoachingPacketEntry` records with explicit `status` and `safetyStatus`.
- Keep packet generation separate from move candidate authority and trainer decision logic.
- Introduce enablement behind a feature gate after Gates 1-5 pass.

## Risks

- Promoting unreviewed sample content could freeze stale or contradictory instructional claims.
- Reconciliation mismatches can create targetless or misleading coaching entries if not strictly disabled.
- Inconsistent heading/field style across opening files can break deterministic extraction.
- Legacy 23-opening references can leak into final-21 flows unless naming policy is enforced.

## Next Recommended Step

- D.7 — canonical content source stabilization execution (tracked source promotion + deterministic extraction hardening, no learner rendering yet).

D6_FINAL_21_COACHING_PACKET_ADAPTER_PLAN_STATUS: ACCEPTED_FOR_PLANNING
