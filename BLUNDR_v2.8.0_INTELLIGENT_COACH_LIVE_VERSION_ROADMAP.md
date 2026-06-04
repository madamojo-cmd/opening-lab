# BLUNDR v2.8.0 Intelligent Coach - Live One-Pass Agentic Roadmap

**Document status:** Comprehensive execution contract and roadmap  
**Project:** Blundr guided chess opening trainer  
**Release target:** v2.8.0 Intelligent Coach  
**Execution model:** One sequential, supervised, durable, test-first agentic implementation pass  
**Important:** This document is now the **live v2.8.0 execution contract**. It is content-preserving relative to the prior roadmap, but all operative versioning has been migrated into v2.8.0. Nothing has been deleted, compressed, or weakened.

---

# Part I - Supervisor Correction, Versioning Migration, and Non-Compression Guarantee

The prior v2.8.0 draft was insufficient because it compressed the original 3,011-line roadmap into a shorter substitute. That is not acceptable for this project. This replacement document uses a different rule:

```txt
Preserve the original roadmap content and specifications.
Integrate v2.8.0 execution governance, agentic best practices, ground-truth tests, and one-pass implementation instructions directly into the live roadmap.
Do not delete prior roadmap content.
Do not weaken original gates.
Do not substitute summaries for specifications.
```

This document therefore contains:

1. A new v2.8.0 one-pass agentic execution overlay.
2. A complete supervisor operating system for Grok.
3. A strict sequential phase graph.
4. A complete artifact/file system.
5. A comprehensive ground-truth testing matrix.
6. A no-false-testing policy.
7. A no-shortcut policy.
8. The full prior roadmap content migrated into v2.8.0 operating language.
9. The stabilization coaching checkpoint migrated into v2.8.0 operating language.
10. A master Grok execution prompt.

---

# Part II - v2.8.0 Mission

## 2.1 Product Objective

Blundr v2.8.0 must make the coach feel substantially more intelligent while remaining impossible to miswire. The release must advance beyond deterministic coach lock into advanced evidence-grounded coaching, including:

- Stockfish evidence enrichment.
- Maia-style human continuation context.
- Opening knowledge retrieval.
- Advanced tactical and strategic concept activation.
- 2000-Elo-level explanation depth.
- Candidate move comparison.
- Opponent resource explanation.
- Practical human mistake framing.
- Grounded, safety-checked phrasing.
- Durable debug provenance.
- Permanent golden benchmark coverage.

The release must not sacrifice the stabilization coaching guarantees:

- `CurrentInstructionFrame.target` remains the only visible teaching authority.
- Coach text, Hint, Show More, Reveal, and board visuals remain target-aligned.
- Plain View does not leak before Show More.
- Show More text equals Assisted content for the same target.
- Show More board visual equals Assisted board visual for the same target.
- Branch transition has no move coach or answer visual.
- Continuation candidates appear only after Continue is clicked.

## 2.2 Engineering Objective

This is a **one-pass supervised sequential agentic task**, not a pile of independent agents. Grok should operate as a supervisor that runs internal specialist phases in sequence, with hard gates between them.

The execution pattern is:

```txt
Supervisor bootstrap
  -> Baseline freeze
  -> Roadmap materialization
  -> Authority audit
  -> Contract and type alignment
  -> Ground-truth tests first
  -> Provider adapters with mocks
  -> Engine evidence provider
  -> Maia continuation provider
  -> Opening knowledge retriever
  -> Advanced concept activator
  -> 2000-Elo coach compiler
  -> Optional grounded phrasing gate
  -> Visual/Show More integration
  -> Continuation preservation
  -> Debug and telemetry proof
  -> Full test battery
  -> Browser QA
  -> Preview deployment only if gated
  -> Release report
```

## 2.3 Live v2.8.0 Versioning Rule

All work in this roadmap is now part of **BLUNDR v2.8.0 Intelligent Coach**. Older labels such as Foundation Gate, Advanced Intelligence Gate, and Stabilization Coaching Checkpoint describe execution stages inside v2.8.0 only. They are not separate releases, branches, or version numbers.

Required naming:

```txt
branch: v2.8.0-intelligent-coach-live
stabilization branch if needed: v2.8.0-stockfish-gated-coach-stabilization
release candidate tag: v2.8.0-intelligent-coach-rc1
stable tag: v2.8.0-intelligent-coach-stable
production deployment label: v2.8.0 Intelligent Coach
```

Forbidden naming in new files, reports, branches, commits, or prompts:

```txt
any pre-v2.8.0 split-release labels
any old Foundation/Advanced split release numbers
any old stabilization checkpoint version number
any old two-stage A/B release labels
coach-deployment-lock under an old version number
```

If historical text is encountered, the agent must translate it into v2.8.0 stage language before using it operationally.

## 2.4 v2.8.0 Stabilization Coaching Checkpoint Now Goes Live

The stabilization checkpoint is no longer a separate old-version step. It is the first mandatory live gate inside v2.8.0. It must be completed before advanced intelligence features are allowed to affect visible coach output.

This gate must deliver:

1. Stable deterministic coach target alignment.
2. Stockfish top-10 evidence gate for anti-hallucination claim control.
3. Plain View Show More reveals Assisted-equivalent board highlights for the same locked target.
4. No answer leakage before Show More.
5. No Stockfish, Maia, opening knowledge, or phrasing provider can own visible instruction targets.
6. Browser QA proves the complete live trainer flow.

## 2.5 Stockfish Top-10 Gate Required for v2.8.0 Live

For every user-turn teaching frame with a locked target, v2.8.0 must run or retrieve cached Stockfish MultiPV top-10 evidence for the frame’s `fenBefore`.

Stockfish is a claim-strength gate, not a target owner.

```txt
CurrentInstructionFrame.target remains authoritative.
Stockfish evaluates whether the locked target is top 1, top 3, top 10, not top 10, unavailable, or timed out.
The target remains playable even when not top 10.
Coach language is downgraded when engine evidence does not support strong claims.
```

Required claim rules:

```txt
Target rank 1: may say best if no contradiction exists.
Target rank 2-3: may say strong or engine-supported, not best.
Target rank 4-10: may say engine-recognized or viable, not best/strongest.
Target not top 10: repertoire-safe and concept-safe language only.
Stockfish unavailable/timeout: deterministic evidence only, no engine-backed language.
```

Forbidden without evidence:

```txt
best
strongest
engine-backed
top move
wins material
winning
decisive
forced
only move
mate
checkmate
blunder
refutes
trap
```

## 2.6 Show More Assisted-Visual Reveal Required for v2.8.0 Live

Plain View remains recall mode before Show More. After Show More, the user must see the same board teaching highlight they would see in Assisted View for the same locked target.

Before Show More:

```txt
No exact SAN.
No UCI.
No source square.
No destination square.
No source/destination highlight.
No answer arrow.
No raw label such as answer_move.
```

After Show More:

```txt
Show More text equals Assisted coach content for the same target.
Board visual recipe equals Assisted View visual recipe for the same target.
visualMoveUci === instructionTargetUci.
showMoreTargetUci === instructionTargetUci.
Move is not executed.
Board FEN does not change.
Show More reveal state resets on frameKey change.
```

---

# Part III - Agentic Best-Practice Operating System

This section converts general agentic best practices into hard engineering rules for this repo.

## 3.1 Use Workflow, Not Free Autonomy

The v2.8.0 implementation must use a deterministic workflow with explicit phases. The agent may reason internally, but repo modifications must follow the phase graph. This prevents the common failure mode where a coding agent edits many surfaces at once, reports success, and leaves browser behavior broken.

Required pattern:

```txt
Plan -> Inspect -> Test design -> Implement -> Validate -> Report -> Gate -> Continue
```

Forbidden pattern:

```txt
Edit broadly -> build once -> claim fixed
```

## 3.2 Prompt Chaining

Each phase must produce a tangible artifact consumed by the next phase.

Examples:

| Phase | Required output | Consumed by |
|---|---|---|
| Baseline | Baseline report | All later phases |
| Authority audit | Surface producer/consumer map | Integration phase |
| Test design | Golden fixtures and test files | Implementation phases |
| Provider implementation | Mocked provider contract | EvidenceGraph and compiler |
| Coach compiler | CompiledCoachFrame contract | Safety and presentation |
| Safety gate | Blocker report schema | Debug and browser QA |
| Browser QA | screenshots, console logs, debug counters | Release decision |

No phase may proceed if its required artifact is missing.

## 3.3 Routing

The supervisor must route tasks to specialized internal modes rather than applying one generic editing style everywhere.

Required internal roles:

```txt
Supervisor / Release Manager
Architecture Auditor
Ground-Truth Test Engineer
Chess Rules Engineer
Engine Provider Engineer
Maia/Human-Continuation Engineer
Knowledge Retrieval Engineer
Coach Compiler Engineer
Safety Gate Engineer
Presentation/UI Integration Engineer
Browser QA Engineer
Release Engineer
```

These roles are sequential responsibilities in one Grok run, not separate uncontrolled branches.

## 3.4 Evaluator-Optimizer Loop

Every high-risk phase must include an evaluator step before moving on.

Evaluator checks:

- Does this phase satisfy its acceptance criteria?
- Did it touch files outside scope?
- Did it introduce direct UI bypasses?
- Did it rely on unmocked external services in tests?
- Did it add tests that can falsely pass?
- Did it preserve current trainer playability?
- Does debug expose enough proof?

If evaluator fails, the agent must optimize the implementation and re-run the validation. No phase may self-approve without its evaluator checklist.

## 3.5 Orchestrator-Worker Pattern Without Parallel Chaos

The supervisor may internally decompose work into worker tasks, but merge order is sequential. A worker output cannot be merged unless:

1. Its file diff is limited to assigned scope.
2. It includes tests.
3. It passes local validation.
4. It writes an agent report.
5. It does not violate previous gates.

## 3.6 Durable Execution and Crash Recovery

Every major phase must write a state file.

Required run directory:

```txt
.agent_runs/v2.8.0-intelligent-coach/<timestamp>/
```

Required files:

```txt
00_baseline.md
01_authority_audit.md
02_test_plan.md
03_provider_contracts.md
04_engine_provider_report.md
05_maia_provider_report.md
06_knowledge_retrieval_report.md
07_concept_activator_report.md
08_compiler_report.md
09_safety_report.md
10_presentation_report.md
11_browser_qa_report.md
12_release_report.md
state.json
risk_register.md
command_log.md
```

`state.json` must include:

```json
{
  "release": "v2.8.0-intelligent-coach",
  "branch": "",
  "baseSha": "",
  "currentSha": "",
  "phase": "",
  "gates": {},
  "blocked": false,
  "blockReason": null
}
```

If the run crashes, the agent must resume from the last completed gate, not restart from memory.

## 3.7 Human-in-the-Loop Stop Conditions

Even though this is a one-pass agentic task, some states require stopping and reporting.

Hard stop conditions:

- Build cannot pass after targeted fixes.
- Legal move generation disagrees with chess.js or existing chess engine library.
- Coach target differs from `CurrentInstructionFrame.target`.
- Plain View leaks answer before Show More.
- Show More visual differs from Assisted visual for same target.
- Stockfish provider becomes UI authority.
- Maia becomes instruction authority.
- External provider failure crashes app.
- Browser UI is unplayable.
- Debug counters show any critical issue.
- Tests are skipped, mocked falsely, or deleted to pass.
- Vercel deploy would require uncommitted or untracked source.

If any hard stop occurs, the agent must stop and produce an incident report rather than continuing.

## 3.8 No False Testing Policy

The following are explicitly forbidden:

- Skipping tests and reporting success.
- Replacing tests with weaker snapshot-only checks.
- Changing test assertions to match broken output.
- Mocking the system under test rather than its external dependency.
- Marking failing tests as `.skip`, `.todo`, or equivalent.
- Removing failing golden cases.
- Using browser smoke test that only loads page without playing a line.
- Claiming browser QA from screenshots without checking console and debug counters.
- Treating grep output as product proof.
- Treating build success as coach correctness.
- Treating preview deployment as validation.

Every test result must include command, exit code, and relevant output excerpt.

## 3.9 Ground Truth Hierarchy

When sources disagree, use this hierarchy:

1. Board legality from chess.js or the repo's canonical chess rules engine.
2. `CurrentInstructionFrame.target` for visible teaching target.
3. Stockfish for engine evaluation/tactics, never for target ownership in guided mode.
4. Curated opening tree for guided opening truth.
5. Lichess/opening explorer stats only for popularity/context/end-of-book threshold.
6. Maia only for human-like continuation opponent context.
7. Opening knowledge retrieval only as contextual evidence with provenance.
8. LLM phrasing only as style transformation of already-approved facts.

## 3.10 Invariant-First Development

Before adding intelligence, add invariant checks. Any new feature must prove it does not violate:

```txt
instructionTargetUci === coachMoveUci
instructionTargetUci === visualMoveUci
instructionTargetUci === revealTargetUci
instructionTargetUci === showMoreTargetUci
instructionTargetPieceType === coachPieceType
```

## 3.11 Provider Isolation

Every external/intelligent provider must be behind an adapter:

```txt
StockfishProviderAdapter
MaiaProviderAdapter
OpeningKnowledgeProviderAdapter
GroundedPhrasingProviderAdapter
```

Each adapter must support:

- deterministic mock mode,
- timeout,
- error result,
- unavailable result,
- provenance,
- debug trace,
- no UI ownership.

## 3.12 Tool and Dependency Hygiene

Do not add heavy dependencies unless needed. If a dependency is added:

- explain why existing code is insufficient,
- document package version,
- run install cleanly,
- ensure package-lock uses public registry,
- test build locally,
- verify no internal registry URLs are committed.

## 3.13 Commit Discipline

The one-pass branch may have internal commits per phase if helpful, but final release must have:

- a clean final commit,
- a tag,
- all reports committed,
- no `.tmp`, `.vercel/output`, `tsbuildinfo`, zip/tgz artifacts,
- no generated screenshots unless intentionally stored in docs with small size.

---

# Part IV - v2.8.0 One-Pass Phase Graph

## Phase 0 - Baseline Freeze and Safety Branch

### Objective

Create a clean rollback point from the known fixed trainer state.

### Commands

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline --decorate -20
npm run build
```

### Required artifacts

```txt
docs/BLUNDR_v2.8.0_BASELINE_FREEZE_REPORT.md
.agent_runs/v2.8.0-intelligent-coach/<timestamp>/00_baseline.md
```

### Gate

No product code changed.

---

## Phase 1 - Authority Audit and Bypass Map

### Objective

Map every target, coach, visual, reveal, hint, Show More, continuation, and provider path.

### Required searches

```bash
git grep -n "CurrentInstructionFrame\|CompiledCoachFrame\|VisibleTeachingSurface\|buildVisibleTeachingSurface" app components lib tests || true
git grep -n "coach\|hint\|Show More\|Reveal\|Continue from here\|visualRecipe\|targetUci\|expectedMovesForValidation" app components lib tests || true
git grep -n "Stockfish\|Maia\|openingKnowledge\|LLM\|gpt\|brain" app components lib tests || true
```

### Required report table

| Surface | Producer | Consumer | Is authoritative? | Must change? | Replacement |
|---|---|---|---|---|---|
| Coach title | | | | | |
| Coach body | | | | | |
| Plain hint | | | | | |
| Show More text | | | | | |
| Show More visual | | | | | |
| Reveal target | | | | | |
| Assisted visual | | | | | |
| Branch transition | | | | | |
| Continuation candidate | | | | | |

### Gate

No implementation until every visible teaching path is mapped.

---

## Phase 2 - Contract and Type System Expansion

### Objective

Ensure v2.8.0 has explicit typed contracts for advanced evidence, provider outputs, and safety provenance.

### Required contracts

```txt
CurrentInstructionFrame
EvidenceGraph
CoachEvidenceClaim
EngineAnalysis
MaiaContinuationContext
OpeningKnowledgeContext
CompiledCoachFrame
VisibleTeachingSurface
CoachSafetyResult
VisualIntent
GroundedPhrasingInput/Output
```

### Gate

Types compile and have tests for serialization/shape guards.

---

## Phase 3 - Ground-Truth Test Harness First

### Objective

Build tests before deep intelligence implementation.

### Required files

```txt
data/goldenCoachPositions.json
data/goldenOpeningKnowledgeFixtures.json
data/goldenEngineFixtures.json
data/goldenMaiaFixtures.json
tests/coach/goldenPositions.test.ts
tests/coach/targetInvariant.test.ts
tests/coach/plainLeak.test.ts
tests/coach/showMoreVisualReveal.test.ts
tests/coach/engineEvidenceProvider.test.ts
tests/coach/maiaProviderBoundary.test.ts
tests/coach/openingKnowledgeRetriever.test.ts
tests/coach/advancedConceptSelection.test.ts
tests/coach/groundedPhrasingSafety.test.ts
tests/coach/browserContract.test.ts
```

### Required categories

At minimum:

- 20 opening positions.
- 20 tactical motifs.
- 20 strategic positions.
- 20 Plain/Assisted/Show More leakage cases.
- 10 continuation cases.
- 10 provider failure cases.
- 10 anti-hallucination cases.

Total minimum: **100 golden items**.

### Gate

Tests must exist and initially fail only for missing implementation, not because assertions are wrong.

---

## Phase 4 - Stockfish Top-10 Evidence Gate and Provider

### Objective

Add Stockfish as evidence enrichment only and enforce the v2.8.0 top-10 claim-strength gate.

### Required rules

- Stockfish must never own guided instruction target.
- Stockfish must never render UI copy.
- Stockfish output must attach provenance.
- Engine unavailable must not break coach.
- Timeout must return graceful unavailable evidence.
- MultiPV top 10 must be available through a typed gate result in normal and mock modes.
- The locked target must be compared against the Stockfish top 10.
- Claim permissions must be derived from target rank, not from vague engine availability.
- If target is not top 10, the coach may teach it as a repertoire or concept move but must not call it best, strongest, forced, winning, or engine-backed.

### Required gate output

```ts
export interface StockfishTop10GateResult {
  provider: "stockfish";
  fen: string;
  targetUci: string;
  available: boolean;
  depth: number | null;
  timeMs: number | null;
  topMoves: Array<{
    rank: number;
    uci: string;
    san?: string;
    cp?: number;
    mate?: number;
    pv?: string[];
  }>;
  targetInTop10: boolean;
  targetRank: number | null;
  agreement:
    | "target_top1"
    | "target_top3"
    | "target_top10"
    | "target_not_top10"
    | "engine_unavailable"
    | "engine_timeout"
    | "not_applicable";
  claimPermissions: {
    maySayBest: boolean;
    maySayStrong: boolean;
    maySayEngineBacked: boolean;
    maySayTactical: boolean;
    maySayWinsMaterial: boolean;
    maySayForced: boolean;
    maySayMate: boolean;
  };
  blockedCoachClaims: string[];
}
```

### Required tests

- mock engine returns target best.
- mock engine returns target acceptable but not best.
- mock engine unavailable.
- mock engine tactical motif.
- engine attempts to override target and is blocked.

### Gate

Engine provider passes all tests and debug shows engine provenance.

---

## Phase 5 - Maia Continuation Provider

### Objective

Add Maia/human-like opponent context for continuation only.

### Required rules

- Maia may suggest opponent replies.
- Maia may provide human-likely mistake context.
- Maia may provide confidence.
- Maia may not own instruction targets.
- Maia may not create coach copy directly.
- Maia may not appear in guided opening mode except as unavailable/not applicable context.

### Gate

Tests prove Maia cannot bypass frame lock.

---

## Phase 6 - Opening Knowledge Retriever

### Objective

Add curated opening knowledge with provenance and evidence gating.

### Required rules

- Match by opening key, line key, FEN, move sequence, concept tags.
- Knowledge cannot create strong tactical claims without board/engine evidence.
- Low-confidence knowledge cannot produce strong visible language.
- Retrieval failure must not break coach.

### Gate

Retriever tests pass and debug shows knowledge provenance.

---

## Phase 7 - Advanced EvidenceGraph Fusion

### Objective

Fuse deterministic board evidence, Stockfish, Maia, and knowledge into one evidence graph.

### Fusion priority

```txt
Board legality > frame target > deterministic claims > Stockfish eval/tactics > curated knowledge > Maia continuation context > phrasing provider
```

### Required outputs

- claim list with IDs,
- provenance per claim,
- confidence level,
- blocked claims,
- contradiction list,
- provider status.

### Gate

Contradictions produce safe fallback or downgraded claims.

---

## Phase 8 - Advanced Concept Activator

### Objective

Select tactical, strategic, opening, calculation, and human-practical teaching concepts from evidence.

### Required capabilities

- candidate move comparison,
- tactical motif recognition,
- strategic theme selection,
- opening-theory theme selection,
- opponent resource identification,
- human-like mistake warning,
- practical plan framing,
- safer fallback when evidence incomplete.

### Gate

Golden concept tests pass, including negative tests.

---

## Phase 9 - 2000-Elo Coach Compiler

### Objective

Generate accurate advanced club-level teaching without unsupported claims.

### Required output layers

```txt
plain_hint
assisted_summary
show_more
advanced_details
next_plan
opponent_resource
candidate_comparison
debug_evidence
```

### Required language controls

- No “wins” without engine/material evidence.
- No “forced” without forcing sequence.
- No “mate” without mate evidence.
- No hallucinated opening line names.
- No piece mismatch.
- No candidate comparison unless alternatives exist.

### Gate

100 golden coach outputs pass.

---

## Phase 10 - Optional Grounded Phrasing Provider

### Objective

Optional style polish only after deterministic content is approved.

### Rules

- LLM may rewrite only approved facts.
- Output must return used claim IDs.
- Output must be rechecked by safety gate.
- If unsupported claim introduced, discard phrased output and use deterministic draft.
- App must work with phrasing disabled.

### Gate

Tests prove unsupported phrasing is blocked.

---

## Phase 11 - Visual and Show More Integration

### Objective

Ensure all visual displays remain target-bound and mode-correct.

### Required rules

- Assisted view shows target visual.
- Plain before Show More hides answer visual.
- Plain after Show More shows Assisted-equivalent visual for same target.
- Branch transition has no target visual.
- Continuation candidate visual appears only after Continue click.

### Gate

Show More visual tests and browser checks pass.

---

## Phase 12 - Continuation Preservation and Advanced Continuation

### Objective

Preserve current continuation behavior while enriching continuation coaching safely.

### Required rules

- Continue appears only at confirmed End-of-Book.
- No candidate before click.
- Candidate locks after click.
- Candidate target equals coach/visual/reveal target.
- Maia provides opponent context only.
- Stockfish may evaluate candidate but not replace locked target.

### Gate

Continuation browser QA passes.

---

## Phase 13 - Debug, Telemetry, and Ground-Truth Dashboard

### Objective

Make the debug panel prove correctness.

### Required counters

```txt
criticalIssues
coachTargetMismatchCount
pieceMismatchCount
visualMismatchCount
revealMismatchCount
showMoreMismatchCount
plainLeakCount
legacyBypassCount
providerFailureCount
engineOverrideBlockedCount
maiaAuthorityBlockedCount
unsupportedClaimBlockedCount
staleFrameCount
```

### Gate

Debug counters are zero in golden browser QA except expected provider failures in failure tests.

---

## Phase 14 - Browser QA and Preview Deployment

### Required browser flows

- fresh load,
- Italian line assisted,
- Italian line plain,
- Show More highlight,
- End-of-book,
- Continue,
- continuation candidate,
- provider unavailable mode,
- debug mode,
- mobile viewport.

### Gate

Browser visible proof passes before preview deploy.

---

## Phase 15 - Release Candidate Hardening

### Required checks

- Build.
- Lint.
- Unit tests.
- Integration tests.
- Golden tests.
- Browser tests.
- Registry scan.
- Artifact scan.
- Bundle check.
- Console log check.
- Vercel preview check.

### Gate

Only after all pass may tag `v2.8.0-intelligent-coach-rc1`.

---

# Part V - Required File System for v2.8.0

## 5.1 Documentation

```txt
docs/BLUNDR_v2.8.0_INTELLIGENT_COACH_EXECUTION_CONTRACT.md
docs/BLUNDR_v2.8.0_AGENTIC_RUNBOOK.md
docs/BLUNDR_v2.8.0_GROUND_TRUTH_TESTING_MATRIX.md
docs/BLUNDR_v2.8.0_PROVIDER_FAILURE_POLICY.md
docs/BLUNDR_v2.8.0_RELEASE_REPORT.md
```

## 5.2 Agent run artifacts

```txt
.agent_runs/v2.8.0-intelligent-coach/<timestamp>/state.json
.agent_runs/v2.8.0-intelligent-coach/<timestamp>/command_log.md
.agent_runs/v2.8.0-intelligent-coach/<timestamp>/risk_register.md
.agent_runs/v2.8.0-intelligent-coach/<timestamp>/phase_reports/*.md
```

## 5.3 Runtime and authority

```txt
lib/blundr/runtime/currentInstructionFrame.ts
lib/blundr/runtime/currentInstructionTarget.ts
lib/blundr/runtime/instructionFrameLock.ts
lib/blundr/runtime/continuationRuntimeState.ts
```

## 5.4 Evidence providers

```txt
lib/blundr/brain/buildEvidenceGraph.ts
lib/blundr/brain/types.ts
lib/blundr/brain/providers/boardTruthProvider.ts
lib/blundr/brain/providers/moveSemanticsProvider.ts
lib/blundr/brain/providers/tacticalMotifProvider.ts
lib/blundr/brain/providers/strategicFeatureProvider.ts
lib/blundr/brain/providers/openingContextProvider.ts
lib/blundr/brain/providers/visualEvidenceProvider.ts
lib/blundr/brain/providers/engineProvider.ts
lib/blundr/brain/providers/maiaProvider.ts
lib/blundr/brain/providers/knowledgeProvider.ts
lib/blundr/brain/providers/providerHealth.ts
```

## 5.5 Engine

```txt
lib/blundr/engine/stockfishService.ts
lib/blundr/engine/stockfishWorkerClient.ts
lib/blundr/engine/engineTypes.ts
lib/blundr/engine/mockEngineProvider.ts
```

## 5.6 Maia

```txt
lib/blundr/maia/maiaService.ts
lib/blundr/maia/maiaWorkerClient.ts
lib/blundr/maia/maiaTypes.ts
lib/blundr/maia/mockMaiaProvider.ts
```

## 5.7 Knowledge

```txt
lib/blundr/knowledge/OpeningKnowledgeRetriever.ts
lib/blundr/knowledge/openingKnowledgeTypes.ts
lib/blundr/knowledge/knowledgeRanker.ts
data/openingKnowledge/index.json
data/openingKnowledge/italian.json
data/openingKnowledge/ruy-lopez.json
data/openingKnowledge/queens-gambit.json
```

## 5.8 Coach compiler

```txt
lib/blundr/coachCompiler/BlundrCoachCompiler.ts
lib/blundr/coachCompiler/DynamicConceptActivator.ts
lib/blundr/coachCompiler/PedagogicalController.ts
lib/blundr/coachCompiler/teachingConceptRegistry.ts
lib/blundr/coachCompiler/claimBoundTemplateRenderer.ts
lib/blundr/coachCompiler/plainHintCompiler.ts
lib/blundr/coachCompiler/showMoreCompiler.ts
lib/blundr/coachCompiler/advancedDetailsCompiler.ts
lib/blundr/coachCompiler/candidateComparisonCompiler.ts
lib/blundr/coachCompiler/opponentResourceCompiler.ts
```

## 5.9 Safety

```txt
lib/blundr/safety/CoachSafetyGate.ts
lib/blundr/safety/plainLeakDetector.ts
lib/blundr/safety/targetInvariantGuard.ts
lib/blundr/safety/legacyBypassDetector.ts
lib/blundr/safety/claimEvidenceValidator.ts
lib/blundr/safety/surfaceBlockerMatrix.ts
lib/blundr/safety/providerAuthorityGuard.ts
lib/blundr/safety/groundedPhrasingGuard.ts
```

## 5.10 Presentation

```txt
lib/blundr/presentation/buildVisibleTeachingSurface.ts
lib/blundr/presentation/trainerPresentationFrame.ts
lib/blundr/presentation/visibleActionPolicy.ts
lib/blundr/presentation/visualRecipeCompiler.ts
components/coach/CoachCard.tsx
components/board/VisualRecipeLayer.tsx
components/board/TeachingOverlay.tsx
components/debug/CoachDebugPanel.tsx
app/page.tsx
```

## 5.11 Tests and fixtures

```txt
data/goldenCoachPositions.json
data/goldenEngineFixtures.json
data/goldenMaiaFixtures.json
data/goldenOpeningKnowledgeFixtures.json
tests/coach/goldenPositions.test.ts
tests/coach/plainLeak.test.ts
tests/coach/targetInvariant.test.ts
tests/coach/conceptSelection.test.ts
tests/coach/continuationFlow.test.ts
tests/coach/showMoreVisualReveal.test.ts
tests/coach/engineEvidenceProvider.test.ts
tests/coach/maiaProviderBoundary.test.ts
tests/coach/openingKnowledgeRetriever.test.ts
tests/coach/advancedConceptSelection.test.ts
tests/coach/groundedPhrasingSafety.test.ts
tests/coach/providerFailure.test.ts
tests/browser/blundrV280CoachFlow.spec.ts
```

---

# Part VI - Ground Truth Testing Matrix

## 6.1 Test Philosophy

The app is not correct unless chess truth, code truth, UI truth, and browser truth agree.

```txt
Chess truth = legal moves, SAN, tactics, engine evidence.
Code truth = types, contracts, unit tests, invariant guards.
UI truth = rendered DOM and board visuals.
Browser truth = actual interactive user flow, console, debug counters.
```

## 6.2 Test Levels

| Level | Purpose | Required |
|---|---|---|
| Unit | pure functions | yes |
| Contract | provider/type shapes | yes |
| Golden | known chess positions | yes |
| Property | invariant over generated legal moves | yes where feasible |
| Integration | frame -> evidence -> compiler -> surface | yes |
| Browser | actual trainer flow | yes |
| Failure injection | providers unavailable/timeout | yes |
| Negative | hallucination/leak/mismatch blocked | yes |
| Regression | old bugs never return | yes |

## 6.3 Golden Set Minimums

- 100 total golden positions.
- 20 openings.
- 20 tactics.
- 20 strategies.
- 10 continuations.
- 10 provider failures.
- 10 Plain/Show More leakage cases.
- 10 anti-hallucination cases.

## 6.4 Browser QA Must Verify

- User can start lesson.
- Correct first move accepted.
- Opponent reply occurs.
- Next instruction appears.
- Assisted coach exact move and visual target match.
- Plain before Show More hides answer.
- Show More reveals assisted-equivalent visual.
- End-of-book Continue appears only when confirmed.
- Continue click starts same-FEN continuation.
- Candidate appears only after Continue.
- Debug counters zero.
- Console clean.

## 6.5 Failure Injection Required

- Stockfish unavailable.
- Stockfish timeout.
- Stockfish contradictory best move.
- Maia unavailable.
- Maia suggests illegal move.
- Knowledge retrieval returns stale low-confidence item.
- LLM phrasing introduces unsupported claim.
- Visual compiler receives stale frame key.
- Plain leak detector receives SAN/from/to.

## 6.6 Anti-False-Test Audit

Before final report, run:

```bash
git grep -n "\.skip\|\.only\|todo\|FIXME test\|return true\|expect(true).toBe(true)" tests app components lib || true
```

Any false-test pattern must be explained or removed.

---

# Part VII - v2.8.0 Final Acceptance Gates

## Gate A - Architecture

- One target authority.
- No direct UI bypass.
- Provider outputs are evidence only.
- All visible output flows through surface builder.

## Gate B - Coach Quality

- Accurate move-specific explanations.
- Advanced but not hallucinated language.
- Candidate comparison only with evidence.
- Opponent resources grounded.
- 2000-Elo Show More quality for goldens.

## Gate C - Plain/Show More

- Plain no answer leak.
- Hint no exact move leak.
- Show More text equals Assisted.
- Show More visual equals Assisted visual.

## Gate D - Providers

- Stockfish evidence only.
- Maia continuation context only.
- Knowledge retrieved with provenance.
- LLM phrasing optional and safety-checked.
- Failure graceful.

## Gate E - Continuation

- Continue only at confirmed end.
- No candidate before click.
- Candidate locked after click.
- Candidate target aligns with coach/visual/reveal.

## Gate F - Testing

- Build passes.
- Lint passes if available.
- Unit tests pass.
- Golden tests pass.
- Browser tests pass.
- Debug counters zero.
- No false testing patterns.

## Gate G - Release

- Reports complete.
- Registry clean.
- Artifacts clean.
- Tag exists.
- Preview deploy passes if requested.

---

# Part VIII - Master Grok One-Pass Prompt

The prompt in the separate file `BLUNDR_v2.8.0_GROK_FULL_ONE_PASS_EXECUTION_PROMPT.md` instructs Grok to execute this roadmap exactly.

---

# Part IX - Prior Roadmap Content Migrated into v2.8.0

The following section preserves the prior roadmap’s technical content, but its operative versioning has been migrated to v2.8.0. It is retained for complete technical coverage and continuity.


# Blundr v2.8.0 Intelligent Coach Agent Roadmap  
## Deterministic Coach Finalization First, Then True Intelligence Expansion

**Document status:** Engineering execution roadmap  
**Project:** Blundr guided chess opening trainer  
**Date:** 2026-06-01  
**Primary objective:** Finalize a reliable, evidence-grounded, non-hallucinating chess coach that can eventually teach up to approximately 2000 Elo depth while remaining safe, deterministic, debug-verifiable, and fully aligned with the visual board state.

---

# 0. Executive Summary

Blundr’s coach must be rebuilt around one principle:

> **The coach is not allowed to invent a target, infer a target from UI state, reuse stale text, or explain a move that is not the current locked instruction target.**

The immediate release must **not** chase every advanced intelligence feature at once. The immediate release must first make the coach impossible to miswire.

This roadmap therefore splits the work into two releases:

## v2.8.0 Foundation Stabilization Gate — Coach Finalization and Runtime Lockdown

This is the required next checkpoint.

It must deliver:

1. One locked `CurrentInstructionFrame.target`.
2. One deterministic `CompiledCoachFrame`.
3. One mandatory `buildVisibleTeachingSurface` choke point.
4. One aligned visible surface containing:
   - coach copy,
   - hint,
   - Show More copy,
   - reveal action,
   - visual recipe,
   - debug trace.
5. No legacy direct-rendered coach text.
6. No Plain View answer leakage.
7. No coach/visual/reveal/target mismatch.
8. No piece mismatch.
9. Continuation button and continuation candidate flow repaired.
10. Browser debug proof that a fresh session can complete:
    - guided line,
    - end-of-book gate,
    - Continue from Here,
    - continuation candidate,
    - terminal state,
    - with zero critical issues.

## v2.8.0 Advanced Intelligence Gate — True Intelligence Expansion

Only after v2.8.0 Foundation Stabilization Gate passes should Blundr add:

1. Stockfish short multi-PV evidence.
2. Maia as a human-like continuation opponent only.
3. Opening knowledge retrieval.
4. Deeper tactical and strategic concept activation.
5. Knowledge provenance.
6. Optional grounded LLM phrasing.
7. 2000-Elo-level explanatory nuance.

The failure mode to avoid is adding more intelligence before the coach is structurally trustworthy. If the coach can still describe a bishop move as a knight move, advanced intelligence will only make the failures harder to debug.

---

# 1. Non-Negotiable Product and Architecture Rules

These rules are binding across every agent.

## 1.1 Single Teaching Authority

`CurrentInstructionFrame.target` is the only authority for user-facing teaching.

No component may independently decide:

- the move to explain,
- the move to reveal,
- the move to highlight,
- the move to draw as an arrow,
- the piece to describe,
- the destination square to reference,
- the hint target,
- the continuation candidate target.

All visible surfaces must derive from the same locked target.

## 1.2 Mandatory Choke Point

All visible teaching output must flow through:

```txt
CurrentInstructionFrame
    → EvidenceGraph
    → DynamicConceptActivator
    → BlundrCoachCompiler
    → CoachSafetyGate
    → buildVisibleTeachingSurface
    → TrainerPresentationFrame
    → UI
```

No UI component may directly render legacy coach text, raw evidence text, old brain output, old hint output, or old reveal action.

## 1.3 Invariant on Every User-Turn Teaching Frame

For every user-turn teaching frame:

```ts
instructionTargetUci === coachMoveUci
instructionTargetUci === visualMoveUci
instructionTargetUci === revealTargetUci
instructionTargetPieceType === coachPieceType
```

Any failure is a critical runtime issue.

The app must fail closed. It should show a safe fallback teaching surface rather than a wrong coach.

## 1.4 Plain View Contract

Plain View exists for active recall.

Plain View may show:

- one non-leaking hint,
- a Show More button,
- a Reveal Move button if allowed by policy,
- generic positional guidance.

Plain View must not show:

- SAN of the target move,
- UCI of the target move,
- source square,
- destination square,
- exact moving piece if it leaks the answer,
- visual arrow that reveals the target,
- highlighted source/destination squares,
- direct continuation text that names the answer.

## 1.5 Assisted View Contract

Assisted View may show:

- target-aligned coach explanation,
- visual arrows,
- highlights,
- pressure indicators,
- plan language,
- Show More content,
- reveal action.

But every visual and every sentence must be backed by evidence.

## 1.6 Maia Constraint

Maia is for human-like opponent replies in continuation.

Maia must never own:

- instruction targets,
- coach explanations,
- hints,
- reveal actions,
- visual target arrows,
- review items,
- lesson truth.

Maia may provide:

- likely human opponent move,
- confidence,
- rating-calibrated continuation pressure,
- deviation context.

The locked `CurrentInstructionFrame.target` remains the visible teaching authority.

## 1.7 Stockfish Constraint

Stockfish may enrich evaluation and tactical evidence.

Stockfish must not bypass the coach compiler.

Stockfish may provide:

- evaluation,
- short PV,
- multi-PV alternatives,
- tactical motifs,
- blunder severity,
- best-move validation.

But visible teaching still flows through the compiler and safety gate.

## 1.8 No Hallucination Rule

The coach may only make a chess claim when a corresponding evidence claim exists.

Examples:

| Coach Claim | Required Evidence |
|---|---|
| "This develops the bishop." | target piece is bishop, source is undeveloped home/early square, destination improves activity |
| "This attacks f7." | board truth confirms target move creates or increases attack on f7 |
| "This castles the king to safety." | target is castling and castling is legal |
| "This wins material." | tactical/eval evidence supports a material gain, not merely pressure |
| "This pins the knight." | line geometry confirms pinned piece, king/queen/rook target behind it, legal mobility restricted |
| "This is a pawn break." | pawn move challenges or opens a central/flank pawn structure |
| "This prevents castling." | board truth confirms opponent castling right or path is affected |

If the claim is not proven, the compiler must choose safer language.

Use safer language such as:

- "This increases pressure."
- "This improves activity."
- "This prepares a central break."
- "This supports king safety."
- "This develops a piece toward the center."

Do not say:

- "wins,"
- "forces,"
- "traps,"
- "mate,"
- "decisive,"
- "only move,"

unless evidence proves it.

---

# 2. Definitions

## 2.1 CurrentInstructionFrame

The locked runtime teaching frame.

Expected responsibilities:

- knows current FEN,
- knows whose turn it is,
- knows frame kind,
- knows target move or null,
- knows guided vs continuation mode,
- exposes stable `instructionFrameKey`,
- exposes debug trace,
- blocks stale or mismatched target consumers.

Suggested shape:

```ts
export type CurrentInstructionFrameKind =
  | "guided_move"
  | "lichess_branch_move"
  | "adaptive_branch_move"
  | "continuation_candidate"
  | "opponent_replying"
  | "transitioning"
  | "terminal"
  | "blocked";

export interface CurrentInstructionTarget {
  uci: string;
  san?: string;
  from: Square;
  to: Square;
  pieceType: PieceType;
  color: Color;
  flags: {
    isCapture: boolean;
    isCheck: boolean;
    isCheckmate: boolean;
    isCastle: boolean;
    isPromotion: boolean;
    isEnPassant: boolean;
  };
  provenance: TargetProvenance;
}

export interface CurrentInstructionFrame {
  frameKey: string;
  kind: CurrentInstructionFrameKind;
  fenBefore: string;
  fenAfterTarget?: string;
  ply: number;
  sideToMove: Color;
  target: CurrentInstructionTarget | null;
  mode: "guided" | "continuation" | "terminal" | "blocked";
  source: "opening_tree" | "lichess_branch" | "adaptive_branch" | "continuation_policy" | "terminal";
  debug: CurrentInstructionDebug;
}
```

## 2.2 EvidenceGraph

The structured truth packet used by the coach compiler.

The EvidenceGraph must not contain freeform visible copy. It contains facts and claims.

Suggested shape:

```ts
export interface EvidenceGraph {
  frameKey: string;
  target: CurrentInstructionTarget;
  boardTruth: BoardTruth;
  openingContext: OpeningContext;
  deterministicClaims: CoachEvidenceClaim[];
  tacticClaims: CoachEvidenceClaim[];
  strategicClaims: CoachEvidenceClaim[];
  visualEvidence: VisualEvidenceClaim[];
  engineAnalysis?: EngineAnalysis;
  maiaContext?: MaiaContinuationContext;
  knowledgeContext?: OpeningKnowledgeContext;
  historyContext?: ShortTermLearningContext;
  debug: EvidenceGraphDebug;
}
```

## 2.3 CoachEvidenceClaim

Every coach sentence must be traceable to one or more claims.

```ts
export type EvidenceClaimStrength =
  | "verified"
  | "probable"
  | "template_safe"
  | "blocked";

export interface CoachEvidenceClaim {
  id: string;
  frameKey: string;
  type: CoachEvidenceClaimType;
  strength: EvidenceClaimStrength;
  targetUci: string;
  subjectSquare?: Square;
  objectSquare?: Square;
  pieceType?: PieceType;
  textSafeSummary: string;
  machineFacts: Record<string, unknown>;
  provenance: EvidenceProvenance[];
}
```

## 2.4 CompiledCoachFrame

The single source for all visible coach output.

```ts
export interface CompiledCoachFrame {
  frameKey: string;
  targetUci: string;
  targetSan?: string;
  targetPieceType: PieceType;
  primaryConcept: TeachingConcept | null;
  secondaryConcepts: TeachingConcept[];
  evidenceUsed: CoachEvidenceClaim[];

  plain: {
    hint: string;
    showMoreAvailable: boolean;
    leakRisk: "none" | "low" | "blocked";
  };

  assisted: {
    title: string;
    body: string;
  };

  showMore: {
    title: string;
    body: string;
  };

  visualIntents: VisualIntent[];
  revealAction: RevealAction;

  safety: {
    allowed: boolean;
    blockedReasons: string[];
    warningReasons: string[];
  };

  provenance: EvidenceProvenance[];
  debug: CompiledCoachDebug;
}
```

## 2.5 VisibleTeachingSurface

The only object the UI may render.

```ts
export interface VisibleTeachingSurface {
  frameKey: string;
  owner: "compiled_coach_surface" | "safe_fallback_surface" | "terminal_surface";
  targetUci: string | null;
  displayMode: "assisted" | "plain" | "terminal" | "blocked";

  coachCard: {
    title: string;
    body: string;
    showMore?: {
      title: string;
      body: string;
    };
  } | null;

  plainHint: string | null;
  revealAction: RevealAction | null;
  visualRecipe: VisualRecipe | null;
  actionPolicy: VisibleActionPolicy;

  safety: SurfaceSafetyState;
  debug: VisibleSurfaceDebug;
}
```

---

# 3. Agent Operating Rules

Every agent must follow these rules.

## 3.1 Before Editing

Each agent must:

1. Read this roadmap.
2. Read the current branch status.
3. Inspect relevant files before changing them.
4. Identify all legacy paths touching the same surface.
5. List assumptions explicitly in their implementation report.
6. Avoid broad rewrites unless explicitly assigned.
7. Preserve product behavior unless the assignment says to remove legacy behavior.
8. Add tests before or with implementation.
9. Run the assigned validation commands.
10. Produce a handoff report.

## 3.2 Required Handoff Report Format

Each agent must create:

```txt
docs/BLUNDR_v2.8.0 Foundation Stabilization Gate_AGENT_<N>_<SHORT_NAME>_REPORT.md
```

The report must include:

```md
# Agent N Report: <Name>

## Scope
## Files Inspected
## Files Changed
## New Files Created
## Legacy Paths Removed or Quarantined
## Invariants Enforced
## Tests Added
## Commands Run
## Results
## Known Remaining Risks
## Handoff Notes for Next Agent
```

## 3.3 Required Validation Commands

Use whatever package manager the repo currently uses. If unknown, inspect `package.json`.

Minimum:

```bash
npm run build
npm test
npm run lint
```

If some commands do not exist, the agent must document that and run the closest available alternatives.

## 3.4 No Hidden Success

An agent may not say "done" unless:

- build result is known,
- tests result is known,
- changed files are listed,
- known remaining risks are listed,
- debug or acceptance criteria are addressed.

---

# 4. File and Module Map

This section names the expected architecture. Agents must adapt to the actual repo but should converge toward this structure.

## 4.1 Runtime Authority

Expected files:

```txt
lib/blundr/runtime/currentInstructionFrame.ts
lib/blundr/runtime/currentInstructionTarget.ts
lib/blundr/runtime/currentInstructionFrameDebug.ts
lib/blundr/runtime/continuationRuntimeState.ts
lib/blundr/runtime/instructionFrameLock.ts
```

Responsibilities:

- resolve target,
- lock target,
- expose frame key,
- distinguish guided/continuation/opponent/terminal,
- provide target metadata,
- provide debug trace.

## 4.2 Evidence

Expected files:

```txt
lib/blundr/brain/buildEvidenceGraph.ts
lib/blundr/brain/types.ts
lib/blundr/brain/providers/boardTruthProvider.ts
lib/blundr/brain/providers/moveSemanticsProvider.ts
lib/blundr/brain/providers/tacticalMotifProvider.ts
lib/blundr/brain/providers/strategicFeatureProvider.ts
lib/blundr/brain/providers/openingContextProvider.ts
lib/blundr/brain/providers/visualEvidenceProvider.ts
lib/blundr/brain/providers/engineProvider.ts
lib/blundr/brain/providers/maiaProvider.ts
lib/blundr/brain/providers/knowledgeProvider.ts
```

v2.8.0 Foundation Stabilization Gate should implement deterministic providers first.

v2.8.0 Advanced Intelligence Gate should add engine, Maia, and knowledge providers.

## 4.3 Coach Compiler

Expected files:

```txt
lib/blundr/coachCompiler/BlundrCoachCompiler.ts
lib/blundr/coachCompiler/DynamicConceptActivator.ts
lib/blundr/coachCompiler/PedagogicalController.ts
lib/blundr/coachCompiler/teachingConceptRegistry.ts
lib/blundr/coachCompiler/claimBoundTemplateRenderer.ts
lib/blundr/coachCompiler/plainHintCompiler.ts
lib/blundr/coachCompiler/showMoreCompiler.ts
```

Responsibilities:

- select concept,
- verify evidence,
- compile copy,
- compile hint,
- compile Show More,
- compile visual intents,
- attach provenance,
- avoid leaks,
- avoid hallucination.

## 4.4 Safety

Expected files:

```txt
lib/blundr/safety/CoachSafetyGate.ts
lib/blundr/safety/plainLeakDetector.ts
lib/blundr/safety/targetInvariantGuard.ts
lib/blundr/safety/legacyBypassDetector.ts
lib/blundr/safety/claimEvidenceValidator.ts
lib/blundr/safety/surfaceBlockerMatrix.ts
```

Responsibilities:

- block mismatched target,
- block mismatched piece,
- block plain leaks,
- block legacy bypasses,
- block unverified claims,
- block stale frame keys,
- surface critical debug issues.

## 4.5 Presentation

Expected files:

```txt
lib/blundr/presentation/buildVisibleTeachingSurface.ts
lib/blundr/presentation/trainerPresentationFrame.ts
lib/blundr/presentation/visibleActionPolicy.ts
lib/blundr/presentation/visualRecipeCompiler.ts
components/CoachCard.tsx
components/board/VisualRecipeLayer.tsx
components/board/TeachingOverlay.tsx
app/page.tsx
```

Responsibilities:

- UI consumes only `VisibleTeachingSurface`,
- no direct old coach rendering,
- no direct old hint rendering,
- no direct reveal target calculation,
- no direct visual target calculation outside compiled visual recipe.

## 4.6 Debug

Expected files:

```txt
lib/blundr/debug/coachDebugTrace.ts
lib/blundr/debug/debugIssueTypes.ts
lib/blundr/debug/coachTimelineSummary.ts
components/debug/CoachDebugPanel.tsx
```

Responsibilities:

- show target alignment,
- show piece alignment,
- show frame owner,
- show provenance,
- show critical issues,
- show plain leak checks,
- show legacy bypass checks,
- show continuation candidate lock state.

---

# 5. Release Gates

## 5.1 Coach Gate

The Coach Gate is not passed until:

```txt
criticalIssues.length === 0
targetMismatchCount === 0
pieceMismatchCount === 0
plainLeakCount === 0
legacyBypassCount === 0
staleFrameCount === 0
visualMismatchCount === 0
revealMismatchCount === 0
```

This must be true in a real browser test, not just unit tests.

## 5.2 Continuation Gate

The Continuation Gate is not passed until:

1. End of guided line shows Continue from Here.
2. Continue from Here button uses the modern action policy.
3. No legacy continuation buttons remain.
4. Clicking Continue from Here locks exactly one candidate.
5. Candidate target equals coach target.
6. Candidate target equals reveal target.
7. Candidate target equals visual target when visuals are allowed.
8. Plain View does not reveal the candidate.
9. Terminal state is clean.
10. Debug trace shows no critical issues.

## 5.3 2000-Elo Coach Gate

The 2000-Elo Coach Gate is not passed until the coach can safely discuss:

- opening principles,
- move purpose,
- tactical motifs,
- positional themes,
- pawn structures,
- king safety,
- prophylaxis,
- candidate moves,
- plans,
- human-like mistakes,
- short calculation,
- strategic tradeoffs,

without making unverified claims.

This does not require the app to be a grandmaster. It requires it to produce accurate, evidence-bound explanations suitable for a serious club player.

---

# 6. Multi-Agent Roadmap Overview

## Agent Sequence

| Agent | Release Gate | Name | Primary Goal |
|---:|---|---|---|
| 0 | Foundation Stabilization | Baseline and Branch Checkpoint | Create rollback and truth snapshot |
| 1 | Foundation Stabilization | Authority Audit | Map every visible teaching path and legacy bypass |
| 2 | Foundation Stabilization | CurrentInstructionFrame Lock | Make target locking canonical |
| 3 | Foundation Stabilization | Visible Surface Choke Point | Force UI through `buildVisibleTeachingSurface` |
| 4 | Foundation Stabilization | Deterministic Evidence Graph | Build board/move/opening evidence without Stockfish/Maia |
| 5 | Foundation Stabilization | Teaching Concept Registry | Build comprehensive concept taxonomy and templates |
| 6 | Foundation Stabilization | Coach Compiler | Compile hint, assisted copy, Show More, reveal, visuals |
| 7 | Foundation Stabilization | Safety Gate | Enforce claim evidence, target, piece, plain, legacy blockers |
| 8 | Foundation Stabilization | Plain View and Action Policy | Repair Hint, Show More, Reveal, no answer leak |
| 9 | Foundation Stabilization | Visual Alignment | Align arrows/highlights with compiled frame |
| 10 | Foundation Stabilization | Continuation Repair | Repair Continue from Here and continuation candidate lock |
| 11 | Foundation Stabilization | Debug and Browser QA | Prove zero critical issues in live browser flow |
| 12 | Foundation Stabilization | Stabilization and Vercel Preview | Final cleanup and deploy |
| 13 | Advanced Intelligence | Stockfish Evidence Provider | Add engine enrichment behind compiler |
| 14 | Advanced Intelligence | Maia Continuation Provider | Add human-like opponent replies only |
| 15 | Advanced Intelligence | Opening Knowledge Retriever | Add curated explanation retrieval |
| 16 | Advanced Intelligence | 2000-Elo Deep Coach Expansion | Add deeper strategy/tactics/prophylaxis |
| 17 | Advanced Intelligence | Golden Set and Benchmark Harness | Validate sample positions and coaching quality |
| 18 | Advanced Intelligence | Optional Grounded LLM Phrasing | Add style polish without hallucination |

---

# 7. Agent 0 — Baseline and Branch Checkpoint

## Objective

Create a clean rollback point before the coach architecture is touched.

## Scope

No feature changes.

## Required Steps

1. Check git state.

```bash
git status --short
git branch --show-current
git log --oneline -5
```

2. Confirm current package scripts.

```bash
cat package.json
```

3. Run current validation.

```bash
npm run build
npm test
npm run lint
```

4. If tests fail, do not fix unless the failure blocks baseline documentation. Document failures.

5. Create baseline document:

```txt
docs/BLUNDR_v2.8.0 Foundation Stabilization Gate_BASELINE_STABILITY_CONFIRMATION.md
```

6. Include:

- branch name,
- commit hash,
- changed files,
- current known failures,
- current browser symptoms,
- current debug symptoms,
- current continuation symptoms,
- current Plain View symptoms,
- whether Vercel preview is currently deployable.

## Acceptance Criteria

- Baseline report exists.
- Current commit is documented.
- Build/test/lint result is documented.
- No product logic changed.

---

# 8. Agent 1 — Authority Audit

## Objective

Find every path that can produce or render coach output, hints, reveal buttons, action buttons, visual arrows, highlights, continuation buttons, or level selectors.

## Scope

Audit only. No functional changes unless adding comments or temporary debug markers is necessary and documented.

## Files to Inspect

Minimum:

```txt
app/page.tsx
lib/blundr/presentation/*
lib/blundr/runtime/*
lib/blundr/coach*
lib/blundr/brain*
components/CoachCard*
components/board/*
components/debug/*
```

Also search:

```bash
grep -R "orchestrateTeaching" -n .
grep -R "reveal" -n app lib components
grep -R "hint" -n app lib components
grep -R "Show More" -n app lib components
grep -R "Continue from here" -n app lib components
grep -R "VisualRecipe" -n app lib components
grep -R "expectedMovesForValidation" -n app lib components
grep -R "CurrentInstructionFrame" -n app lib components
grep -R "TrainerPresentationFrame" -n app lib components
grep -R "VisibleTeachingSurface" -n app lib components
```

## Required Output

Create:

```txt
docs/BLUNDR_v2.8.0 Foundation Stabilization Gate_AGENT_1_AUTHORITY_AUDIT_REPORT.md
```

Include a table:

| Surface | Current Producer | Current Consumer | Should Remain? | Replacement |
|---|---|---|---|---|

Surfaces to include:

- coach title,
- coach body,
- hint,
- Show More,
- Reveal Move,
- Continue from Here,
- level selector,
- visual arrow,
- source square highlight,
- destination square highlight,
- pressure line,
- attack/defense/plan toggles,
- Plain View UI,
- Assisted View UI,
- terminal surface,
- debug panel.

## Acceptance Criteria

The report must identify:

1. All legacy direct-rendered surfaces.
2. All target calculators.
3. All reveal target calculators.
4. All visual target calculators.
5. All continuation candidate calculators.
6. Any old buttons that must be removed.
7. Any components consuming stale `expectedMovesForValidation`.
8. Any coach copy path not connected to `CurrentInstructionFrame`.

---

# 9. Agent 2 — CurrentInstructionFrame Lock

## Objective

Make the locked instruction frame the only canonical runtime source of target truth.

## Required Implementation

### 9.1 Create or Enhance

```txt
lib/blundr/runtime/currentInstructionFrame.ts
lib/blundr/runtime/instructionFrameLock.ts
lib/blundr/runtime/currentInstructionTarget.ts
```

### 9.2 Required Exports

```ts
export function buildCurrentInstructionFrame(input: BuildCurrentInstructionFrameInput): CurrentInstructionFrame;

export function isUserTurnTeachingFrame(frame: CurrentInstructionFrame): boolean;

export function isGuidedTeachingFrame(frame: CurrentInstructionFrame): boolean;

export function isContinuationTeachingFrame(frame: CurrentInstructionFrame): boolean;

export function getInstructionTargetOrNull(frame: CurrentInstructionFrame): CurrentInstructionTarget | null;

export function assertLockedInstructionTarget(frame: CurrentInstructionFrame): CurrentInstructionTarget;

export function getFrameTargetSignature(frame: CurrentInstructionFrame): string;
```

### 9.3 Required Behavior

For guided user turns:

- target comes from opening tree or expected move resolver,
- target is locked,
- piece type is derived from board truth at `from`,
- legality is validated against current position,
- SAN is generated from legal move application if available,
- frame key includes FEN, ply, target, mode, source.

For continuation user turns:

- target comes from continuation policy candidate,
- candidate must be locked before rendering,
- if no candidate exists, surface must be terminal or blocked,
- Maia must not set target in v2.8.0 Foundation Stabilization Gate.

For opponent turns:

- `target = null`,
- coach must not show user move hint,
- visual target must not show user target,
- frame kind should be `opponent_replying` or `transitioning`.

For terminal:

- `target = null`,
- visible surface owner should be terminal surface.

### 9.4 Critical Debug Issues

Add issue types:

```ts
"missing_instruction_target"
"illegal_instruction_target"
"target_piece_missing"
"stale_instruction_frame"
"target_source_ambiguous"
"continuation_candidate_unlocked"
"opponent_turn_has_user_target"
"terminal_frame_has_target"
```

## Acceptance Criteria

- Unit tests for guided frame.
- Unit tests for continuation frame.
- Unit tests for opponent frame.
- Unit tests for terminal frame.
- Runtime frame never silently returns an invalid target.

---

# 10. Agent 3 — Visible Surface Choke Point

## Objective

Make `buildVisibleTeachingSurface.ts` the unbreakable rendering contract.

## Required Implementation

### 10.1 Enhance or Create

```txt
lib/blundr/presentation/buildVisibleTeachingSurface.ts
lib/blundr/presentation/trainerPresentationFrame.ts
lib/blundr/presentation/visibleActionPolicy.ts
```

### 10.2 Required Inputs

```ts
export interface BuildVisibleTeachingSurfaceInput {
  frame: CurrentInstructionFrame;
  compiledCoachFrame: CompiledCoachFrame | null;
  displayMode: "assisted" | "plain";
  debugEnabled: boolean;
}
```

### 10.3 Required Outputs

`VisibleTeachingSurface`, as defined earlier.

### 10.4 Behavior

If frame has no target:

- terminal/opponent/blocked surfaces only,
- no reveal target,
- no hint target,
- no visual target.

If frame has target and compiled frame is valid:

- all visible surfaces consume compiled frame,
- action policy derives from compiled frame,
- visuals derive from compiled frame.

If compiled frame is invalid:

- safe fallback only,
- no target-specific hallucinated copy,
- debug critical issue.

## Acceptance Criteria

- UI can render from `VisibleTeachingSurface`.
- No UI component needs raw coach output.
- No UI component needs raw target except debug.
- Unit tests prove blocked/fallback behavior.

---

# 11. Agent 4 — Deterministic Evidence Graph

## Objective

Build the first EvidenceGraph without Stockfish, Maia, embeddings, or LLM.

The purpose is to let the coach make safe, simple, accurate chess claims.

## Required Files

```txt
lib/blundr/brain/buildEvidenceGraph.ts
lib/blundr/brain/types.ts
lib/blundr/brain/providers/boardTruthProvider.ts
lib/blundr/brain/providers/moveSemanticsProvider.ts
lib/blundr/brain/providers/tacticalMotifProvider.ts
lib/blundr/brain/providers/strategicFeatureProvider.ts
lib/blundr/brain/providers/openingContextProvider.ts
lib/blundr/brain/providers/visualEvidenceProvider.ts
```

## Required Evidence Categories

### 11.1 Board Truth

Must include:

- FEN before target,
- side to move,
- legal moves,
- target legal status,
- piece on source square,
- destination occupancy,
- capture status,
- check status,
- checkmate status,
- castling status,
- promotion status,
- en passant status,
- attacked squares before,
- attacked squares after,
- king squares,
- pinned pieces if detectable,
- loose/undefended pieces if detectable.

### 11.2 Move Semantics

Must classify:

- development move,
- central move,
- capture,
- recapture,
- check,
- checkmate,
- castle,
- pawn break,
- pawn push,
- piece activation,
- queen development,
- rook activation,
- knight development,
- bishop development,
- defensive move,
- tempo move,
- forcing move,
- quiet improving move,
- prophylactic move if evidence exists,
- preparatory move if opening context supports it.

### 11.3 Tactical Motifs

v2.8.0 deterministic support should attempt:

- fork,
- pin,
- skewer,
- discovered attack,
- discovered check,
- double attack,
- attack on loose piece,
- removing defender,
- simple mate threat,
- back-rank pressure,
- trapped piece warning,
- overloaded defender if detectable.

If uncertain, mark as probable or blocked. Do not overclaim.

### 11.4 Strategic Features

Must attempt:

- center control,
- development lead,
- king safety,
- castling readiness,
- open file,
- semi-open file,
- weak square,
- outpost square,
- pawn structure change,
- pawn break,
- space gain,
- piece coordination,
- pressure on f7/f2,
- pressure on center,
- rook activity,
- bishop diagonal,
- knight outpost,
- queen activity,
- trade invitation,
- simplification,
- initiative,
- prophylaxis.

### 11.5 Opening Context

Must include:

- opening name if known,
- line name if known,
- move number,
- expected move reason if known,
- theme tags,
- previous concepts,
- branch complete status,
- end-of-book status,
- continuation eligibility.

## Required Output Example

```ts
const graph = buildEvidenceGraph({ frame, position, openingContext });

graph.claims = [
  {
    id: "claim_development_Bf1c4",
    type: "development",
    strength: "verified",
    targetUci: "f1c4",
    pieceType: "bishop",
    textSafeSummary: "The bishop develops from its starting square to an active diagonal.",
    provenance: [{ source: "board_truth" }]
  }
];
```

## Acceptance Criteria

- EvidenceGraph can be built for every legal target.
- Illegal target blocks.
- Claims are machine-readable.
- No freeform visible coach text lives in EvidenceGraph.
- Tests cover Italian Game examples including `Bc4`.
- Tests cover at least one knight development, castle, pawn break, capture, and check.

---

# 12. Agent 5 — Teaching Concept Registry

## Objective

Create the comprehensive concept system that lets Blundr coach at club-player depth without hallucinating.

## Required Files

```txt
lib/blundr/coachCompiler/teachingConceptRegistry.ts
lib/blundr/coachCompiler/TeachingConcept.ts
lib/blundr/coachCompiler/DynamicConceptActivator.ts
```

## Required Concept Interface

```ts
export interface TeachingConcept {
  id: string;
  label: string;
  family: TeachingConceptFamily;
  eloBand: "beginner" | "intermediate" | "club" | "advanced_club";
  requiredEvidence: CoachEvidenceClaimType[];
  optionalEvidence: CoachEvidenceClaimType[];
  forbiddenWithoutEvidence: string[];
  hintTemplate: ClaimBoundTemplate;
  assistedTemplate: ClaimBoundTemplate;
  showMoreTemplate: ClaimBoundTemplate;
  visualIntents: VisualIntentType[];
  safetyRules: SafetyRule[];
}
```

## Required Families

```ts
export type TeachingConceptFamily =
  | "development"
  | "center"
  | "king_safety"
  | "tactics"
  | "pawn_structure"
  | "piece_activity"
  | "initiative"
  | "prophylaxis"
  | "opening_theory"
  | "calculation"
  | "endgame_transition"
  | "human_mistake"
  | "defense"
  | "attack"
  | "conversion";
```

## Required Concepts for v2.8.0 Foundation Stabilization Gate

### Opening and Development

1. `develop_minor_piece`
2. `develop_with_tempo`
3. `develop_to_active_diagonal`
4. `develop_to_center_control`
5. `avoid_premature_queen`
6. `connect_rooks`
7. `improve_worst_piece`
8. `complete_kingside_development`
9. `complete_queenside_development`

### Center

10. `occupy_center`
11. `control_center`
12. `challenge_center`
13. `prepare_pawn_break`
14. `execute_pawn_break`
15. `support_center`
16. `undermine_center`

### King Safety

17. `castle_king`
18. `prepare_castling`
19. `open_escape_square`
20. `reduce_king_danger`
21. `attack_castled_king`
22. `avoid_king_exposure`

### Piece Activity

23. `activate_bishop_diagonal`
24. `activate_knight_outpost`
25. `activate_rook_file`
26. `queen_activity_safe`
27. `improve_piece_coordination`
28. `increase_pressure`
29. `defend_key_piece`
30. `protect_loose_piece`

### Tactics

31. `fork`
32. `pin`
33. `skewer`
34. `discovered_attack`
35. `discovered_check`
36. `double_attack`
37. `remove_defender`
38. `deflection`
39. `decoy`
40. `clearance`
41. `interference`
42. `overload`
43. `zwischenzug`
44. `attack_loose_piece`
45. `win_loose_piece`
46. `back_rank_pressure`
47. `mate_threat`
48. `forced_mate`
49. `trapped_piece`
50. `desperado`

### Pawn Structure

51. `create_passed_pawn`
52. `support_passed_pawn`
53. `blockade_passed_pawn`
54. `minority_attack`
55. `isolated_queen_pawn`
56. `hanging_pawns`
57. `backward_pawn`
58. `doubled_pawns`
59. `weak_square`
60. `color_complex`
61. `space_gain`
62. `fix_pawn_weakness`

### Strategy and Planning

63. `play_for_initiative`
64. `trade_when_ahead`
65. `avoid_bad_trade`
66. `simplify_to_endgame`
67. `keep_tension`
68. `release_tension`
69. `prophylaxis`
70. `restrict_opponent_piece`
71. `create_second_weakness`
72. `switch_sides`
73. `improve_king_in_endgame`
74. `centralize_piece`
75. `convert_advantage`

### Human-Like Mistakes and Continuation

76. `punish_human_inaccuracy`
77. `avoid_common_trap`
78. `respond_to_deviation`
79. `stay_in_repertoire`
80. `transition_out_of_book`
81. `choose_practical_move`
82. `handle_unclear_position`

## Dynamic Concept Activator

The activator must:

1. Score concepts from evidence.
2. Prefer verified claims over probable claims.
3. Prefer opening-context concepts during guided opening phase.
4. Prefer tactical concepts when tactics are verified.
5. Prefer Plain View-safe concepts when in Plain View.
6. Avoid overclaiming.
7. Return primary concept and secondary concepts.
8. Explain why a concept was selected in debug.

Suggested scoring:

```ts
score =
  verifiedRequiredEvidence * 10
  + verifiedOptionalEvidence * 3
  + openingThemeMatch * 5
  + targetPieceSpecificity * 2
  + visualSupport * 2
  - missingRequiredEvidence * 100
  - plainLeakRisk * 100
  - forbiddenClaimRisk * 100;
```

## Acceptance Criteria

- At least 80 concept IDs exist.
- Every concept has required evidence.
- Every concept has hint, assisted, and Show More templates.
- Tests prove that `win_loose_piece` is not selected when the move only attacks a loose piece.
- Tests prove that `attack_loose_piece` is selected for pressure without capture/win evidence.
- Tests prove bishop/knight/pawn concepts do not cross-label the piece.

---

# 13. Agent 6 — BlundrCoachCompiler

## Objective

Build the deterministic coach compiler that turns evidence and concepts into visible teaching.

## Required Files

```txt
lib/blundr/coachCompiler/BlundrCoachCompiler.ts
lib/blundr/coachCompiler/claimBoundTemplateRenderer.ts
lib/blundr/coachCompiler/plainHintCompiler.ts
lib/blundr/coachCompiler/showMoreCompiler.ts
```

## Required Compiler Flow

```txt
CurrentInstructionFrame
  → EvidenceGraph
  → DynamicConceptActivator
  → PedagogicalController
  → claim-bound templates
  → CompiledCoachFrame
```

## Required Compiler Function

```ts
export function compileCoachFrame(input: {
  frame: CurrentInstructionFrame;
  evidenceGraph: EvidenceGraph;
  displayMode: "assisted" | "plain";
  userEloTarget?: number;
}): CompiledCoachFrame;
```

## Required Copy Rules

### Assisted Title

Should be concise:

- "Develop with pressure"
- "Castle before the center opens"
- "Challenge the center"
- "Increase pressure on f7"
- "Prepare the pawn break"
- "Improve your worst piece"

### Assisted Body

Should explain:

1. What the move does.
2. Why it matters.
3. What idea it supports.
4. What to watch next.

Example:

```txt
Bc4 develops the bishop to an active diagonal and increases pressure toward f7, one of Black's most sensitive early-game squares. It also prepares White to castle quickly while keeping pressure on the center.
```

This sentence is allowed only if evidence proves:

- target SAN is Bc4,
- target piece is bishop,
- bishop develops,
- diagonal pressure toward f7 exists,
- castling preparation or king safety context exists.

### Plain Hint

Must be non-leaking.

Allowed:

```txt
Look for the developing move that increases pressure on Black's most sensitive kingside square.
```

Not allowed:

```txt
Move the bishop to c4.
```

Not allowed if bishop identity leaks the only legal answer:

```txt
Use your bishop.
```

### Show More

Should reveal richer teaching content but still avoid false claims.

Example:

```txt
The idea is to develop with purpose. A quiet developing move is strongest when it also creates a threat or pressure point. Here the move improves a minor piece, aims at a sensitive square near the king, and keeps castling available.
```

## Required Safety Integration

The compiler must run pre-safety checks but the final safety decision belongs to `CoachSafetyGate`.

## Acceptance Criteria

- Produces valid `CompiledCoachFrame` for normal guided targets.
- Produces safe fallback for missing evidence.
- No template variable may render as undefined/null.
- No coach text references a piece type that differs from target piece type.
- No claim appears without evidence ID.
- Plain hint passes leak detector.

---

# 14. Agent 7 — Coach Safety Gate

## Objective

Hard-block unsafe, mismatched, hallucinated, stale, or leaking teaching output.

## Required Files

```txt
lib/blundr/safety/CoachSafetyGate.ts
lib/blundr/safety/plainLeakDetector.ts
lib/blundr/safety/targetInvariantGuard.ts
lib/blundr/safety/legacyBypassDetector.ts
lib/blundr/safety/claimEvidenceValidator.ts
lib/blundr/safety/surfaceBlockerMatrix.ts
```

## Required Gate Function

```ts
export function runCoachSafetyGate(input: {
  frame: CurrentInstructionFrame;
  evidenceGraph: EvidenceGraph | null;
  compiled: CompiledCoachFrame | null;
  surfaceCandidate?: VisibleTeachingSurface;
  displayMode: "assisted" | "plain";
}): CoachSafetyResult;
```

## Required Blockers

### Target Blockers

- compiled target missing,
- compiled target differs from instruction target,
- visual target differs from instruction target,
- reveal target differs from instruction target,
- stale frame key,
- illegal target,
- target piece missing.

### Piece Blockers

- coach text says bishop when target piece is knight,
- coach text says knight when target piece is bishop,
- coach text says castle when target is not castling,
- coach text says pawn break when target is not a pawn move or verified preparatory move,
- coach text says capture when target is not capture,
- coach text says checkmate when target is not mate.

### Claim Blockers

- claim appears with no evidence,
- verified language used for probable evidence,
- "wins material" without material/eval/tactical evidence,
- "forced" without forcing evidence,
- "mate" without mate evidence,
- "only move" without engine/repertoire proof.

### Plain View Blockers

- includes target SAN,
- includes target UCI,
- includes from square,
- includes to square,
- includes exact move phrase,
- visual reveals source/destination,
- Show More automatically expanded,
- hint names a unique piece in a way that gives away the answer.

### Legacy Blockers

- old coach renderer active,
- old hint renderer active,
- old reveal path active,
- old visual target path active,
- old continuation button path active,
- old level selector buttons visible when new collapsed selector should own the UI.

## Required Debug Issue Types

```ts
"type_target_mismatch"
"type_piece_mismatch"
"type_reveal_mismatch"
"type_visual_mismatch"
"type_plain_leak"
"type_claim_without_evidence"
"type_legacy_bypass"
"type_stale_frame"
"type_illegal_target"
"type_unsafe_copy"
```

## Acceptance Criteria

- Tests intentionally create mismatch and confirm block.
- Tests intentionally create Plain View leak and confirm block.
- Tests intentionally create unverified "wins material" and confirm block.
- Tests intentionally create bishop/knight mismatch and confirm block.
- Debug panel receives exact blocker reasons.

---

# 15. Agent 8 — Plain View and Action Policy

## Objective

Repair Plain View so it becomes true recall mode.

## Required Files

```txt
lib/blundr/presentation/visibleActionPolicy.ts
lib/blundr/coachCompiler/plainHintCompiler.ts
components/CoachCard.tsx
app/page.tsx
```

## Required Plain View UI

Plain View should show:

1. A single hint.
2. A Show More button.
3. A Reveal Move button if reveal is allowed.
4. No direct answer.
5. No visual arrow to the answer.
6. No target square highlight.
7. No legacy buttons.

## Hint Progression

For MVP, start with one high-quality hint. The architecture may allow progressive hints later.

Suggested future progressive levels:

1. Concept hint.
2. Plan hint.
3. Piece-family hint.
4. Reveal move.

For v2.8.0 Foundation Stabilization Gate, implement only:

```txt
Hint → Show More → Reveal Move
```

## Show More Behavior

Show More should display the full assisted teaching content, but still not execute the move.

## Reveal Move Behavior

Reveal Move should reveal only the locked target.

## Acceptance Criteria

- Plain View does not leak answer.
- Show More reveals explanation, not stale old content.
- Reveal Move target equals instruction target.
- Old Hint/Plan/Analyze buttons are removed or quarantined.
- No old level selection button cluster remains if collapsed selector owns it.

---

# 16. Agent 9 — Visual Alignment

## Objective

Ensure every arrow/highlight/visual cue consumes the compiled target and verified visual intents.

## Required Files

```txt
lib/blundr/presentation/visualRecipeCompiler.ts
components/board/VisualRecipeLayer.tsx
components/board/TeachingOverlay.tsx
lib/blundr/brain/providers/visualEvidenceProvider.ts
```

## Required Visual Contract

A `VisualIntent` must include:

```ts
export interface VisualIntent {
  id: string;
  frameKey: string;
  targetUci: string;
  type:
    | "move_arrow"
    | "source_highlight"
    | "destination_highlight"
    | "pressure_arrow"
    | "weak_square_highlight"
    | "king_safety_zone"
    | "file_control"
    | "diagonal_control"
    | "future_plan_ghost";
  from?: Square;
  to?: Square;
  squares?: Square[];
  evidenceClaimIds: string[];
  displayModes: ("assisted" | "plain")[];
  leakRisk: "none" | "low" | "high";
}
```

## Visual Rules

Assisted View may show:

- target move arrow,
- source/destination highlights,
- pressure lines,
- ghost plan arrows,
- weak square highlights.

Plain View may show only:

- non-answer-leaking general conceptual visuals,
- no source/destination target move arrow,
- no exact target square highlight,
- no target piece glow if it gives away the answer.

## Acceptance Criteria

- Visual target equals instruction target when target visual is shown.
- Pressure arrows require evidence.
- Ghost plan arrows require opening/plan context.
- Plain View target arrow is blocked.
- Debug reports visual recipe provenance.

---

# 17. Agent 10 — Continuation Repair

## Objective

Repair the end-of-book and continuation path while preserving the single-authority target contract.

## Required Files

```txt
lib/blundr/runtime/continuationRuntimeState.ts
lib/blundr/runtime/currentInstructionFrame.ts
lib/blundr/presentation/visibleActionPolicy.ts
app/page.tsx
```

## Required Flow

```txt
Guided line active
  → selectedLineComplete / curatedCompleteHere
  → lichessTotalGames / lichessEndHere
  → hardEndOfBookGate
  → Continue from Here surface
  → user clicks Continue from Here
  → continuationPolicyCandidate is computed
  → candidate is locked into CurrentInstructionFrame.target
  → compiler builds candidate teaching
  → surface renders candidate
```

## Required Ordering in `app/page.tsx`

Maintain this ordering or equivalent:

1. Raw upstream state.
2. `expectedMoveResolution`.
3. `expectedMovesForValidation`.
4. `selectedLineComplete` / `curatedCompleteHere`.
5. `lichessTotalGames` / `lichessEndHere`.
6. `hardEndOfBookGate`.
7. `continuationPolicyCandidate`.
8. `CurrentInstructionFrame`.
9. `CompiledCoachFrame`.
10. `VisibleTeachingSurface`.
11. UI render.

## Required Fixes

- Do not reference variables before initialization.
- Do not compute continuation target from stale expected moves.
- Do not let continuation candidate bypass compiler.
- Do not let end-of-book gate suppress the Continue button.
- Do not show legacy continuation buttons.
- Do not show target answer in Plain View during continuation.

## Acceptance Criteria

- Continue from Here appears at end of line.
- Button click produces one candidate.
- Candidate is legal.
- Candidate locks into frame.
- Candidate compiles into coach frame.
- Candidate visual/reveal/hint align.
- No runtime ReferenceError.
- No legacy buttons remain.

---

# 18. Agent 11 — Debug and Browser QA

## Objective

Make debug proof strong enough that we can trust the coach.

## Required Files

```txt
components/debug/CoachDebugPanel.tsx
lib/blundr/debug/coachTimelineSummary.ts
lib/blundr/debug/debugIssueTypes.ts
```

## Debug Panel Must Show

For current frame:

- frame key,
- frame kind,
- mode,
- FEN before,
- target UCI,
- target SAN,
- target piece type,
- coach target UCI,
- reveal target UCI,
- visual target UCI,
- piece type in coach copy,
- primary concept,
- evidence claim IDs,
- safety result,
- blocked reasons,
- plain leak status,
- legacy bypass status,
- continuation candidate lock status,
- visual recipe provenance.

For timeline:

- target mismatch count,
- piece mismatch count,
- visual mismatch count,
- reveal mismatch count,
- plain leak count,
- legacy bypass count,
- stale frame count,
- critical issue count.

## Browser QA Script

Manual or automated test should cover:

1. Load fresh app.
2. Enable `?debug=1`.
3. Start a guided line.
4. In Assisted View:
   - confirm coach target equals arrow target,
   - confirm reveal target equals target,
   - confirm piece text matches piece.
5. Switch to Plain View:
   - confirm no answer leak,
   - confirm hint exists,
   - confirm Show More exists,
   - confirm Reveal Move exists if policy allows.
6. Play correct move.
7. Observe opponent transition:
   - no user target,
   - no stale hint.
8. Continue until end-of-book.
9. Confirm Continue from Here appears.
10. Click Continue from Here.
11. Confirm continuation candidate locks.
12. Confirm candidate coach/visual/reveal alignment.
13. Continue to terminal.
14. Confirm debug summary shows zero critical issues.

## Acceptance Criteria

- Browser QA report created.
- Screenshots or copied debug output included.
- Any critical issue blocks release.

---

# 19. Agent 12 — Stabilization and Vercel Preview

## Objective

Clean, build, deploy preview.

## Required Steps

1. Remove dead imports.
2. Remove or quarantine legacy UI.
3. Confirm no console spam.
4. Confirm no runtime warnings.
5. Run:

```bash
npm run build
npm test
npm run lint
```

6. Commit.

```bash
git status --short
git add .
git commit -m "Finalize v2.8.0 deterministic coach architecture"
```

7. Deploy preview.

## Acceptance Criteria

- Vercel preview builds.
- Fresh-session browser QA passes.
- Agent reports complete.
- Coach Gate passes.
- Continuation Gate passes.

---

# 20. v2.8.0 Advanced Intelligence Gate Agent 13 — Stockfish Evidence Provider

## Objective

Add Stockfish as evidence enrichment behind the locked compiler.

## Required Files

```txt
lib/blundr/brain/providers/engineProvider.ts
lib/blundr/engine/stockfishService.ts
lib/blundr/engine/stockfishWorkerClient.ts
```

## Required Behavior

Stockfish may provide:

- evaluation before target,
- evaluation after target,
- target PV,
- top alternatives,
- tactical motif signals,
- blunder severity,
- best move agreement.

Stockfish must not:

- directly render UI,
- directly choose visible target in guided mode,
- bypass compiler,
- overwrite locked frame target,
- produce visible copy.

## Required Engine Output

```ts
export interface EngineAnalysis {
  provider: "stockfish";
  depth: number;
  multipv: PVLine[];
  targetLine?: PVLine;
  alternatives: PVLine[];
  evalBefore?: Evaluation;
  evalAfterTarget?: Evaluation;
  agreement:
    | "target_is_best"
    | "target_is_good"
    | "target_is_repertoire_choice"
    | "target_is_questionable"
    | "unknown";
  provenance: EvidenceProvenance[];
}
```

## Acceptance Criteria

- Engine unavailable does not break coach.
- Engine result attaches evidence only.
- UI still consumes compiled surface.
- Tests mock engine output.
- Debug shows engine provenance.

---

# 21. v2.8.0 Advanced Intelligence Gate Agent 14 — Maia Continuation Provider

## Objective

Add Maia as a human-like opponent in continuation only.

## Required Files

```txt
lib/blundr/maia/maiaService.ts
lib/blundr/maia/maiaWorkerClient.ts
lib/blundr/brain/providers/maiaProvider.ts
lib/blundr/runtime/continuationRuntimeState.ts
```

## Required Behavior

Maia may:

- suggest opponent reply,
- give confidence,
- indicate human-likely move,
- provide deviation score,
- support continuation realism.

Maia must not:

- own instruction targets,
- own hint text,
- own coach text,
- own reveal target,
- own visual target,
- overwrite guided opening truth.

## Maia Output

```ts
export interface MaiaContinuationContext {
  provider: "maia";
  ratingLevel: number;
  fen: string;
  predictedOpponentMove?: {
    uci: string;
    san?: string;
    confidence: number;
  };
  deviationScore?: number;
  humanLikelyMistake?: string;
  provenance: EvidenceProvenance[];
}
```

## Acceptance Criteria

- If Maia fails, continuation still works.
- Maia only appears in continuation context.
- Debug proves Maia did not own instruction target.
- Tests verify Maia target cannot bypass frame lock.

---

# 22. v2.8.0 Advanced Intelligence Gate Agent 15 — Opening Knowledge Retriever

## Objective

Add curated opening knowledge without hallucination.

## Required Files

```txt
lib/blundr/knowledge/OpeningKnowledgeRetriever.ts
lib/blundr/knowledge/openingKnowledgeTypes.ts
data/openingKnowledge/index.json
data/openingKnowledge/<opening>.json
```

## Required Knowledge Item Shape

```ts
export interface OpeningKnowledgeItem {
  id: string;
  openingKey: string;
  lineKey?: string;
  fen?: string;
  moves?: string[];
  conceptTags: TeachingConceptId[];
  summary: string;
  plansForWhite?: string[];
  plansForBlack?: string[];
  commonMistakes?: string[];
  tacticalMotifs?: string[];
  strategicThemes?: string[];
  provenance: {
    sourceType: "curated_note" | "engine_checked_line" | "master_game" | "opening_book";
    sourceLabel: string;
    confidence: "high" | "medium" | "low";
  }[];
}
```

## Retrieval Rules

The retriever must:

1. Match opening key.
2. Match current move sequence or FEN when possible.
3. Match concept tags.
4. Re-rank by evidence graph relevance.
5. Return provenance.
6. Avoid visible claims unless attached to evidence or marked as opening-plan context.

## Acceptance Criteria

- Retrieval optional.
- No retrieval item directly renders UI.
- Compiler must attach knowledge provenance.
- Stale/low-confidence knowledge cannot create strong tactical claims.

---

# 23. v2.8.0 Advanced Intelligence Gate Agent 16 — 2000-Elo Deep Coach Expansion

## Objective

Expand the coach from simple accurate explanation to serious club-player instruction.

## Required Capabilities

The coach should be able to explain:

1. Candidate move comparison.
2. Tactical reason.
3. Strategic reason.
4. Opening-theory reason.
5. Human-practical reason.
6. Main plan.
7. Opponent resource.
8. What would be wrong with a tempting alternative.
9. How the move changes the position.
10. What to look for next.

## Required Disclosure Levels

```ts
export type DisclosureLevel =
  | "plain_hint"
  | "assisted_summary"
  | "show_more"
  | "advanced_details"
  | "debug_evidence";
```

For the MVP UI:

- Plain View uses `plain_hint`.
- Assisted View uses `assisted_summary`.
- Show More uses `show_more`.

Advanced details can remain hidden behind debug or future UI.

## Acceptance Criteria

- 50 curated positions reviewed.
- Tactical claims are accurate.
- Strategic claims are not overconfident.
- Coach can say "I can only verify..." in fallback mode.
- No hallucinated line names.
- No hallucinated tactic names.

---

# 24. v2.8.0 Advanced Intelligence Gate Agent 17 — Golden Set and Benchmark Harness

## Objective

Create a permanent test harness to prevent regression.

## Required Files

```txt
tests/coach/goldenPositions.test.ts
tests/coach/plainLeak.test.ts
tests/coach/targetInvariant.test.ts
tests/coach/conceptSelection.test.ts
tests/coach/continuationFlow.test.ts
data/goldenCoachPositions.json
```

## Golden Position Categories

At minimum:

### Opening

- Italian Game `Bc4`.
- Ruy Lopez `Bb5`.
- Queen's Gambit `c4`.
- Sicilian development move.
- French center break.
- Caro-Kann development.
- King's Indian setup.
- London System development.
- English Opening pressure.
- Scandinavian queen tempo.

### Tactics

- fork,
- pin,
- skewer,
- discovered attack,
- double attack,
- overloaded defender,
- removing defender,
- back rank pressure,
- mate threat,
- loose piece attack.

### Strategy

- castle,
- connect rooks,
- open file,
- outpost,
- weak square,
- pawn break,
- minority attack,
- isolated queen pawn,
- bishop pair,
- bad bishop improvement.

### Continuation

- end of book,
- human-like opponent reply,
- deviation from repertoire,
- candidate lock,
- terminal state.

## Required Golden Item Shape

```json
{
  "id": "italian_bishop_c4_basic",
  "fen": "...",
  "targetUci": "f1c4",
  "expectedPiece": "bishop",
  "mustIncludeConcepts": ["develop_to_active_diagonal"],
  "mustNotIncludeTerms": ["knight", "wins material", "checkmate"],
  "plainMustNotInclude": ["Bc4", "f1", "c4", "bishop"],
  "visualTargetMustEqual": "f1c4"
}
```

## Acceptance Criteria

- Golden tests fail if piece mismatch returns.
- Golden tests fail if Plain View leaks.
- Golden tests fail if visual/reveal target differs.
- Golden tests fail if unverified tactic language appears.

---

# 25. v2.8.0 Advanced Intelligence Gate Agent 18 — Optional Grounded LLM Phrasing

## Objective

Add style polish only after deterministic safety is proven.

## Rule

The LLM must never decide truth.

The LLM may only rewrite a pre-approved `CompiledCoachFrame` into nicer language while preserving claim IDs.

## Required Input

```ts
export interface GroundedPhrasingInput {
  targetUci: string;
  approvedClaims: CoachEvidenceClaim[];
  allowedTerms: string[];
  forbiddenTerms: string[];
  draftPlainHint: string;
  draftAssisted: string;
  draftShowMore: string;
}
```

## Required Output

```ts
export interface GroundedPhrasingOutput {
  plainHint: string;
  assisted: string;
  showMore: string;
  usedClaimIds: string[];
  introducedUnsupportedClaim: boolean;
}
```

## Acceptance Criteria

- LLM output re-runs through safety gate.
- Unsupported new claim blocks output.
- Deterministic draft remains fallback.
- App works without LLM.

---

# 26. Comprehensive Chess Knowledge Taxonomy for 2000-Elo Coach

This section defines the chess language Blundr should eventually understand. The coach does not need to teach all of this on day one, but the architecture must support it.

## 26.1 Core Opening Principles

- development,
- rapid development,
- developing with tempo,
- developing toward the center,
- avoiding premature queen moves,
- controlling the center,
- occupying the center,
- challenging the center,
- supporting the center,
- castling,
- preparing castling,
- connecting rooks,
- avoiding unnecessary pawn moves,
- avoiding repeated piece moves,
- improving worst piece,
- opening lines for rooks and bishops,
- safe king placement,
- piece coordination,
- maintaining flexibility,
- transposition awareness,
- move-order nuance.

## 26.2 Center Concepts

- classical center,
- hypermodern center,
- pawn center,
- piece control of center,
- central tension,
- releasing tension,
- keeping tension,
- central break,
- undermining the center,
- overextended center,
- isolated queen pawn center,
- hanging pawn center,
- locked center,
- mobile center,
- closed center,
- open center,
- flank attack justified by closed center,
- central counterplay against wing attack.

## 26.3 Development Concepts

- minor piece development,
- knight before bishop heuristic,
- bishop diagonal activation,
- knight outpost development,
- developing with threat,
- developing with defense,
- developing to natural square,
- developing to flexible square,
- redeployment,
- piece coordination,
- rook development,
- queen development safety,
- lost tempi,
- tempo gain,
- tempo loss.

## 26.4 King Safety Concepts

- castling kingside,
- castling queenside,
- delaying castling,
- opposite-side castling,
- open king,
- exposed king,
- king in center,
- pawn shield,
- pawn storm,
- luft,
- back rank weakness,
- weak dark squares near king,
- weak light squares near king,
- open files near king,
- diagonal pressure toward king,
- Greek gift preconditions,
- sacrifice on h7/h2,
- rook lift,
- defensive resources,
- trading attackers,
- returning material for safety.

## 26.5 Piece Activity

### Knights

- outpost,
- centralization,
- rim knight,
- fork square,
- blockade,
- rerouting,
- defensive knight,
- attacking knight,
- knight versus bishop,
- knight on advanced support point.

### Bishops

- long diagonal,
- open diagonal,
- blocked bishop,
- bad bishop,
- good bishop,
- bishop pair,
- fianchetto bishop,
- opposite-color bishops,
- bishop sacrifice,
- bishop skewer,
- bishop pin,
- diagonal battery.

### Rooks

- open file,
- semi-open file,
- seventh rank,
- rook lift,
- doubled rooks,
- rook behind passed pawn,
- active rook,
- passive rook,
- rook invasion,
- back-rank pressure.

### Queen

- queen activity,
- queen safety,
- premature queen development,
- queen battery,
- queen infiltration,
- queen trade,
- queen overload,
- queen as defender,
- queen as attacker.

### King

- king safety in opening/middlegame,
- king centralization in endgame,
- opposition,
- triangulation,
- king activity,
- shouldering,
- shelter.

## 26.6 Pawn Structure

- isolated pawn,
- isolated queen pawn,
- doubled pawns,
- backward pawn,
- hanging pawns,
- passed pawn,
- protected passed pawn,
- outside passed pawn,
- connected passed pawns,
- pawn majority,
- queenside majority,
- kingside majority,
- minority attack,
- pawn chain,
- pawn base,
- pawn lever,
- pawn break,
- pawn storm,
- fixed pawn,
- weak pawn,
- weak square,
- hole,
- outpost,
- color complex,
- space advantage,
- cramping,
- pawn islands,
- open file created by pawn exchange,
- blockade,
- breakthrough,
- promotion race.

## 26.7 Tactical Motifs

The registry and evidence system should eventually support all of these.

### Direct Attacks

- attack,
- threat,
- capture,
- recapture,
- check,
- double check,
- discovered check,
- mate threat,
- forced mate,
- perpetual check.

### Forks

- knight fork,
- pawn fork,
- bishop fork,
- rook fork,
- queen fork,
- king fork,
- royal fork,
- family fork.

### Pins

- absolute pin,
- relative pin,
- cross-pin,
- pin against king,
- pin against queen,
- pin exploitation,
- breaking a pin,
- piling on a pinned piece.

### Skewers

- king skewer,
- queen skewer,
- rook skewer,
- diagonal skewer,
- file/rank skewer.

### Discovered Motifs

- discovered attack,
- discovered check,
- double discovered attack,
- discovered attack with tempo,
- opening a line,
- masking/unmasking attack.

### Double Motifs

- double attack,
- double threat,
- fork plus attack,
- check plus attack,
- mate plus material threat.

### Defender Motifs

- removing the defender,
- deflection,
- decoy,
- attraction,
- overloading,
- undermining,
- interference,
- blocking a defender,
- luring a defender away.

### Line Motifs

- clearance,
- line opening,
- line closing,
- interference,
- x-ray attack,
- battery,
- discovered line,
- back-rank line.

### Timing Motifs

- zwischenzug,
- intermediate check,
- intermediate capture,
- in-between move,
- desperado,
- tempo tactic,
- forcing sequence.

### Mate Patterns

- back-rank mate,
- smothered mate,
- Anastasia's mate,
- Arabian mate,
- Boden's mate,
- Legal's mate,
- Lolli mate,
- Greco mate,
- Damiano mate,
- hook mate,
- corridor mate,
- dovetail mate,
- swallowtail mate,
- epaulette mate,
- ladder mate,
- queen and knight mate,
- bishop and rook mate pattern,
- h-file mate,
- Greek gift attack,
- queen sacrifice mate,
- rook sacrifice mate.

### Traps and Material

- trapped piece,
- loose piece,
- loose pieces drop off,
- overloaded queen,
- trapped queen,
- net around king,
- poisoned pawn,
- exchange sacrifice,
- clearance sacrifice,
- deflection sacrifice,
- demolition sacrifice,
- Greek gift sacrifice,
- desperado sacrifice,
- perpetual resource.

## 26.8 Strategic Concepts

- initiative,
- compensation,
- material imbalance,
- exchange sacrifice,
- bishop pair,
- opposite-color bishops,
- good knight versus bad bishop,
- good bishop versus bad knight,
- space advantage,
- restraint,
- blockade,
- prophylaxis,
- overprotection,
- outpost,
- weak square,
- color complex,
- open file control,
- seventh-rank invasion,
- domination,
- restriction,
- piece coordination,
- harmony,
- improving worst piece,
- two weaknesses principle,
- switching sides,
- minority attack,
- majority attack,
- centralization,
- simplification,
- favorable trade,
- unfavorable trade,
- transition to endgame,
- conversion,
- practical chances,
- counterplay,
- dynamic compensation,
- static advantage,
- long-term weakness,
- short-term initiative.

## 26.9 Defensive Concepts

- parrying threat,
- trading attackers,
- returning material,
- creating luft,
- king escape square,
- interposition,
- moving out of pin,
- counterattack,
- perpetual check defense,
- fortress,
- blockade,
- simplification,
- reducing attacking material,
- defending key square,
- overprotection,
- prophylaxis,
- avoiding back-rank mate,
- neutralizing bishop pair,
- preventing pawn break,
- stopping passed pawn.

## 26.10 Calculation Concepts

- candidate moves,
- forcing moves,
- checks,
- captures,
- threats,
- quiet moves,
- move order,
- forcing sequence,
- tactical tree,
- branch pruning,
- evaluation after sequence,
- opponent best response,
- zwischenzug awareness,
- danger levels,
- blunder check,
- hanging piece check,
- king safety check,
- tactic scan,
- end position evaluation.

## 26.11 Opening Families to Support

The knowledge system should be able to tag concepts across:

### Open Games

- Italian Game,
- Giuoco Piano,
- Evans Gambit,
- Two Knights Defense,
- Ruy Lopez,
- Scotch Game,
- Four Knights,
- Vienna Game,
- King's Gambit,
- Philidor Defense,
- Petroff Defense.

### Semi-Open Games

- Sicilian Defense,
- Najdorf,
- Dragon,
- Accelerated Dragon,
- Classical Sicilian,
- Scheveningen,
- Sveshnikov,
- French Defense,
- Caro-Kann,
- Pirc,
- Modern Defense,
- Alekhine Defense,
- Scandinavian Defense.

### Closed and Semi-Closed Games

- Queen's Gambit,
- Queen's Gambit Declined,
- Queen's Gambit Accepted,
- Slav,
- Semi-Slav,
- Catalan,
- London System,
- Colle,
- Trompowsky,
- Torre Attack,
- King's Indian Defense,
- Queen's Indian Defense,
- Nimzo-Indian,
- Bogo-Indian,
- Grünfeld,
- Benoni,
- Benko Gambit,
- Dutch Defense.

### Flank Openings

- English Opening,
- Réti,
- King's Indian Attack,
- Bird's Opening,
- Larsen/Nimzo-Larsen,
- Polish Opening.

## 26.12 Coach Language Difficulty by Elo

### Beginner

- simple one-sentence reason,
- avoid jargon,
- explain piece movement and basic goal.

### Intermediate

- mention development, center, king safety, tactics,
- one plan ahead.

### Club

- discuss tension, pawn breaks, weak squares, candidate moves,
- identify opponent ideas.

### Advanced Club / ~2000 Elo

- discuss move-order nuance,
- prophylaxis,
- structural concessions,
- practical human mistakes,
- engine-approved alternatives,
- long-term plans,
- compensation,
- transition to favorable middlegame/endgame.

---

# 27. Anti-Hallucination Copy Matrix

## 27.1 Allowed Strong Terms Only With Evidence

| Strong Term | Required Evidence |
|---|---|
| wins | material gain, engine tactic, forced capture sequence |
| forces | legal forcing sequence with opponent replies constrained |
| checkmate | checkmate flag or mate line |
| trap | opponent piece has restricted legal mobility and cannot escape loss |
| pin | geometric pin evidence |
| fork | one move attacks two valuable targets |
| skewer | high-value piece in front, lower-value piece behind on same line |
| discovered attack | move uncovers line attack by another piece |
| overload | defender has multiple required defensive duties |
| deflect | move attacks/removes defender from required square |
| decoy | move lures piece to vulnerable square |
| clearance | move vacates square/line for another piece |
| pawn break | pawn move challenges locked/central structure |
| outpost | square cannot be challenged by enemy pawns and is useful for piece |
| weak square | square cannot be defended/challenged adequately by pawns |
| minority attack | pawn minority advances to create weakness against majority |
| Greek gift | sacrifice pattern on h7/h2 with required attacking pieces and king conditions |

## 27.2 Safe Fallback Terms

Use when evidence is partial:

- improves,
- supports,
- prepares,
- increases pressure,
- activates,
- coordinates,
- reduces risk,
- keeps options,
- challenges,
- develops,
- contests,
- points toward.

## 27.3 Terms to Avoid Without Proof

- crushing,
- winning,
- decisive,
- forced,
- only,
- mate,
- trap,
- refutes,
- blunder,
- mistake,
- brilliant.

---

# 28. Implementation Dependency Graph

```txt
Agent 0 Baseline
  ↓
Agent 1 Authority Audit
  ↓
Agent 2 CurrentInstructionFrame Lock
  ↓
Agent 3 Visible Surface Choke Point
  ↓
Agent 4 Deterministic Evidence Graph
  ↓
Agent 5 Teaching Concept Registry
  ↓
Agent 6 Coach Compiler
  ↓
Agent 7 Safety Gate
  ↓
Agent 8 Plain View / Action Policy
  ↓
Agent 9 Visual Alignment
  ↓
Agent 10 Continuation Repair
  ↓
Agent 11 Debug / Browser QA
  ↓
Agent 12 Stabilization / Vercel Preview
  ↓
Agent 13 Stockfish
  ↓
Agent 14 Maia
  ↓
Agent 15 Opening Knowledge
  ↓
Agent 16 2000-Elo Expansion
  ↓
Agent 17 Golden Benchmark
  ↓
Agent 18 Optional LLM Phrasing
```

No agent may skip ahead unless the dependency gate is passed.

---

# 29. Final Definition of Done

## v2.8.0 Foundation Stabilization Gate Done

Blundr v2.8.0 Foundation Stabilization Gate is done when:

1. `CurrentInstructionFrame.target` is sole visible target authority.
2. `CompiledCoachFrame` exists and owns coach output.
3. `buildVisibleTeachingSurface` is mandatory.
4. UI consumes `VisibleTeachingSurface`.
5. Plain View has one safe hint.
6. Show More works.
7. Reveal Move uses locked target.
8. Visuals use compiled target.
9. Continue from Here works.
10. Legacy buttons removed/quarantined.
11. Debug shows zero critical issues.
12. Browser QA passes.
13. Vercel preview builds.

## v2.8.0 Advanced Intelligence Gate Done

Blundr v2.8.0 Advanced Intelligence Gate is done when:

1. Stockfish enriches evidence without owning UI.
2. Maia provides continuation opponent context only.
3. Opening knowledge retrieval works with provenance.
4. Coach can explain tactical and strategic concepts safely.
5. 50+ golden positions pass.
6. 2000-Elo-level Show More explanations are accurate and evidence-bound.
7. Optional LLM phrasing cannot introduce unsupported claims.
8. All gates remain green.

---

# 30. Master Prompt Template for Each Agent

Use this template when dispatching each agent.

```md
You are Agent <N> working on Blundr v2.8.0.

Read the roadmap file:
docs/BLUNDR_v2.8.0_AGENT_ROADMAP_TRUE_INTELLIGENCE_COACH.md

Your assigned scope:
<insert exact agent section>

Non-negotiables:
- CurrentInstructionFrame.target is the only visible teaching authority.
- No UI component may invent coach targets, reveal targets, hints, or visual targets.
- All visible teaching output must flow through buildVisibleTeachingSurface.
- Plain View must not leak the answer.
- Every coach claim must be backed by evidence.
- Maia is continuation opponent context only, never instruction authority.
- Stockfish is evidence only, never UI authority.
- Do not add product layers outside your assigned scope.
- Do not claim success without build/test results and an implementation report.

Required output:
1. Implement only your assigned scope.
2. Add or update tests.
3. Run validation commands.
4. Create your agent report in docs/.
5. List remaining risks clearly.

Begin by auditing the relevant files, then implement the smallest clean production-grade convergence that satisfies the acceptance criteria.
```

---

# 31. Immediate Next Step

The next agent should be:

```txt
Agent 0 — Baseline and Branch Checkpoint
```

Then:

```txt
Agent 1 — Authority Audit
```

No advanced coach intelligence should be implemented until Agent 12 passes v2.8.0 Foundation Stabilization Gate.

The reason is simple:

> A coach that is always aligned and modestly intelligent is shippable.  
> A coach that is deeply intelligent but sometimes explains the wrong move is not shippable.



---

# Part X - v2.8.0 Stabilization Coaching Checkpoint

The following section integrates the deterministic coach deployment lock plan as the immediate v2.8.0 stabilization checkpoint and compatibility layer.

# BLUNDR v2.8.0 Stabilization Coaching Checkpoint

## Purpose

This document defines the next clean workflow for Blundr after the current fixed trainer/UI/playability checkpoint is pushed. The goal is to reach a stable deterministic coach before any deep intelligence roadmap work such as Stockfish enrichment, Maia, opening knowledge retrieval, or optional LLM phrasing.

This is a test-first coach deployment. The coach must become impossible to mismatch with the board, the expected move, the visual highlight, Hint, Show More, and Continue-from-here behavior.

## Non-Negotiable Rule

CurrentInstructionFrame.target is the only visible teaching authority.

Every visible coach message, hint, Show More panel, reveal target, and visual highlight must derive from that target. No component may independently infer or render a different move.

Required invariant on every user-turn teaching frame:

```txt
instructionTargetUci === coachMoveUci
instructionTargetUci === visualMoveUci
instructionTargetUci === showMoreTargetUci
instructionTargetPieceType === coachPieceType
```

If the invariant fails, the app must fail closed: suppress unsafe coach/visual output, surface a critical issue in debug, and show a safe fallback.

## Critical New Requirement: Show More Board Highlight

When the user is in Plain View and clicks Show More, Blundr must show the same teaching content and the same board visual target the user would see in Assisted View for that exact CurrentInstructionFrame.target.

Before Show More in Plain View:

- no exact SAN,
- no UCI,
- no source square,
- no destination square,
- no source/destination highlight,
- no answer arrow,
- no raw label such as answer_move.

After Show More in Plain View:

- Show More text equals Assisted coach content for the same target,
- board visual recipe equals the Assisted View teaching visual for the same target,
- visualMoveUci equals instructionTargetUci,
- no stale or alternative candidate visual appears.

This does not execute the move. It reveals the teaching explanation and the assisted-style instructional highlight for the locked target.

## Workflow Overview

1. Push current fixed trainer state.
2. Create v2.8.0-intelligent-coach-live branch.
3. Create contract docs and golden test plan.
4. Add golden tests first.
5. Implement deterministic EvidenceGraph.
6. Implement deterministic BlundrCoachCompiler.
7. Implement CoachSafetyGate.
8. Integrate the compiled coach into VisibleTeachingSurface.
9. Preserve trainer playability and continuation logic.
10. Run build/tests.
11. Run browser QA with and without debug.
12. Commit and tag only after browser proof.

## Files to Create

### Contract documents

```txt
docs/BLUNDR_v2.8.0_INTELLIGENT_COACH_CONTRACT.md
docs/BLUNDR_v2.8.0_COACH_GOLDEN_TEST_PLAN.md
docs/BLUNDR_v2.8.0_COACH_BROWSER_QA_SCRIPT.md
docs/BLUNDR_v2.8.0_INTELLIGENT_COACH_REPORT.md
```

### Deterministic evidence

```txt
lib/blundr/brain/types.ts
lib/blundr/brain/buildEvidenceGraph.ts
lib/blundr/brain/providers/boardTruthProvider.ts
lib/blundr/brain/providers/moveSemanticsProvider.ts
lib/blundr/brain/providers/openingContextProvider.ts
```

### Coach compiler

```txt
lib/blundr/coachCompiler/BlundrCoachCompiler.ts
lib/blundr/coachCompiler/teachingConceptRegistry.ts
lib/blundr/coachCompiler/claimBoundTemplateRenderer.ts
lib/blundr/coachCompiler/plainHintCompiler.ts
lib/blundr/coachCompiler/showMoreCompiler.ts
```

### Safety

```txt
lib/blundr/safety/CoachSafetyGate.ts
lib/blundr/safety/plainLeakDetector.ts
lib/blundr/safety/targetInvariantGuard.ts
lib/blundr/safety/claimEvidenceValidator.ts
```

### Minimal integration files

```txt
app/page.tsx
components/coach/CoachCard.tsx
lib/blundr/presentation/buildVisibleTeachingSurface.ts
lib/blundr/presentation/visibleActionPolicy.ts
lib/blundr/runtime/currentInstructionFrame.ts
```

### Tests and fixtures

```txt
data/goldenCoachPositions.json
tests/coach/goldenCoachPositions.test.ts
tests/coach/targetInvariant.test.ts
tests/coach/plainLeak.test.ts
tests/coach/coachCompiler.test.ts
tests/coach/evidenceGraph.test.ts
tests/coach/showMoreVisualReveal.test.ts
```

## Golden Test Requirements

Golden cases must include at minimum:

```txt
Italian e4
Italian Nf3
Italian Bc4
Italian O-O
Italian Re1
Ruy Lopez Bb5
Queen's Gambit c4
basic capture
basic check
pawn break
Plain View no-leak
Show More visual reveal
bishop/knight mismatch trap
branch transition
continuation after Continue
emergency fallback block
```

Each golden test must assert:

- coach target equals CurrentInstructionFrame.target,
- coach piece equals target piece,
- visual target equals target when visible,
- Show More target equals target,
- Assisted text includes exact SAN,
- Plain initial and Hint do not leak SAN/UCI/from/to,
- Show More equals Assisted content,
- Show More board visual equals Assisted board visual after click,
- branch transition has no move coach,
- emergency fallback is not coached as a normal lesson.

## Master Grok Prompt

Use the following prompt verbatim for the next phase.

---

# BLUNDR v2.8.0 STABILIZATION COACHING CHECKPOINT PROMPT
## Test-first deterministic coach deployment before deep intelligence roadmap work

We have pushed the current fixed trainer/UI/playability version. Now begin the next phase: deterministic coach deployment lock.

This is not a Stockfish pass.
This is not a Maia pass.
This is not an LLM phrasing pass.
This is not a UI redesign.
This is not a continuation rewrite.
This is not deep intelligence yet.

The goal is to make the coach stable, target-bound, piece-correct, Plain-safe, Show-More-consistent, visual-aligned, evidence-grounded, and impossible to mismatch with the board.

Browser-visible behavior is the source of truth.

Do not claim success from build/tests alone.

## Absolute Non-Negotiables

Every visible coach output must derive from:

```txt
CurrentInstructionFrame.target
```

No component may independently decide:

```txt
move to explain
move to reveal
move to highlight
piece to describe
hint target
Show More target
continuation candidate target
```

All visible teaching output must flow through:

```txt
CurrentInstructionFrame
→ EvidenceGraph
→ BlundrCoachCompiler
→ CoachSafetyGate
→ buildVisibleTeachingSurface
→ UI
```

Required invariant on every user-turn teaching frame:

```ts
instructionTargetUci === coachMoveUci
instructionTargetUci === visualMoveUci
instructionTargetUci === showMoreTargetUci
instructionTargetPieceType === coachPieceType
```

If this invariant fails:

```txt
suppress unsafe coach
suppress unsafe visual
surface criticalIssue
do not render stale copy
```

## Critical Requirement: Show More Also Reveals Assisted-View Board Highlight

When the user is in Plain View, the board must not reveal the answer before Show More.

Before Show More:

```txt
No exact SAN.
No UCI.
No from-square.
No to-square.
No source/destination highlight.
No answer arrow.
No raw labels such as answer_move.
```

When the user clicks Show More:

```txt
Plain Show More text must equal Assisted coach content for the same CurrentInstructionFrame.target.
The board must show the same assisted-view visual highlight/arrow/recipe for that same target.
visualMoveUci === instructionTargetUci.
showMoreTargetUci === instructionTargetUci.
No stale continuation candidate, alternate candidate, or previous-frame visual may appear.
```

Show More must not execute the move. It only reveals the full explanation and Assisted-style board teaching highlight for the locked target.

Add a dedicated regression test:

```txt
Plain View before Show More has no target arrow/highlight.
Click Show More.
The board visual recipe equals the Assisted visual recipe for the same target.
The visual target equals CurrentInstructionFrame.target.
```

## Phase 0: Branch and Safety Snapshot

Run:

```bash
pwd
git branch --show-current
git status --short
git rev-parse HEAD
git log --oneline --decorate -20
```

Create branch:

```bash
git checkout -b v2.8.0-intelligent-coach-live
```

If it exists:

```bash
git checkout v2.8.0-intelligent-coach-live
```

Save safety files:

```bash
mkdir -p .tmp/v2.8.0_coach_deployment_safety
git diff > .tmp/v2.8.0_coach_deployment_safety/current-working-tree.patch
git diff --staged > .tmp/v2.8.0_coach_deployment_safety/current-staged.patch
git status --short > .tmp/v2.8.0_coach_deployment_safety/current-status.txt
git log --oneline --decorate --graph --all -100 > .tmp/v2.8.0_coach_deployment_safety/git-log.txt
```

Do not deploy.

## Phase 1: Create Contract Docs

Create:

```txt
docs/BLUNDR_v2.8.0_INTELLIGENT_COACH_CONTRACT.md
docs/BLUNDR_v2.8.0_COACH_GOLDEN_TEST_PLAN.md
docs/BLUNDR_v2.8.0_COACH_BROWSER_QA_SCRIPT.md
```

The contract must state:

```txt
1. CurrentInstructionFrame.target is sole target authority.
2. Assisted View must state exact move first.
3. Plain View must not leak SAN/UCI/from/to before Show More.
4. Hint must be conceptual, not an answer.
5. Show More text must equal Assisted coach content for same target.
6. Show More board visual must equal Assisted board visual for same target after click.
7. Coach cannot say bishop when target is knight, or knight when target is bishop.
8. Coach cannot say wins/material/mate/forced unless evidence proves it.
9. Emergency fallback cannot be coached as normal lesson.
10. Branch transition has no move coach or visual target.
11. Browser QA required before commit.
```

## Phase 2: Add Golden Tests First

Create:

```txt
data/goldenCoachPositions.json
tests/coach/goldenCoachPositions.test.ts
tests/coach/targetInvariant.test.ts
tests/coach/plainLeak.test.ts
tests/coach/coachCompiler.test.ts
tests/coach/evidenceGraph.test.ts
tests/coach/showMoreVisualReveal.test.ts
```

Golden cases must include:

```txt
Italian e4
Italian Nf3
Italian Bc4
Italian O-O
Italian Re1
Ruy Lopez Bb5
Queen's Gambit c4
basic capture
basic check
pawn break
Plain View no-leak
Show More visual reveal
bishop/knight mismatch trap
branch transition
continuation after Continue
emergency fallback block
```

Tests must fail if:

```txt
coach target differs from instruction target
coach piece differs from target piece
visual target differs from instruction target
Show More target differs from instruction target
Assisted does not include exact SAN
Plain initial text leaks SAN/UCI/from/to
Plain Hint leaks SAN/UCI/from/to
Show More text does not equal Assisted content
Plain Show More board visual does not equal Assisted board visual
coach says bishop for knight or knight for bishop
coach says wins/mate/forced without evidence
emergency legal fallback is coached normally
branch transition renders move coach or target visual
```

## Phase 3: Implement Deterministic EvidenceGraph

Create or enhance:

```txt
lib/blundr/brain/types.ts
lib/blundr/brain/buildEvidenceGraph.ts
lib/blundr/brain/providers/boardTruthProvider.ts
lib/blundr/brain/providers/moveSemanticsProvider.ts
lib/blundr/brain/providers/openingContextProvider.ts
```

No Stockfish.
No Maia.
No LLM.

EvidenceGraph must include:

```txt
frameKey
targetUci
targetSan
targetPieceType
fenBefore
legalTarget
isCapture
isCheck
isCheckmate
isCastle
isPromotion
from
to
destinationOccupied
development evidence
center evidence
king safety evidence
basic opening context
evidence claim IDs
```

EvidenceGraph must not contain freeform visible coach copy.

## Phase 4: Implement Deterministic Coach Compiler

Create:

```txt
lib/blundr/coachCompiler/BlundrCoachCompiler.ts
lib/blundr/coachCompiler/teachingConceptRegistry.ts
lib/blundr/coachCompiler/claimBoundTemplateRenderer.ts
lib/blundr/coachCompiler/plainHintCompiler.ts
lib/blundr/coachCompiler/showMoreCompiler.ts
```

Compiler function:

```ts
compileCoachFrame({ frame, evidenceGraph, displayMode })
```

Output must include:

```txt
targetUci
targetSan
targetPieceType
assisted.title
assisted.body
plain.hint
showMore.title
showMore.body
visualIntents
evidenceUsed
safety metadata
debug
```

Assisted View format:

```txt
Play [SAN].
[Specific explanation tied to exact piece, square, and purpose.]
```

Examples:

```txt
Play e4.
Claim space in the center and open lines for your bishop and queen.
```

```txt
Play Nf3.
Develop the knight toward the center and prepare safe king development.
```

```txt
Play Bc4.
Move your bishop to c4, where it develops actively and pressures f7.
```

```txt
Castle kingside.
Move your king to safety and connect your rooks.
```

Forbidden when trusted target exists:

```txt
Focus on development.
Consider repositioning your piece.
A legal continuation is available.
Try to improve your position.
```

Plain hint must not reveal exact move.

Show More text must equal Assisted content for the same target.

Show More visual recipe must equal Assisted visual recipe for the same target after Show More is clicked.

## Phase 5: Implement Safety Gate

Create:

```txt
lib/blundr/safety/CoachSafetyGate.ts
lib/blundr/safety/plainLeakDetector.ts
lib/blundr/safety/targetInvariantGuard.ts
lib/blundr/safety/claimEvidenceValidator.ts
```

Blockers:

```txt
target mismatch
piece mismatch
visual mismatch
showMore target mismatch
showMore visual mismatch
plain SAN leak
plain UCI leak
plain source/destination leak
unverified strong claim
stale frame key
branch transition has move coach
branch transition has move visual
emergency fallback coached normally
```

Strong terms requiring evidence:

```txt
wins
forces
checkmate
mate
trap
only move
decisive
blunder
```

Safe fallback:

```txt
This position is ready for practice.
```

or:

```txt
Blundr does not have a trusted continuation here yet.
```

## Phase 6: Integrate Into Visible Surface

Modify only as needed:

```txt
lib/blundr/presentation/buildVisibleTeachingSurface.ts
lib/blundr/presentation/visibleActionPolicy.ts
components/coach/CoachCard.tsx
app/page.tsx
```

Rules:

```txt
UI must consume VisibleTeachingSurface only.
No direct liveCoach rendering.
No legacy coach card rendering.
No direct expectedMovesForValidation coach text.
No direct visual label from raw recipe IDs.
```

If frame kind is:

```txt
thinking
branch_transition
terminal
opponent_replying
```

then:

```txt
coachMoveUci = null
visualMoveUci = null
showMoreTargetUci = null
plainHint = null unless safe and non-targeted
```

If frame has trusted target:

```txt
compiledCoach.targetUci === frame.target.uci
surface.targetUci === frame.target.uci
visualRecipe.targetUci === frame.target.uci if visual exists
```

Plain View visual behavior:

```txt
Before Show More: no answer visual.
After Show More: assistedVisualRecipe for the same target is allowed and must match Assisted View.
```

## Phase 7: Preserve Trainer Stability

Do not break current trainer behavior.

Required preserved behavior:

```txt
lesson starts
first move appears
board accepts correct first move
opponent reply occurs
next move appears
Thinking does not block trusted curated target
Continue does not flash
Continue appears at confirmed End of Book
no candidate before Continue
Continue starts same-FEN continuation
```

## Phase 8: Required Validation

Run:

```bash
npm run build
npm run test:trainer-debug
npm run test:coach-quality
npm run test:multi-move-qa
```

Then run the new tests. If the repo does not support exact test paths, inspect package.json and run the closest equivalent:

```bash
npm run test -- tests/coach/goldenCoachPositions.test.ts
npm run test -- tests/coach/targetInvariant.test.ts
npm run test -- tests/coach/plainLeak.test.ts
npm run test -- tests/coach/coachCompiler.test.ts
npm run test -- tests/coach/evidenceGraph.test.ts
npm run test -- tests/coach/showMoreVisualReveal.test.ts
```

Document exact commands.

## Phase 9: Live Browser Test

Do not use broad pkill -f.

Use fresh port 3061:

```bash
PORT=3061
LOG=/tmp/blundr-v280-coach-deployment-$PORT.log
PIDFILE=/tmp/blundr-v280-coach-deployment-$PORT.pid

rm -f "$LOG" "$PIDFILE"

nohup npm run dev -- --hostname 0.0.0.0 --port "$PORT" > "$LOG" 2>&1 &

echo $! > "$PIDFILE"

sleep 10

tail -160 "$LOG"
curl -I "http://localhost:$PORT" || true
```

Open forwarded port 3061.

Browser acceptance without ?debug=1:

```txt
1. UI is clean.
2. Lesson starts.
3. First coach instruction says exact move.
4. Board accepts correct first move.
5. Opponent reply occurs.
6. Next coach instruction appears.
7. Coach text matches piece and move.
8. Visual target matches coach target.
9. Plain View does not leak move.
10. Hint does not leak SAN/UCI/from/to.
11. Show More text equals Assisted content.
12. Show More board highlight equals Assisted board highlight for the same target.
13. End-of-Book shows Continue.
14. No candidate before Continue.
15. Continue click starts same-FEN continuation.
16. Console has no runtime errors.
```

Browser acceptance with ?debug=1:

```txt
criticalIssues.length === 0
targetMismatchCount === 0
pieceMismatchCount === 0
plainLeakCount === 0
legacyBypassCount === 0
staleFrameCount === 0
visualMismatchCount === 0
showMoreMismatchCount === 0
showMoreVisualMismatchCount === 0
```

## Phase 10: Report, Commit, Tag

Create:

```txt
docs/BLUNDR_v2.8.0_INTELLIGENT_COACH_REPORT.md
```

Report must include:

```txt
Branch
Commit SHA
Files changed
Tests added
Commands run
Build result
Test result
Browser result
Debug result
Known risks
Verdict
```

Only if all tests and browser QA pass:

```bash
git status --short
git diff --stat
git add app components lib tests data docs package.json package-lock.json .npmrc .gitignore
git commit -m "Lock deterministic coach deployment v2.8.0"
git tag v2.8.0-intelligent-coach-live
git push origin refs/heads/v2.8.0-intelligent-coach-live:refs/heads/v2.8.0-intelligent-coach-live
git push origin refs/tags/v2.8.0-intelligent-coach-live:refs/tags/v2.8.0-intelligent-coach-live
```

Do not deploy.

## Final Definition of Done

Do not claim success unless all are true:

```txt
1. Coach target always equals CurrentInstructionFrame.target.
2. Coach piece always equals target piece.
3. Assisted always states exact SAN first.
4. Plain initial text does not leak.
5. Hint does not leak.
6. Show More text equals Assisted content.
7. Show More board highlight equals Assisted board highlight after click.
8. Visual target equals instruction target.
9. Branch transition has no move coach or visual target.
10. Emergency fallback is not coached as normal lesson.
11. Trainer remains playable.
12. End-of-Book / Continue remains correct.
13. All old UI/debug controls remain absent.
14. Build passes.
15. Existing tests pass.
16. New golden tests pass.
17. Browser QA passes.
18. Debug shows zero critical issues.
19. Commit and tag exist.
```

---

## Notes for the Supervisor

This should be run as one controlled implementation pass, not many parallel free-running agents. The work is broad enough that an agent should create the contracts and tests first, then implement the minimum deterministic system needed to pass them.

Do not allow v2.8.0 deep-intelligence features until this deterministic deployment lock passes.


---

# Part XI - v2.8.0 Supervisor Final Instructions

## 11.1 No Shortcut Clause

The agent must not shorten this roadmap during execution. If it creates derivative prompts, those prompts must point back to this full document and may not remove acceptance criteria.

## 11.2 No False Completion Clause

The agent may not report success unless all gates pass with real commands and browser proof. Any missing command output must be treated as unknown, not success.

## 11.3 One-Pass Completion Clause

The agent should attempt the full v2.8.0 jump in one sequential branch, but must stop at hard-stop conditions rather than papering over broken behavior.

## 11.4 Release Naming

Use:

```txt
branch: v2.8.0-intelligent-coach-live
tag: v2.8.0-intelligent-coach-rc1
```

## 11.5 Final Report Required

```txt
BLUNDR v2.8.0 Intelligent Coach one-pass execution: YES/NO
Branch:
Base SHA:
Final SHA:
Tag:
Phases completed:
Files changed:
Tests added:
Build result:
Unit/integration result:
Golden result:
Browser result:
Debug counters:
Provider failure result:
Known risks:
Stop conditions encountered:
Verdict:
```

---

# Part XII - Download/Use Instructions

Use the Markdown version as the canonical source for Grok because it is easiest to paste, diff, search, and execute against. Use the DOCX/PDF versions for human review only.

