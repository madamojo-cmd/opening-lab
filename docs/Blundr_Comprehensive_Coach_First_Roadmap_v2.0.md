# Blundr Comprehensive Coach-First Roadmap v2.0 (Extracted from DOCX)

> **Single authoritative specification.** This supersedes all prior roadmaps and notes.
> Extracted 2026-05-30 for implementation use by Grok agent.

## Document Header / Metadata
- **Blundr Comprehensive Coach-First Roadmap**
- From v2.7.39 Stable Checkpoint to Universal Blundr Brain and App Store MVP
- **Field**
- **Specification**
- **Spec Version**
- **2.0 - Coach Perfection First**
- **Date**
- **May 30, 2026**
- **Status**
- **Implementation-ready master roadmap**
- **Primary Gate**
- **No product expansion until the coach is stable, unified, evidence-backed, universal, and debug-verifiable.**
- **Core Promise**
- **Blundr never mismatches the target move, coach explanation, board visual, reveal button, hint, or review item.**
- Table of Contents
- 0. Executive Decision: Coach First, Product Second
- 1. Non-Negotiable Product and Engineering Rules
- 2. Current-State Diagnosis and Stable Checkpoint
- 3. Coach Perfection Gate
- 4. Unincorporated Coach Architecture Closure
- 5. Blundr Brain Universal Architecture
- 6. Complete Chess Teaching Taxonomy
- 7. Universal Evidence and Safety Model
- 8. Versioned Technical Roadmap: v2.7.39.0 to v2.9.x
- 9. Product Roadmap After Coach Gate
- 10. Testing, Golden Positions, QA, and Telemetry
- 11. Performance, Caching, and Runtime Safety
- 12. Redundancy Removal and Deprecation Plan
- 13. Codex/Engineering Execution Prompts
- 14. Final Release Gates and App Store MVP Definition
- Appendices: Data Contracts, Checklists, and File Maps
- 0. Executive Decision: Coach First, Product Second
- Corrected Priority Order
- Create a real stable checkpoint for the current working v2.7.39 state.
- Perfect coach target stability and source-of-truth alignment.
- Close the unincorporated coach architecture problem by inventorying, wrapping, and unifying existing intelligence modules.
- Build the Blundr Brain facade and route coach/debug through it.
- Prove the coach on golden positions and browser flows.
- Only then build lesson library, onboarding, persistence, review queue, gamification, accounts, dashboard, mobile polish, and App Store packaging.
- The Hard Product Rule
- No product feature may ship on top of a coach that is not target-stable, evidence-backed, piece-correct, and debug-verifiable.
- 1. Non-Negotiable Product and Engineering Rules
- 1.1 The Fundamental Teaching Invariant
- On every ready_for_user teaching frame:instructionTargetUci === coachMoveUciinstructionTargetUci === visualMoveUciinstructionTargetUci === revealTargetUciinstructionTargetPieceType === coachPieceType
- If any part of this invariant fails, the debug system must raise a critical issue. The UI may show a safe recovery state, but it must never silently continue with mismatched targets.
- 1.2 Truth and Evidence Rules
- Every user-facing claim must be backed by explicit evidence.
- Move identity comes only from CurrentInstructionFrame.target.
- Coach language must never be generated from a different target than the visual or reveal button.
- Opening registry knowledge enriches the Brain; it does not replace universal board intelligence.
- Stockfish validates tactical safety; it does not directly write the coach voice.
- Debug panels must be read-only and must never mutate runtime state.
- 1.3 User-Facing Language Bans
- Never show: Verified move:, runtime, fallback, pipeline, not_exposed_from_module, supported_continuation, Stockfish validated, candidate source, UCI as explanation.

---

**Blundr Comprehensive Coach-First Roadmap**

From v2.7.39 Stable Checkpoint to Universal Blundr Brain and App Store MVP

**Field**

**Specification**

**Spec Version**

**2.0 - Coach Perfection First**

**Date**

**May 30, 2026**

**Status**

**Implementation-ready master roadmap**

**Primary Gate**

**No product expansion until the coach is stable, unified, evidence-backed, universal, and debug-verifiable.**

**Core Promise**

**Blundr never mismatches the target move, coach explanation, board visual, reveal button, hint, or review item.**

This document supersedes prior roadmap drafts by making coach perfection the explicit prerequisite for every other product layer. It incorporates the current checkpoint audit findings: the repo already contains multiple intelligence and coach subsystems, but they must be inventoried, wrapped, unified, and eventually deprecated behind a single deterministic Blundr Brain facade before onboarding, accounts, review queue, gamification, or App Store packaging proceeds.


# Table of Contents

0. Executive Decision: Coach First, Product Second

1. Non-Negotiable Product and Engineering Rules

2. Current-State Diagnosis and Stable Checkpoint

3. Coach Perfection Gate

4. Unincorporated Coach Architecture Closure

5. Blundr Brain Universal Architecture

6. Complete Chess Teaching Taxonomy

7. Universal Evidence and Safety Model

8. Versioned Technical Roadmap: v2.7.39.0 to v2.9.x

9. Product Roadmap After Coach Gate

10. Testing, Golden Positions, QA, and Telemetry

11. Performance, Caching, and Runtime Safety

12. Redundancy Removal and Deprecation Plan

13. Codex/Engineering Execution Prompts

14. Final Release Gates and App Store MVP Definition

Appendices: Data Contracts, Checklists, and File Maps


# 0. Executive Decision: Coach First, Product Second

The coach is not a feature inside Blundr. The coach is the product. Every additional layer - onboarding, account creation, review queue, gamification, dashboards, lesson library expansion, iOS packaging, and App Store distribution - depends on a truthful, stable, and intelligent coach. If the coach can drift from the board, explain the wrong piece, reveal the wrong move, or store the wrong review item, every downstream product layer compounds the error.


## Corrected Priority Order

Create a real stable checkpoint for the current working v2.7.39 state.

Perfect coach target stability and source-of-truth alignment.

Close the unincorporated coach architecture problem by inventorying, wrapping, and unifying existing intelligence modules.

Build the Blundr Brain facade and route coach/debug through it.

Prove the coach on golden positions and browser flows.

Only then build lesson library, onboarding, persistence, review queue, gamification, accounts, dashboard, mobile polish, and App Store packaging.


## The Hard Product Rule

No product feature may ship on top of a coach that is not target-stable, evidence-backed, piece-correct, and debug-verifiable.


# 1. Non-Negotiable Product and Engineering Rules

## 1.1 The Fundamental Teaching Invariant

On every ready_for_user teaching frame:instructionTargetUci === coachMoveUciinstructionTargetUci === visualMoveUciinstructionTargetUci === revealTargetUciinstructionTargetPieceType === coachPieceType

If any part of this invariant fails, the debug system must raise a critical issue. The UI may show a safe recovery state, but it must never silently continue with mismatched targets.


## 1.2 Truth and Evidence Rules

Every user-facing claim must be backed by explicit evidence.

Move identity comes only from CurrentInstructionFrame.target.

Coach language must never be generated from a different target than the visual or reveal button.

Opening registry knowledge enriches the Brain; it does not replace universal board intelligence.

Stockfish validates tactical safety; it does not directly write the coach voice.

Debug panels must be read-only and must never mutate runtime state.


## 1.3 User-Facing Language Bans

Never show: Verified move:, runtime, fallback, pipeline, not_exposed_from_module, supported_continuation, Stockfish validated, candidate source, UCI as explanation.

Prefer: Blundr Brain, Coach, Verified, Plan, Review, Mastery, Improve, Center, Safety, Development, Tactic.


## 1.4 Stage Gate Policy

**Field**

**Specification**

**Coach gate**

**Must pass before lesson library expansion, onboarding, accounts, review queue, gamification, dashboard, mobile polish, or App Store packaging.**

**Debug gate**

**criticalIssues must be empty on normal target frames; terminal/opponent/no-target frames must not raise irrelevant coach pipeline warnings.**

**Browser gate**

**A fresh user session must complete a guided line, continue from here, enter continuation, and reach terminal without target drift or coach mismatch.**

**Architecture gate**

**No unclassified active coach/intelligence path may remain. Each old module must be wrapped, deprecated, or explicitly retained.**


# 2. Current-State Diagnosis and Stable Checkpoint

## 2.1 What the Current Checkpoint Proves

The runtime can progress beyond the first move.

The app can enter continuation mode.

The app can reach terminal checkmate.

The Coach Timeline can log instructional, opponent-status, and terminal entries.

Visible coach copy no longer leaks raw Verified move debug text.

Piece mismatch and target mismatch counts can be zero in a full browser session.


## 2.2 Known Remaining Risks

terminal_surface_missing may appear falsely on a valid terminal surface.

feature_pipeline_not_exposed and plan_pipeline_not_exposed may appear on terminal/no-target frames.

Coach Timeline may log multiple official instructional targets for the same trainerFrameId.

High fallback count may hide weak live-coach validation.

Generic copy remains for castling, c3, Re1, Bb3, and other plan-specific moves.

The repo contains multiple coach/intelligence systems that are not cleanly unified.


## 2.3 Stable Checkpoint Procedure

cd /workspaces/opening-labnpm run test:coach-qualitynpm run test:trainer-debugnpm run test:multi-move-qanpx tsc --noEmitnpm run buildgit add app components lib package.json package-lock.json tsconfig.jsongit restore --staged "*.zip" "*.tgz" checkpoint_artifacts .tmp .next node_modules coverage dist tsconfig.tsbuildinfo 2>/dev/null || truegit commit -m "Create v2.7.39 stable coach runtime checkpoint"git tag v2.7.39-stable-checkpoint


## 2.4 Exit Criteria

[ ] All validation commands pass.

[ ] Source-only commit exists.

[ ] Checkpoint tag exists.

[ ] Generated artifacts are not committed.

[ ] An uploadable source ZIP exists for audit.


# 3. Coach Perfection Gate

This is the central stage of the roadmap. Nothing product-facing moves forward until the coach is proven stable, intelligent, evidence-backed, and debug-verifiable.


## 3.1 Required Coach Perfection Workstreams

**Version / Stage**

**Purpose**

**Must Ship**

**Hard Exit Gate**

**3A Target Locking**

**Prevent official instruction targets from changing during a frame.**

**LockedContinuationCandidate, instructionFrameKey, target-change guards.**

**No duplicate official targets in Coach Timeline.**

**3B Surface Alignment**

**Ensure coach, visual, reveal, hint, and validation consume the same target.**

**Invariant checks in debug and tests.**

**0 coach/visual/reveal mismatches.**

**3C Architecture Closure**

**Inventory all old coach systems and decide their fate.**

**Inventory doc, incorporation map, deletion schedule.**

**No unknown active coach path remains.**

**3D Brain Facade**

**Create one API around existing intelligence modules.**

**analyzeBlundrPosition(input).**

**Coach and debug can consume Brain output.**

**3E Evidence Language**

**Every sentence is backed by facts.**

**Claim model, safety linter, blocked-claim logs.**

**0 unsupported user-facing claims.**

**3F Universal Teaching**

**Work without opening-specific docs.**

**Universal features, tactics, plans, candidate scoring.**

**Golden positions across openings pass.**

**3G Debug Truth**

**Debug panel tells one truth.**

**Brain pipeline, Coach Timeline, target lock status, fallback split.**

**No obsolete not_exposed warnings when Brain active.**


## 3.2 Coach Perfection Metrics

**Field**

**Specification**

**Target mismatch count**

**0 on all golden flows.**

**Piece mismatch count**

**0 on all golden flows.**

**Debug leak count**

**0.**

**Duplicate official target count**

**0.**

**Instructional fallback rate**

**Less than 8-10 percent on curated/guided lessons after Brain v1.**

**Average instructional quality score**

**>= 85 on golden positions.**

**Normal-frame critical issues**

**0.**

**Browser QA**

**Fresh session can complete guided line, continue, and reach terminal.**


## 3.3 Product Blockers Until Coach Gate Passes

Do not build accounts before the coach is correct; accounts would sync incorrect progress.

Do not build Review Queue before the coach is correct; review items would store wrong moves/explanations.

Do not build gamification before the coach is correct; XP would reward unstable behaviors.

Do not expand lesson content before the coach is correct; content volume makes bugs harder to isolate.

Do not package iOS before the coach is correct; mobile QA magnifies state bugs.


# 4. Unincorporated Coach Architecture Closure

The current repository already includes many pieces of deeper intelligence. The roadmap must avoid building yet another parallel coach system. The next step is to inventory, classify, and wrap existing modules into the Blundr Brain facade.


## 4.1 Required Inventory Document

docs/BLUNDR_COACH_ARCHITECTURE_INVENTORY.md

Each row must classify a module as active runtime, active debug only, dormant, duplicated, legacy, candidate for Brain, migrate then deprecate, or delete later.

type CoachArchitectureInventoryRow = {  filePath: string;  moduleName: string;  currentRole: "active_runtime" | "active_debug_only" | "dormant" | "duplicated" | "legacy" | "candidate_for_brain";  consumedBy: string[];  produces: string[];  overlapsWith: string[];  keepOrReplace: "keep" | "wrap_in_brain" | "migrate_then_deprecate" | "delete_later" | "unknown_needs_review";  earliestSafeDeletionVersion?: string;  notes: string;};


## 4.2 Minimum Modules to Inventory

app/page.tsx

lib/blundr/runtime/currentInstructionFrame.ts

lib/blundr/coachBrain/coachExplanationPipeline.ts

lib/blundr/coach/coachDecisionEngine.ts

lib/blundr/coach/intentFirstCoachEngine.ts

lib/blundr/liveCoach/*

lib/blundr/features/*

lib/blundr/geometry/*

lib/blundr/plans/*

lib/blundr/opportunity/*

lib/blundr/explanation/*

lib/blundr/presentation/*

lib/blundr/debug/*

lib/blundr/visual*

components/coach/*

components/debug/*


## 4.3 Brain Incorporation Map

docs/BLUNDR_BRAIN_INCORPORATION_MAP.md

**Field**

**Specification**

**geometry/attackMap.ts**

**Brain.board.attackMap**

**geometry/moveDelta.ts**

**Brain.move.delta**

**features/kingSafetyExtractor.ts**

**Brain.features.kingSafety**

**features/pawnStructureExtractor.ts**

**Brain.features.pawnStructure**

**plans/planRecognitionEngine.ts**

**Brain.plans.recognition**

**opportunity/multiLayerOpportunityRanker.ts**

**Brain.opportunities.ranking**

**explanation/proceduralExplanationEngine.ts**

**Brain.explanation.renderer**

**coachExplanationPipeline.ts**

**Temporary compatibility wrapper around Brain output.**

**coachDecisionEngine.ts**

**Migrate or deprecate after parity tests pass.**

**liveCoach/***

**Migrate useful logic, then deprecate after Brain v1 or v2.8.0.**


## 4.4 Parallel Path Guard

if (dev && oldCoachOwnsSurface && brainCoachOwnsSurface) {  criticalIssues.push("parallel_coach_surface_ownership");}

Old paths may run for parity comparison only. Presentation ownership must belong to the Brain path once enabled.


# 5. Blundr Brain Universal Architecture

Blundr Brain is a deterministic teaching-intelligence engine. It is not simply Stockfish, a template engine, or an opening registry. It combines legal move facts, board geometry, move deltas, tactical motifs, strategic features, plan inference, candidate scoring, explanation rendering, and safety linting.


## 5.1 Official API

analyzeBlundrPosition(input: BlundrBrainInput): BlundrBrainAnalysis


## 5.2 Layer Ordering

InputNormalization  -> BoardIntelligence  -> MoveFactPacket  -> MoveDelta  -> TacticalMotifs  -> StrategicFeatures  -> PlanInference  -> OpportunityRanking  -> CandidateScoring  -> ExplanationRendering  -> SafetyLinter  -> BlundrBrainAnalysis  -> TrainerPresentationFrame

No layer may bypass the official adapter. No user-facing language may be rendered before the safety linter passes.


## 5.3 Brain Input

type BlundrBrainInput = {  fen: string;  fen4: string;  target: CurrentInstructionTarget | null;  trainerPhase: TrainerPhase;  trainingMode: TrainingMode;  selectedOpeningId?: string | null;  selectedLineId?: string | null;  candidateMoves?: string[];  enginePreview?: EnginePreview | null;  includeTactics?: boolean;  includeStrategy?: boolean;  includePlans?: boolean;  debugMode?: boolean;};


## 5.4 Brain Output

type BlundrBrainAnalysis = {  status: "ok" | "partial" | "failed" | "not_applicable";  board: BoardIntelligenceSnapshot;  move?: MoveIntelligence | null;  features: FeaturePacket;  plans: PlanPacket;  opportunities: OpportunityPacket;  candidates: CandidateScorePacket;  explanation: CoachExplanation | null;  safety: SafetyResult;  summary: BrainSummary;  debug: BrainDebugPacket;};


## 5.5 Layer Responsibilities

**Version / Stage**

**Purpose**

**Must Ship**

**Hard Exit Gate**

**Layer 0 Input Normalization**

**Validate FEN, target legality, side to move, SAN/UCI consistency, and required context.**

**Data packet + tests**

**No unsupported output**

**Layer 1 Board Intelligence**

**Build attack maps, material, mobility, king zones, pawn structure, piece quality, center control, and legal move snapshot.**

**Data packet + tests**

**No unsupported output**

**Layer 2 Move Facts**

**Identify objective target facts: piece, from/to, capture, check, mate, castle, promotion, development, central advance.**

**Data packet + tests**

**No unsupported output**

**Layer 3 Move Delta**

**Compare before/after board state: material delta, center delta, mobility delta, opened lines, threats created/answered.**

**Data packet + tests**

**No unsupported output**

**Layer 4 Tactical Motifs**

**Detect check, mate, capture, recapture, attacks queen, loose pieces, pins, forks, skewers, discovered attacks only when verified.**

**Data packet + tests**

**No unsupported output**

**Layer 5 Strategic Features**

**Detect development, king safety, center, pawn breaks, piece activity, weak squares, outposts, open files, color complexes.**

**Data packet + tests**

**No unsupported output**

**Layer 6 Plan Inference**

**Turn evidence into plans: develop, castle, claim/challenge/support center, prepare pawn break, win material, answer threat.**

**Data packet + tests**

**No unsupported output**

**Layer 7 Opportunity Ranking**

**Choose the best teachable idea for the target, with scores, evidence tags, and blocked reasons.**

**Data packet + tests**

**No unsupported output**

**Layer 8 Candidate Scoring**

**Rank legal continuation candidates deterministically using Brain evidence and optional engine validation.**

**Data packet + tests**

**No unsupported output**

**Layer 9 Explanation Rendering**

**Render concise coach copy from selected opportunity and evidence; never raw debug facts.**

**Data packet + tests**

**No unsupported output**

**Layer 10 Safety Linter**

**Final gate; blocks unsupported claims, debug leaks, piece hallucinations, unverified tactical/strategic claims.**

**Data packet + tests**

**No unsupported output**


# 6. Complete Chess Teaching Taxonomy

This section defines the concepts Blundr should eventually be able to teach. The system does not need to ship every advanced detector in the first Brain release, but the taxonomy prevents architectural dead ends. Each concept must map to evidence, user-facing language, debug fields, and review tags before it can be taught.


## 6.1 Universal Move Intent Categories

Development and activation

develop minor piece

improve piece activity

move worst piece

connect rooks

activate rook

activate bishop

reroute knight

centralize queen only when safe

Center and space

occupy center

control center

support center

challenge center

advance central pawn

prepare central pawn break

gain space

undermine pawn chain

King safety

castle

prepare castling

open escape square

avoid weakening king zone

defend mating square

remove attacker near king

Tactics and forcing moves

check

checkmate

capture

recapture

fork

pin

skewer

discovered attack

deflection

decoy

clearance

overload

remove defender

zwischenzug

Defense and prophylaxis

defend loose piece

answer threat

overprotect key square

avoid fork

remove pin

block line

trade attacker

improve king safety

Pawn structure

create passed pawn

support pawn chain

break pawn chain

avoid doubled pawns

exploit isolated pawn

fix weakness

create outpost

open file

Material and exchanges

win material

equalize material

sacrifice for attack

trade into favorable structure

avoid bad trade

exchange active defender

Plan preparation

prepare pawn break

place rook behind pawn

reroute piece to better square

clear diagonal/file

build pressure

increase mobility

Endgame conversion

activate king

create passer

stop passer

rook behind passed pawn

opposition

shoulder king

simplify into winning endgame


## 6.2 Opening Teaching Possibilities

Why develop before attacking.

Why central pawns matter.

When to castle and when delaying castling is justified.

How to punish early queen moves.

How a move prepares a pawn break.

How one piece creates pressure on f7/f2, c7/c2, h7/h2, or key central squares.

How to recognize transpositions.

How to handle branch moves without memorizing blindly.

How to continue when the book ends.

How opening principles change when tactics override them.


## 6.3 Tactical Teaching Possibilities

check

checkmate

mate threat

capture

recapture

hanging piece

attacks queen

fork

pin

absolute pin

relative pin

skewer

discovered attack

double attack

deflection

decoy

overload

interference

clearance

remove defender

back rank weakness

zwischenzug

trapped piece

sacrifice with compensation


## 6.4 Strategic Teaching Possibilities

development lead

king in center

unsafe king

space advantage

central tension

pawn break timing

open file usage

semi-open file pressure

bishop pair

bad bishop

good knight vs bad bishop

outpost

weak square

color complex weakness

isolated pawn

backward pawn

doubled pawn

passed pawn

minority attack

piece coordination

rook lift

battery

overprotection

prophylaxis

improve worst piece


## 6.5 Mistake Feedback Taxonomy

Wrong piece: user moved a different piece than the target.

Wrong square: user moved correct piece type to an incorrect destination.

Illegal move: impossible under current FEN.

Missed tactic: target was a check, mate, capture, or defensive resource.

Missed development: user ignored a key development move.

Missed king safety: user delayed or damaged king safety.

Missed center plan: user failed to support/challenge/advance the center.

Premature attack: user attacked before development/safety.

Blundered material: user allows verified material loss.

Allowed tactic: user allows fork/pin/skewer/mate threat only if verified.

Plan drift: user makes a legal move that does not serve the current plan.


## 6.6 Review and Exercise Generation Possibilities

Find the move.

Find the plan.

Spot the threat.

Choose between two candidate moves.

Explain why the move works.

Fix the blunder.

Recall a missed opening move.

Recall a motif across openings.

Convert a winning tactic.

Continue after the book ends.


# 7. Universal Evidence and Safety Model

A move explanation is allowed only when its claims are backed by data. The claim model is what prevents Blundr from becoming a confident hallucination engine.

type CoachClaim = {  claimId: string;  text: string;  claimType: "piece" | "center" | "king_safety" | "tactic" | "material" | "plan" | "opening" | "endgame";  requiredEvidence: string[];  evidencePresent: string[];  confidence: "verified" | "probable" | "weak" | "blocked";  allowedToRender: boolean;};


## 7.1 Claim Requirements

**Field**

**Specification**

**develops the knight**

**pieceType = knight, move is development or activity-improving.**

**develops the bishop**

**pieceType = bishop, or a separate verified bishop feature is being described explicitly.**

**controls the center**

**Attack map or center-control delta verifies control of d4/e4/d5/e5 or defined extended center.**

**gains space**

**Pawn advance and position context support space gain.**

**prepares d4**

**Opening enrichment or pawn-break detector verifies plausibility.**

**wins material**

**Capture/material delta verifies material gain or exchange value.**

**keeps initiative**

**Engine/tempo/forcing evidence verifies; otherwise banned.**

**checkmate**

**Move gives check, opponent legalMoveCountAfter = 0.**

**fork**

**Attack map verifies one moved piece attacks two valuable targets after move.**

**pin**

**Line geometry verifies piece is pinned to king/queen/major target.**


## 7.2 Safety Linter Output

type SafetyResult = {  status: "passed" | "replaced_with_safe_fallback" | "blocked";  blockedClaims: CoachClaim[];  debugLeakDetected: boolean;  pieceMismatchDetected: boolean;  unsupportedClaimDetected: boolean;  fallbackReason?: string;};


## 7.3 Safe Fallback Principle

Fallback text must still teach chess. It must never show raw debug facts. Example: use "Play Nf3. This develops your knight toward active central squares." instead of "Verified move: Nf3 (g1f3) knight from g1 moves to f3."


# 8. Versioned Technical Roadmap: v2.7.39.0 to v2.9.x

**Version / Stage**

**Purpose**

**Must Ship**

**Hard Exit Gate**

**v2.7.39.0**

**Stable checkpoint**

**Source-only commit and tag.**

**All current validation passes.**

**v2.7.39.1**

**Target lock and debug hardening**

**LockedContinuationCandidate, instructionFrameKey, fixed terminal warnings.**

**No target drift or false terminal critical.**

**v2.7.39.2**

**Brain facade**

**analyzeBlundrPosition wraps existing modules.**

**Brain output available but behavior unchanged.**

**v2.7.39.3**

**Coach behind Brain**

**coachExplanationPipeline consumes BrainAnalysis.**

**Coach output parity or improvement on golden positions.**

**v2.7.39.4**

**Debug behind Brain**

**Feature/plan/opportunity debug from Brain.**

**No competing debug realities.**

**v2.7.39.5**

**Universal candidate scoring**

**Continuation candidates scored by Brain.**

**Legal stable candidate with score breakdown.**

**v2.7.39.6**

**Board feature engine v1**

**Attack maps, king safety, pawn structure, piece quality.**

**100 FEN deterministic feature tests pass.**

**v2.7.39.7**

**Tactical motif engine v1**

**Check, mate, capture, recapture, loose pieces, forks/pins when verified.**

**No unverified tactic claims.**

**v2.7.40**

**Blundr Brain v1 stable**

**Unified Brain owns coach and debug.**

**Universal coach works across unknown openings.**

**v2.7.41**

**Engine validation layer**

**Stockfish validates tactical safety and blunder risk.**

**Engine disagreement handled safely.**

**v2.7.42**

**Threat and mistake explanation**

**Wrong-move feedback with verified causes.**

**Mistake feedback is specific and safe.**

**v2.7.43**

**Phase-aware coaching**

**Opening/middlegame/endgame priorities.**

**Same move type explained by phase.**

**v2.8.0**

**Opening registry enrichment**

**Structured rules enrich universal Brain.**

**Coach works without registry, improves with registry.**

**v2.8.1**

**Plan graph**

**Multi-move plan chains and progress.**

**Coach can explain current move as step in a plan.**

**v2.8.2**

**Alternative comparison**

**Compare target with another reasonable move.**

**Safe contrast explanations pass tests.**

**v2.8.3**

**Adaptive user model**

**Track weak motifs, hint/reveal use, recall performance.**

**Hints/reviews adapt to real behavior.**

**v2.8.4**

**Intelligence-generated training modes**

**Find plan, spot threat, choose candidate, fix blunder.**

**Exercises generated from verified Brain evidence.**

**v2.9.0**

**Universal Coach v2**

**Plan-aware, tactic-aware, adaptive, engine-validated coach.**

**Premium coach milestone.**

**v2.9.x**

**Product expansion foundation**

**PGN import, lesson generation, spaced repetition, account sync.**

**Ready for App Store MVP buildout.**


## 8.1 v2.7.39.1 Detailed Instructions

Implement lockedContinuationCandidate in runtime state/ref.

Lock candidate by fen4, trainingMode, sideToMove, userColor, and selected source.

Prevent engine preview and explorer data from replacing official target unless unlock rules are met.

Add instructionFrameKey to debug, timeline, presentation, and tests.

Fix terminal_surface_missing false critical.

Suppress feature/plan/opportunity warnings on no-target frames.

Split fallback counts into instructional, opponent status, and terminal.

Update Coach Timeline to distinguish official instructional entries from candidate previews.


## 8.2 v2.7.39.2 Detailed Instructions

Create lib/blundr/brain/analyzeBlundrPosition.ts.

Create Brain input/output types.

Wrap existing geometry/features/plans/opportunity/explanation modules without deleting old files.

Add brainDebug with per-layer status, timings, cache keys, and fallback reasons.

Keep app behavior unchanged; only expose Brain in debug initially.


## 8.3 v2.7.39.3 Detailed Instructions

Make coachExplanationPipeline a compatibility wrapper around BrainAnalysis.

Add parity tests comparing old coach output and Brain output on golden positions.

Brain must never choose a target different from CurrentInstructionFrame.

Preserve all current passing tests.

Improve explanations only where evidence supports improvement.


## 8.4 v2.7.39.4 Detailed Instructions

Replace legacy feature/plan/opportunity debug packets with Brain-derived packets.

Remove obsolete not_exposed_from_module warnings when Brain is active.

Make Brain pipeline and Coach Timeline the authoritative debug source.

Mark legacy debug sections as deprecated or map them to Brain data.


## 8.5 v2.7.39.5 Detailed Instructions

Score continuation legal moves with tactical, material, center, development, king safety, piece activity, plan, and risk scores.

Expose scoreBreakdown for selected candidate.

Reject illegal or unsafe candidates.

Lock selected candidate for the frame.

Coach explanation must cite the winning evidence category.


# 9. Product Roadmap After Coach Gate

These stages are blocked until the Coach Perfection Gate passes. Each product layer must consume Brain outputs rather than creating its own move logic.

**Version / Stage**

**Purpose**

**Must Ship**

**Hard Exit Gate**

**Stage 2 Lesson Runtime**

**Turn lines into real training sessions.**

**TrainingFrameKind, branch exhaustion, Continue from here.**

**Full lesson to continuation works.**

**Stage 3 Lesson Library**

**Five polished MVP openings.**

**Italian, Queen’s Gambit, London, Caro-Kann, beginner Sicilian.**

**All lessons legal and review-tagged.**

**Stage 4 Onboarding**

**First taught move in under 60 seconds.**

**Skill, goals, side, recommended lesson, demo.**

**New user succeeds quickly.**

**Stage 5 Guest Persistence**

**Local-first progress before account.**

**Guest ID, progress, review queue, streak, settings.**

**Refresh does not lose progress.**

**Stage 6 Review Queue**

**Automatic spaced review from mistakes.**

**ReviewItem schema, SRS, assisted/recall/motif modes.**

**Misses become useful review items.**

**Stage 7 Gamification**

**Premium daily motivation.**

**Streak, XP, daily goal, mastery, badges.**

**Clear reason to return daily.**

**Stage 8 Accounts**

**Optional account after value.**

**Apple sign-in/email, guest merge, sync.**

**No progress loss.**

**Stage 9 Dashboard**

**Next best action.**

**Review due, continue lesson, recommended lesson.**

**User never wonders what to do next.**

**Stage 10 Board Polish**

**Premium mobile training board.**

**Assisted, Recall, Review, Continuation modes.**

**Board/visuals smooth and aligned.**

**Stage 11 UI/UX Polish**

**Apple-like premium interface.**

**No debug text, mobile responsive, clean copy.**

**App feels shippable.**

**Stage 12 QA/Beta**

**Regression and beta readiness.**

**E2E, golden flows, persistence tests, mobile smoke.**

**No critical debug issues.**

**Stage 13 iOS Packaging**

**Capacitor wrapper.**

**iOS project, icons, splash, storage.**

**Runs in simulator/device.**

**Stage 14 TestFlight**

**Real-user validation.**

**10-25 beta users, feedback, metrics.**

**No critical runtime bugs.**

**Stage 15 App Store**

**Public MVP release.**

**Assets, privacy, support, final QA.**

**Ready for review.**


## 9.1 Review Queue Must Use Brain Evidence

Review items should be created from Brain-verified themes and mistakes, not generic wrong-move states. A ReviewItem should include fenBefore, targetUci, targetSan, theme, evidenceTags, mistakeType, and source lesson.


## 9.2 Gamification Must Reward Correct Learning Signals

XP and mastery should not reward raw move completion alone. They should reward verified recall, reduced hint/reveal reliance, successful review, and mastery of concepts.


# 10. Testing, Golden Positions, QA, and Telemetry

## 10.1 Required Test Suites

coach-quality tests

trainer-debug tests

multi-move QA tests

Brain layer unit tests

golden position tests

browser/e2e tests

timeline integrity tests

candidate lock tests

persistence tests

review queue tests

account merge tests

mobile smoke tests


## 10.2 Golden Position Suite

Initial position e4: central pawn advance, Claim the center.

Italian Nf3: minor piece development, center support or castling prep with matching text.

Italian Bc4: bishop activation, active diagonal, optional f7 pressure only if verified.

Italian c3: prepare d4 break through opening enrichment or pawn-break detector.

Kingside castling: castle_king_safety, no "improves your king" copy.

Re1 behind central pawn: support central play.

Capture scenario: capture_or_recapture, material balance, no unverified initiative.

Check scenario: forcing move, legal check verified.

Checkmate scenario: checkmate, no legal reply.

Wrong piece mistake: correct target feedback.

Wrong square mistake: correct destination feedback.

Continuation after branch exhaustion: locked legal candidate.

Terminal frame: no false terminal_surface_missing.

No-target opponent frame: no feature/plan missing warnings.

Unknown opening position: generic universal Brain explanation without registry.


## 10.3 Telemetry Events

brain_analysis_complete: latency, cacheHit, status, selectedOpportunityScore.

brain_safety_linter_triggered: blocked claim type and fallback reason.

target_lock_violation: fen4, old target, new target, trigger.

coach_provenance_inconsistent: theme/template/score mismatch.

review_item_created: mistake type, theme, evidence tags.

user_hint_used: frame key, theme.

user_reveal_used: frame key, theme.

session_completed: lesson, continuation depth, review count.


## 10.4 Browser QA Master Flow

Clear localStorage and sessionStorage.

Complete onboarding only after coach gate is passed.

Load first lesson.

Play through guided line.

Verify coach/visual/reveal target equality on each user frame.

Click Continue from here.

Verify continuation candidate locks.

Make at least one mistake and verify feedback/review insertion after Review Queue exists.

Continue to terminal.

Export Coach Timeline JSON and QA summary.

Confirm no debug leaks, target mismatches, piece mismatches, or false terminal criticals.


# 11. Performance, Caching, and Runtime Safety

## 11.1 Brain Cache Strategy

brainCacheKey = fen4 + "|" + targetUci + "|" + trainingMode + "|" + selectedOpeningId + "|" + includeTactics + "|" + includeStrategy + "|" + includePlans

Use LRU cache with max 200 entries.

Cache BoardIntelligence by fen4.

Cache MoveDelta by fen4 + targetUci.

Cache explanation only after safety passes.

Invalidate on repertoire change, lesson change, opening registry version change, or engine configuration change.

Debug panel must read cache state but never mutate runtime state.


## 11.2 Performance Budgets

**Field**

**Specification**

**Board intelligence**

**< 20ms typical, cached by fen4.**

**Move delta**

**< 15ms typical.**

**Tactical motifs**

**< 25ms without engine.**

**Full Brain analysis**

**< 80ms on mid-tier mobile for target frame without Stockfish.**

**Stockfish validation**

**Async, bounded movetime, never blocks UI target lock.**

**Debug snapshot**

**< 20ms typical; heavy fields bounded.**


## 11.3 Runtime Safety Rules

Brain analysis must be pure relative to input.

No Brain function mutates board state outside local Chess instance.

Async engine results must include requestId and baseFen4.

Stale engine results must not replace locked target.

All UI actions use current instructionFrameKey.

Debug views are read-only.


# 12. Redundancy Removal and Deprecation Plan

**Version / Stage**

**Purpose**

**Must Ship**

**Hard Exit Gate**

**coachExplanationPipeline**

**Keep as compatibility wrapper.**

**Call Brain internally.**

**Earliest deletion after v2.7.40 parity.**

**coachDecisionEngine**

**Migrate useful logic into Brain or deprecate.**

**Prevent surface ownership.**

**After Brain owns coach and debug.**

**intentFirstCoachEngine**

**Inventory and decide.**

**Wrap useful intent logic or deprecate.**

**After parity tests.**

**liveCoach/***

**Migrate high-value templates/logic.**

**No direct production path.**

**After v2.8.0.**

**legacy feature/plan debug**

**Map to Brain debug or mark deprecated.**

**No active warnings from deprecated paths.**

**After v2.7.39.4.**

**old visual target derivation**

**Remove target-choosing role.**

**Visual only consumes CurrentInstructionFrame target.**

**After target parity tests.**

**old continuation candidate derivation**

**Wrap into Brain candidate scoring or deprecate.**

**Locked candidate owns official target.**

**After v2.7.39.5.**

No deletion is allowed until tests prove the Brain path matches or improves the old path and no production surface consumes the old path directly.


# 13. Codex/Engineering Execution Prompts

## 13.1 Stage 1A Prompt: Coach Architecture Inventory

Create docs/BLUNDR_COACH_ARCHITECTURE_INVENTORY.md and docs/BLUNDR_BRAIN_INCORPORATION_MAP.md. Inventory every coach, feature, plan, opportunity, explanation, presentation, visual, and debug module. Classify each as active_runtime, active_debug_only, dormant, duplicated, legacy, or candidate_for_brain. Do not change runtime behavior. Return module map, overlaps, and earliest safe deletion version.


## 13.2 v2.7.39.1 Prompt: Target Locking and Debug Hardening

Implement LockedContinuationCandidate and instructionFrameKey. Ensure same FEN cannot produce multiple official instruction targets across re-renders or engine preview arrivals. Fix false terminal_surface_missing. Suppress missing pipeline warnings on terminal/opponent/no-target frames. Split fallback counts. Run full validation suite.


## 13.3 v2.7.39.2 Prompt: Brain Facade

Create lib/blundr/brain/analyzeBlundrPosition.ts. Wrap existing geometry/features/plans/opportunity/explanation modules. Expose BlundrBrainAnalysis in debug but do not change UI behavior. Add tests for deterministic Brain output on golden FENs.


## 13.4 v2.7.39.3 Prompt: Coach Pipeline Migration

Make coachExplanationPipeline consume BlundrBrainAnalysis. Preserve external API. Add parity tests comparing current visible coach behavior with Brain-rendered coach. Brain must never choose a target that differs from CurrentInstructionFrame.target.


## 13.5 v2.7.39.5 Prompt: Candidate Scoring

Replace continuation candidate selection with Brain candidate scoring. Score legal moves by tactics, material, center, development, king safety, piece activity, plan fit, and risk. Lock selected candidate. Expose scoreBreakdown. Reject stale async engine replacements.


# 14. Final Release Gates and App Store MVP Definition

## 14.1 Coach Gate

[ ] CurrentInstructionFrame target is stable.

[ ] instructionFrameKey exists and is logged.

[ ] coach/visual/reveal/hint target equality holds.

[ ] BlundrBrain facade exists.

[ ] coach consumes Brain output.

[ ] debug consumes Brain output.

[ ] no unclassified coach module remains.

[ ] no parallel surface ownership remains.

[ ] golden position suite passes.

[ ] browser guided-to-continuation-to-terminal flow passes.


## 14.2 App Store MVP Definition

A new user can start training within 60 seconds.

The user can complete a full lesson and continue from the end of book.

The coach is accurate, useful, and never mismatched with board visuals.

Mistakes create review items.

Review Queue helps the user recall weak moves and motifs.

Progress persists locally and can merge into account.

Dashboard tells the user what to do next.

Mobile board is smooth, clean, and readable.

Production build contains no debug UI or internal jargon.


# Appendix A: Minimal Data Contracts

type CurrentInstructionTarget = {  uci: string;  san: string;  from: string;  to: string;  pieceType: "p" | "n" | "b" | "r" | "q" | "k";  fenBefore: string;  resultingFen?: string;  isCapture?: boolean;  isCheck?: boolean;  isMate?: boolean;  isCastle?: boolean;  source: "guided" | "branch" | "continuation" | "brain" | "fallback";};

type BrainSummary = {  totalEvidenceScore: number;  highestOpportunityScore: number | null;  selectedTheme: string | null;  fallbackUsed: boolean;  fallbackReason: string | null;  analysisMs: number;  cacheHit: boolean;};

type CoachTimelineSummary = {  totalFrames: number;  officialInstructionalFrames: number;  candidatePreviewCount: number;  duplicateOfficialTargetCount: number;  totalFallbackCount: number;  instructionalFallbackCount: number;  opponentStatusFallbackCount: number;  terminalFallbackCount: number;  lowQualityCount: number;  debugLeakCount: number;  pieceMismatchCount: number;  targetMismatchCount: number;  averageInstructionalQualityScore: number | null;};


# Appendix B: Immediate Next-Step Checklist

[ ] Run checkpoint script and commit source-only checkpoint.

[ ] Upload final checkpoint ZIP for audit.

[ ] Implement v2.7.39.1 target locking and debug hardening.

[ ] Create architecture inventory and Brain incorporation map.

[ ] Implement BlundrBrain facade with existing modules only.

[ ] Migrate coach pipeline behind Brain.

[ ] Unify debug behind Brain.

[ ] Implement universal candidate scoring.

[ ] Pass golden positions and browser QA.

[ ] Only then resume product-layer roadmap.


# Appendix C: Done Means Done

A stage is not done because the app builds. A stage is done only when code, tests, debug output, browser behavior, and handoff documentation all agree. If debug says one thing and the UI does another, the stage is not done. If the coach sounds good but provenance is wrong, the stage is not done. If the Brain produces evidence but presentation ignores it, the stage is not done. If user-facing copy is polished but unsupported, the stage is not done.
