# BLUNDR STAGE 2 IMPLEMENTATION ROADMAP

## Opening Curriculum, Feature Detection, Concept Mapping, and Coaching Intelligence Layer

**Project:** Blundr  
**Stage:** Stage 2  
**Stage Name:** Opening Curriculum, Feature Detection, Concept Mapping, and Coaching Intelligence Layer  
**Prerequisite Checkpoint:** `checkpoint/v2.8.0-coaching-stage-stable`  
**Target Checkpoint:** `checkpoint/v2.9.0-curriculum-concept-mapping-stable`  
**Primary Objective:** Move Blundr from a safe move explainer into a structured chess coaching system that can identify the best teachable concept for each target move using board features, curriculum metadata, tactical motifs, strategic plans, and user-level-appropriate explanation rules.

---

# 0. Executive Summary

Stage 1 stabilizes the coach surface and provider pipeline. Stage 2 builds the actual chess knowledge layer underneath it.

The current app can now reliably do the following:

```txt
Guided line
→ Line complete
→ Continue from Here
→ Continuation mode
→ Maia opponent reply
→ User-turn continuation candidate
→ CoachCard + board visuals
→ Terminal/checkmate handling
```

The major remaining limitation is that Blundr is still mostly explaining moves using broad, fallback-heavy labels such as:

```txt
Active Piece Development
Avoid Blocking Center Pawn
Improve your position
Continue the position
```

These are safe, but they are not yet the level of a serious chess coach.

Stage 2 must add the structured layer that maps:

```txt
Board state
+ Move facts
+ Tactical features
+ Strategic features
+ Opening plan metadata
+ Curriculum objective
+ User level
+ Visual recipe mapping
→ Best coachable concept
→ Safe explanation
→ Matching board visuals
```

Stage 2 should be implemented carefully and incrementally. It should not replace the stable Stage 1 target pipeline. It should explain the already-selected target move, not independently choose a different target.

---

# 1. Stage 2 Definition of Done

Stage 2 is complete only when Blundr can do all of the following:

```txt
1. Load structured opening curriculum data.
2. Identify opening, line, variation, plan, and lesson objective.
3. Extract board/move features from the current position.
4. Detect tactical, strategic, opening-plan, and positional features.
5. Map verified features to coachable concepts.
6. Rank concepts by instructional value.
7. Select the best coachable concept for the current move.
8. Generate beginner/intermediate/advanced-safe coach copy.
9. Generate visual recipes tied to the selected concept.
10. Avoid unsupported chess claims.
11. Fall back gracefully when evidence is weak.
12. Produce debug traces explaining why a concept was selected.
13. Keep CurrentInstructionFrame as target authority.
14. Preserve Stage 1 invariants.
15. Avoid generic visible labels when a specific mapped concept exists.
16. Avoid stale visuals, stale explanations, and stale concept IDs.
17. Support Italian Game as the first fully mapped flagship curriculum module.
```

The final live debug should show:

```json
{
  "criticalIssues": [],
  "warnings": [],
  "advancedFeaturePacketExists": true,
  "strategicPlanPacketExists": true,
  "selectedOpportunityId": "non-null on teaching frames",
  "selectedPlanId": "non-null when opening plan metadata applies",
  "selectedConceptId": "non-null on teaching frames"
}
```

---

# 2. Non-Negotiable Architecture Rules

## 2.1 CurrentInstructionFrame Remains the Target Authority

Stage 2 must not change target authority.

The target move still comes from:

```txt
CurrentInstructionFrame.target
```

Stage 2 may explain the move. Stage 2 may classify the move. Stage 2 may map it to concepts. But Stage 2 must not independently select a different move for the UI.

On every teaching frame:

```txt
instructionTargetUci === coachMoveUci === visualMoveUci === revealTargetUci
instructionTargetPieceType === coachPieceType
```

Stage 2 must never do this:

```txt
feature detector selects one move
coach copy describes another move
visual recipe points to a third move
```

## 2.2 Stage 2 Explains and Ranks Concepts, Not Targets

Target selection remains Stage 1/continuation architecture.

Stage 2 answers:

```txt
What is the most useful concept to teach for this already-selected target?
```

It does not answer:

```txt
What move should the user play?
```

The only exception is future stages where curriculum selection may pick the next lesson line. That is outside Stage 2.

## 2.3 No Direct UI Bypass

The following may not directly drive visible coach/visual/action UI unless promoted through the proper surface path:

```txt
raw feature detector output
raw tactical detector output
raw opening-plan match
raw engine preview
raw Maia output
raw Stockfish output
legacy expectedMove
cached visual recipe
previous selected concept
previous selected candidate
```

## 2.4 Safety Before Specificity

Stage 2 should improve coach specificity, but never by allowing unsupported claims.

If evidence is weak:

```txt
Use safe fallback.
Do not hallucinate.
Do not claim tactics, threats, center tension, or long-term plans without evidence.
```

---

# 3. Stage 2 High-Level Architecture

Implement this pipeline:

```txt
CurrentInstructionFrame.target
        ↓
BoardTruth / MoveDelta
        ↓
FeatureGraphBuilder
        ↓
TacticalFeatureDetector
StrategicFeatureDetector
OpeningPlanDetector
PieceActivityDetector
PawnStructureDetector
KingSafetyDetector
CenterControlDetector
        ↓
EvidenceGraph
        ↓
ConceptRegistry
        ↓
FeatureToConceptMapper
        ↓
CoachableConceptRanker
        ↓
ConceptConditionedCopyBuilder
        ↓
ConceptVisualRecipeMapper
        ↓
VisibleTeachingSurface
```

Recommended module grouping:

```txt
lib/blundr/curriculum/
lib/blundr/features/
lib/blundr/concepts/
lib/blundr/mapping/
lib/blundr/plans/
lib/blundr/visuals/
lib/blundr/explanation/
lib/blundr/debug/
tests/coach/
tests/curriculum/
tests/features/
tests/mapping/
```

---

# 4. Required New Core Data Types

## 4.1 Curriculum Opening Module

Create:

```txt
lib/blundr/curriculum/types.ts
```

```ts
export type DifficultyBand =
  | "beginner"
  | "intermediate"
  | "advanced";

export type OpeningSide = "white" | "black";

export type OpeningModule = {
  openingId: string;
  displayName: string;
  side: OpeningSide;
  eco?: string[];
  family: string;
  description: string;

  beginnerGoal: string;
  intermediateGoal: string;
  advancedGoal: string;

  coreConceptIds: string[];
  planIds: string[];
  lineIds: string[];

  tags: string[];
};
```

Example:

```ts
{
  openingId: "italian-white",
  displayName: "Italian Game",
  side: "white",
  eco: ["C50", "C53", "C54"],
  family: "open-game",
  description: "A classical opening focused on rapid development, central control, king safety, and pressure on f7.",
  beginnerGoal: "Develop pieces, castle, and understand why Bc4 points at f7.",
  intermediateGoal: "Learn c3/d4 central expansion and Re1 support.",
  advancedGoal: "Recognize tactical pressure, timing of d4, and common continuation plans.",
  coreConceptIds: [
    "rapid-development",
    "bishop-pressure-f7",
    "castle-before-center-opens",
    "prepare-d4-break",
    "rook-supports-center"
  ],
  planIds: ["italian-main-plan-white"],
  lineIds: ["italian-classical-mainline"]
}
```

---

## 4.2 Opening Line

```ts
export type OpeningLine = {
  lineId: string;
  openingId: string;
  displayName: string;
  side: OpeningSide;
  startFen?: string;

  moves: CurriculumMove[];

  branchCompletePolicy: BranchCompletePolicy;
  continuationPolicy: CurriculumContinuationPolicy;

  lessonObjectiveIds: string[];
  conceptIds: string[];
  planIds: string[];

  difficulty: DifficultyBand;
  tags: string[];
};
```

---

## 4.3 Curriculum Move

```ts
export type CurriculumMove = {
  ply: number;
  san: string;
  uci: string;
  side: "white" | "black";

  role:
    | "user_teaching_move"
    | "opponent_reply"
    | "branch_transition"
    | "terminal";

  conceptIds: string[];
  planStepIds: string[];
  featureHints: string[];

  expectedFeatureIds?: string[];
  expectedTacticalMotifs?: string[];
  expectedStrategicMotifs?: string[];

  beginnerExplanation?: string;
  intermediateExplanation?: string;
  advancedExplanation?: string;

  visualRecipeHints?: string[];
};
```

---

## 4.4 Concept Registry

Create:

```txt
lib/blundr/concepts/conceptRegistry.ts
```

```ts
export type ConceptFamily =
  | "development"
  | "center"
  | "king_safety"
  | "tactics"
  | "pawn_structure"
  | "piece_activity"
  | "opening_plan"
  | "calculation"
  | "end_condition"
  | "continuation";

export type CoachableConcept = {
  conceptId: string;
  label: string;
  family: ConceptFamily;

  beginnerLabel: string;
  intermediateLabel: string;
  advancedLabel: string;

  description: string;

  requiredEvidence: EvidenceRequirement[];
  optionalEvidence: EvidenceRequirement[];

  blockedWithoutEvidence: string[];

  allowedTemplateIds: string[];
  visualRecipeTypes: VisualRecipeType[];

  priority: number;

  safeCopy: {
    beginner: string;
    intermediate: string;
    advanced: string;
  };

  fallbackCopy: string;

  tags: string[];
};
```

---

## 4.5 Evidence Requirement

```ts
export type EvidenceRequirement = {
  evidenceType:
    | "move_fact"
    | "board_feature"
    | "tactical_motif"
    | "strategic_motif"
    | "opening_plan"
    | "curriculum_metadata"
    | "engine_validation"
    | "maia_context";

  key: string;

  requiredValue?: string | boolean | number;

  minConfidence?: number;
};
```

---

## 4.6 Feature Graph

Create:

```txt
lib/blundr/features/featureGraph.ts
```

```ts
export type FeatureGraph = {
  fen4: string;
  targetUci: string | null;
  targetSan: string | null;
  sideToMove: "w" | "b";

  moveFacts: MoveFacts | null;

  tacticalFeatures: TacticalFeature[];
  strategicFeatures: StrategicFeature[];
  centerFeatures: CenterFeature[];
  kingSafetyFeatures: KingSafetyFeature[];
  pawnStructureFeatures: PawnStructureFeature[];
  pieceActivityFeatures: PieceActivityFeature[];
  openingPlanFeatures: OpeningPlanFeature[];

  evidenceClaims: EvidenceClaim[];

  confidenceSummary: {
    tactical: number;
    strategic: number;
    openingPlan: number;
    safety: number;
  };
};
```

---

## 4.7 Move Facts

```ts
export type MoveFacts = {
  uci: string;
  san: string;
  from: string;
  to: string;

  pieceType:
    | "pawn"
    | "knight"
    | "bishop"
    | "rook"
    | "queen"
    | "king";

  side: "white" | "black";

  isCapture: boolean;
  capturedPieceType?: string;

  isCheck: boolean;
  isCheckmate: boolean;
  isCastle: boolean;
  isPromotion: boolean;
  isEnPassant: boolean;

  sourceWasBackRankMinorPiece: boolean;
  destinationIsCenter: boolean;
  destinationIsExtendedCenter: boolean;
  movedIntoOpponentHalf: boolean;
  movedTowardKing: boolean;

  opensLineForPiece: boolean;
  blocksOwnPiece: boolean;
  attacksNewPiece: boolean;
  defendsNewPiece: boolean;

  legalBeforeMove: boolean;
  fenBefore: string;
  fenAfter: string;
};
```

---

# 5. Required Feature Detection Taxonomy

Stage 2 must implement feature detectors in layers. Do not attempt to implement perfect chess intelligence immediately. Implement deterministic, testable, evidence-producing detectors.

---

## 5.1 Move Fact Detector

Create:

```txt
lib/blundr/features/detectMoveFacts.ts
```

Required detections:

```txt
SAN
UCI
piece type
from square
to square
side
capture
captured piece
check
checkmate
castle
promotion
en passant
source square occupied before move
destination square occupied before move
legal before move
fen before
fen after
```

Also detect:

```txt
minor piece development
king castling
rook activation
queen activation
central pawn advance
central capture
recapture
retreat
same-piece reroute
```

Definitions:

```txt
minor piece development:
  knight or bishop moves from home/back-rank starting square to active square.

central pawn advance:
  pawn moves to e4, d4, e5, d5, c4, f4, c5, f5.

central capture:
  move captures on e4, d4, e5, d5, c4, f4, c5, f5.

recapture:
  destination square was occupied by a piece that just moved/captured in previous ply, if previous move metadata exists.
```

---

## 5.2 Center Control Detector

Create:

```txt
lib/blundr/features/detectCenterFeatures.ts
```

Detect:

```txt
central pawn advance
central capture
center occupation
center support
center pressure
center tension
pawn break
preparing pawn break
opening central file
blocking center
exchanging central pawn
```

Core squares:

```txt
e4, d4, e5, d5
```

Extended center:

```txt
c3, c4, c5, c6,
d3, d6,
e3, e6,
f3, f4, f5, f6
```

Evidence rules:

### Safe center claim

Can say:

```txt
controls the center
challenges the center
captures in the center
supports the center
```

only if one of these is true:

```txt
pawn moves to core/extended center
piece moves to attack core center square
capture occurs on core/extended center square
piece defends own central pawn
move opens line toward center
curriculum metadata explicitly marks center concept
```

### Center tension claim

Can say:

```txt
creates center tension
keeps central tension
releases central tension
```

only if:

```txt
opposing pawns attack each other in the center
or move creates/removes pawn contact involving d/e/c/f pawns
or curated metadata explicitly tags center_tension
```

### Pawn break claim

Can say:

```txt
prepares d4
prepares e4
supports d4 break
```

only if:

```txt
opening plan metadata says this move prepares the break
or move places support behind a future central pawn move
or move clears the square/path for that pawn break
```

Example Italian mapping:

```txt
c3 can map to prepare-d4-break.
Re1 can map to support-e4/d4 central play.
d4 maps to central break/challenge center.
```

---

## 5.3 Development Detector

Create:

```txt
lib/blundr/features/detectDevelopmentFeatures.ts
```

Detect:

```txt
knight development
bishop development
queen development
rook development
king safety development
piece moved from starting square
piece moved to active square
piece moved twice in opening
piece returned home
develops with tempo
develops while attacking
```

Starting squares:

White:

```txt
knights: b1, g1
bishops: c1, f1
rooks: a1, h1
queen: d1
king: e1
```

Black:

```txt
knights: b8, g8
bishops: c8, f8
rooks: a8, h8
queen: d8
king: e8
```

Development copy allowed:

```txt
develops the knight
develops the bishop
brings a piece into play
activates the bishop
places the knight on a more active square
```

Only say:

```txt
develops with tempo
```

if move attacks a higher-value piece or gives check.

---

## 5.4 King Safety Detector

Create:

```txt
lib/blundr/features/detectKingSafetyFeatures.ts
```

Detect:

```txt
castling
king moved to safety
rook connected by castling
king remains in center
open file near king
missing pawn shield
king-side pawn shield
attack near king
check
checkmate
escape square
back-rank weakness
```

Safe claims:

```txt
Castle kingside. This moves your king toward safety.
This gives check.
This is checkmate.
```

Only say:

```txt
weakens the king
creates a kingside attack
opens lines toward the king
```

if evidence exists:

```txt
line opened toward king
attacking piece added near king
pawn shield removed
king is in check
tactical motif detected
```

---

## 5.5 Piece Activity Detector

Create:

```txt
lib/blundr/features/detectPieceActivityFeatures.ts
```

Detect:

```txt
piece mobility increased
piece mobility decreased
piece moved to open diagonal
bishop activated
bishop blocked
knight centralized
knight to rim
rook to open file
rook to semi-open file
queen activated
piece attacks target
piece defends target
piece improves coordination
piece is loose
piece is pinned
piece is trapped
```

Implementation can be approximate but must be testable.

Mobility estimate:

```txt
count legal destinations for piece before move
count legal destinations for piece after move
activityDelta = after - before
```

Open diagonal:

```txt
bishop/queen diagonal has fewer blockers after move
```

Open file:

```txt
rook/queen file has no friendly pawns and maybe no pawns
```

Semi-open file:

```txt
file has no friendly pawn but may have enemy pawn
```

Knight centralization:

```txt
knight moves to c3, d2, d4, e2, e4, f3, c6, d7, d5, e7, e5, f6
```

Knight rim:

```txt
knight moves to a-file or h-file
```

Only say “outpost” if:

```txt
knight/bishop on protected square
cannot be attacked by enemy pawns
advanced square
```

If that is too complex for this stage, scaffold but do not use user-facing copy yet.

---

## 5.6 Pawn Structure Detector

Create:

```txt
lib/blundr/features/detectPawnStructureFeatures.ts
```

Detect:

```txt
isolated pawn
doubled pawn
backward pawn
passed pawn
connected pawn
pawn chain
pawn break
pawn capture toward center
pawn capture away from center
creates open file
creates semi-open file
changes pawn majority
```

Stage 2 user-facing claims should be conservative.

Safe claims:

```txt
This captures toward the center.
This opens a file.
This supports your center.
```

Require stronger evidence for:

```txt
creates a weakness
creates a passed pawn
improves pawn structure
damages pawn structure
```

---

## 5.7 Tactical Motif Detector

Create:

```txt
lib/blundr/features/detectTacticalMotifs.ts
```

Implement motif detection incrementally but comprehensively scaffold the registry.

Required motif types:

```txt
check
checkmate
capture
recapture
fork
pin
skewer
discovered attack
discovered check
double attack
deflection
decoy
overload
remove defender
clearance
interference
zwischenzug
trapped piece
back-rank mate
Greek gift / Bxh7+ pattern
mating net
hanging piece
loose piece
```

Stage 2 must at minimum implement reliable detection for:

```txt
check
checkmate
capture
recapture
fork basic
pin basic
hanging piece basic
Greek gift pattern metadata detection
```

### 5.7.1 Fork Detection

A move creates a fork if after the move, the moved piece attacks at least two enemy pieces where:

```txt
enemy targets include king, queen, rook, or two major/minor pieces
```

Priority:

```txt
king + queen
king + rook
king + minor
queen + rook
queen + minor
two rooks
```

Safe copy:

```txt
This attacks multiple pieces.
```

Only say “fork” if detector confidence is high.

### 5.7.2 Pin Detection

A pin exists if:

```txt
attacking sliding piece attacks through an enemy piece to a higher-value piece/king
```

Sliding pieces:

```txt
bishop, rook, queen
```

Pin line:

```txt
attacker → pinned piece → king/queen/rook
```

Safe copy:

```txt
This lines up pressure along the file/diagonal.
```

Only say “pins” if king or high-value piece is confirmed behind.

### 5.7.3 Skewer Detection

A skewer exists if:

```txt
attacker → high-value piece → lower-value piece behind
```

Stage 2 may scaffold but avoid user-facing “skewer” unless confidence high.

### 5.7.4 Discovered Attack

Detect if moving a piece opens a line from another friendly sliding piece to an enemy target.

Safe copy:

```txt
This opens a line for another piece.
```

Only say “discovered attack” if target is verified.

### 5.7.5 Remove Defender

Detect if move captures a piece that was defending a valuable target.

Requires:

```txt
captured piece was defending a piece/square
that defended target matters to immediate tactic or mate
```

Stage 2 may scaffold but not user-facing unless evidence high.

### 5.7.6 Greek Gift Pattern

For bishop capture on h7/h2:

White Greek Gift candidate:

```txt
Bxh7+
white bishop captures h7
black king on g8 or nearby
white knight can go g5/e5
queen can access h5/h3
```

Black equivalent:

```txt
Bxh2+
```

Stage 2 should not overclaim “Greek Gift sacrifice” unless curriculum metadata or high-confidence pattern.

Safe copy:

```txt
This gives check and pulls the king toward the edge.
```

Only say “Greek Gift idea” if concept metadata marks it.

---

## 5.8 Opening Plan Detector

Create:

```txt
lib/blundr/plans/openingPlanRegistry.ts
lib/blundr/plans/detectOpeningPlanFeatures.ts
```

The opening plan system is the biggest Stage 2 unlock.

For each opening, define plan steps.

Example Italian Game white plan:

```ts
{
  planId: "italian-main-plan-white",
  openingId: "italian-white",
  label: "Italian main development plan",
  steps: [
    {
      planStepId: "occupy-center-e4",
      conceptId: "center-control-e4",
      expectedMoves: ["e2e4"],
      explanation: "White starts by claiming central space."
    },
    {
      planStepId: "develop-kingside-knight",
      conceptId: "develop-knight-f3",
      expectedMoves: ["g1f3"],
      explanation: "The knight develops and supports the center."
    },
    {
      planStepId: "activate-bishop-c4",
      conceptId: "bishop-pressure-f7",
      expectedMoves: ["f1c4"],
      explanation: "The bishop develops to an active diagonal and points at f7."
    },
    {
      planStepId: "castle-king-safety",
      conceptId: "castle-before-center-opens",
      expectedMoves: ["e1g1"],
      explanation: "White castles before opening the center."
    },
    {
      planStepId: "prepare-d4-with-c3",
      conceptId: "prepare-d4-break",
      expectedMoves: ["c2c3"],
      explanation: "c3 supports the later d4 break."
    },
    {
      planStepId: "support-center-with-re1",
      conceptId: "rook-supports-center",
      expectedMoves: ["f1e1"],
      explanation: "Re1 supports central play and aligns with the e-file."
    },
    {
      planStepId: "central-break-d4",
      conceptId: "d4-central-break",
      expectedMoves: ["d2d4", "d3d4"],
      explanation: "d4 challenges Black's center."
    }
  ]
}
```

The detector should return:

```ts
export type OpeningPlanFeature = {
  planId: string;
  planStepId: string;
  conceptId: string;
  matchedMoveUci: string;
  confidence: number;
  source: "curriculum_metadata" | "sequence_match" | "position_match";
};
```

---

# 6. Required Concept Families and Mappings

Create an initial concept registry with at least the following.

## 6.1 Development Concepts

```txt
develop-knight
develop-bishop
activate-bishop-diagonal
develop-with-tempo
avoid-moving-same-piece-too-often
connect-rooks
rook-to-center
queen-activation
```

## 6.2 Center Concepts

```txt
occupy-center
challenge-center
support-center
prepare-d4-break
prepare-e4-break
central-capture
maintain-center-tension
release-center-tension
```

## 6.3 King Safety Concepts

```txt
castle-before-center-opens
king-safety
give-check
checkmate
back-rank-safety
open-file-near-king
pawn-shield
```

## 6.4 Tactical Concepts

```txt
capture-free-piece
recapture
fork
pin
skewer
discovered-attack
double-attack
remove-defender
deflection
decoy
overload
clearance
zwischenzug
mating-net
greek-gift-pattern
```

## 6.5 Pawn Structure Concepts

```txt
capture-toward-center
create-open-file
create-semi-open-file
support-pawn-chain
pawn-break
isolated-pawn
doubled-pawn
passed-pawn
```

## 6.6 Piece Activity Concepts

```txt
improve-piece-activity
centralize-knight
activate-bishop
rook-open-file
rook-semi-open-file
queen-activity
reroute-piece
loose-piece
trapped-piece
```

## 6.7 Opening Plan Concepts

```txt
italian-bishop-pressure-f7
italian-c3-d4-plan
italian-re1-center-support
italian-castle-before-d4
italian-bb3-preserve-bishop
italian-nbd2-reroute
```

---

# 7. Concept Ranking System

Create:

```txt
lib/blundr/mapping/rankCoachableConcepts.ts
```

The ranker should score candidate concepts.

```ts
export type ConceptCandidate = {
  conceptId: string;
  family: ConceptFamily;
  evidence: EvidenceClaim[];
  confidence: number;
  instructionalPriority: number;
  userLevelFit: number;
  curriculumFit: number;
  visualFit: number;
  safetyRisk: number;
  totalScore: number;
  reasons: string[];
};
```

Scoring model:

```txt
totalScore =
  evidenceConfidence * 30
+ instructionalPriority * 25
+ curriculumFit * 20
+ visualFit * 10
+ userLevelFit * 10
- safetyRisk * 30
```

Priority order if scores tie:

```txt
1. Checkmate
2. Check
3. Tactic
4. Opening plan step
5. King safety
6. Center
7. Development
8. Pawn structure
9. Piece activity
10. Generic continuation
```

The ranker must explain why a concept won.

Debug fields:

```txt
conceptCandidatesTop5
selectedConceptId
selectedConceptFamily
selectedConceptScore
selectedConceptReasons
blockedConceptsTop10
blockedConceptReasons
```

---

# 8. Copy Builder Requirements

Create:

```txt
lib/blundr/explanation/conceptConditionedCopyBuilder.ts
```

Input:

```ts
{
  target: CurrentInstructionFrameTarget;
  selectedConcept: CoachableConcept;
  featureGraph: FeatureGraph;
  difficulty: DifficultyBand;
}
```

Output:

```ts
{
  title: string;
  body: string;
  conceptId: string;
  evidenceUsed: EvidenceClaim[];
  safetyLevel: "safe" | "fallback" | "blocked";
}
```

## 8.1 Difficulty-Specific Copy

Beginner:

```txt
short
plain language
why this move matters
avoid jargon
```

Intermediate:

```txt
include plan relationship
include tactical/strategic idea if supported
```

Advanced:

```txt
can mention tension, files, coordination, positional details if evidence supports
```

Example:

Move: `Bc4`

Beginner:

```txt
Bc4 develops your bishop to an active diagonal.
```

Intermediate:

```txt
Bc4 develops the bishop and points it toward f7, a sensitive square near Black’s king.
```

Advanced:

```txt
Bc4 places the bishop on the Italian diagonal, increasing pressure on f7 while supporting quick castling and central play.
```

Only use advanced copy if evidence supports the claims.

---

# 9. Visual Recipe Mapping

Create:

```txt
lib/blundr/visuals/conceptVisualRecipeMapper.ts
```

Each concept family maps to visuals.

## 9.1 Development Visuals

```txt
move arrow from source to destination
source square highlight
destination square highlight
optional activity glow on destination
```

## 9.2 Center Visuals

```txt
highlight center squares
arrow to central square
pawn break marker
support lines to center
```

## 9.3 King Safety Visuals

```txt
castle arrow
king safety aura
rook connection highlight
danger squares near king if supported
```

## 9.4 Tactical Visuals

```txt
attack arrow
target highlight
pin line
fork lines to two targets
check line to king
mate highlight
captured piece marker
```

## 9.5 Pawn Structure Visuals

```txt
pawn chain highlights
capture direction arrow
open file highlight
break square highlight
```

## 9.6 Opening Plan Visuals

```txt
primary move arrow
subtle plan marker
future plan ghost arrow only if Show More / Assisted and not Plain before help
```

Important: do not overload beginner users with too many visuals. Max default:

```txt
1 move arrow
2 square highlights
1 concept highlight
1 optional pressure line
```

---

# 10. Stage 2 Test Plan

Create tests across these areas.

## 10.1 Feature Tests

```txt
tests/features/detectMoveFacts.test.ts
tests/features/detectCenterFeatures.test.ts
tests/features/detectDevelopmentFeatures.test.ts
tests/features/detectKingSafetyFeatures.test.ts
tests/features/detectPieceActivityFeatures.test.ts
tests/features/detectPawnStructureFeatures.test.ts
tests/features/detectTacticalMotifs.test.ts
```

## 10.2 Mapping Tests

```txt
tests/mapping/featureToConceptMapping.test.ts
tests/mapping/rankCoachableConcepts.test.ts
tests/mapping/conceptEvidenceRequirements.test.ts
```

## 10.3 Curriculum Tests

```txt
tests/curriculum/openingModuleRegistry.test.ts
tests/curriculum/italianGamePlanRegistry.test.ts
tests/curriculum/curriculumMoveMetadata.test.ts
```

## 10.4 Coach Tests

```txt
tests/coach/conceptConditionedCopyBuilder.test.ts
tests/coach/conceptVisualRecipeMapper.test.ts
tests/coach/italianGameConceptMapping.test.ts
tests/coach/noUnsupportedConceptClaims.test.ts
tests/coach/beginnerIntermediateAdvancedCopy.test.ts
```

---

# 11. Required Italian Game Coverage

Stage 2 should use Italian Game as the first full flagship line.

Minimum concepts:

```txt
e4: occupy/challenge center
Nf3: develop knight, support center
Bc4: bishop pressure on f7
c3: prepare d4
d3: support center / quiet development
O-O: king safety
Re1: support central play
Bb3: preserve bishop diagonal
Nbd2: develop/reroute knight
d4: central break
exd5/cxd5: central capture
Bxh7+: check / Greek Gift candidate if metadata supports
Ng5+: check and kingside pressure
Qh5/Qh3/Qh7#: mating pattern if supported
```

For each, define:

```txt
conceptId
required evidence
allowed copy
visual recipe
beginner copy
intermediate copy
advanced copy
fallback copy
```

---

# 12. Codex Prompt for Stage 2

```md
You are implementing Blundr Stage 2: Opening Curriculum, Feature Detection, Concept Mapping, and Coaching Intelligence.

Base branch:
codespace-improved-succotash-p7rq4759qpg6f7pgp

Prerequisite checkpoint:
checkpoint/v2.8.0-coaching-stage-stable

Target checkpoint:
checkpoint/v2.9.0-curriculum-concept-mapping-stable

Do not alter:
- CurrentInstructionFrame target authority
- Maia runtime setup
- Stockfish worker setup
- branch complete flow
- continuation target promotion
- Stage 1 Plain/Assisted UI contracts

Non-negotiable invariant:
On every user-turn teaching frame:
instructionTargetUci === coachMoveUci === visualMoveUci === revealTargetUci
instructionTargetPieceType === coachPieceType

Goal:
Build the knowledge layer that maps board features and curriculum metadata to the best coachable concept.

Implement:

1. Curriculum types and registry:
- OpeningModule
- OpeningLine
- CurriculumMove
- OpeningPlan
- PlanStep
- Italian Game initial module

2. Feature graph:
- MoveFacts
- TacticalFeature
- StrategicFeature
- CenterFeature
- KingSafetyFeature
- PawnStructureFeature
- PieceActivityFeature
- OpeningPlanFeature
- EvidenceClaim

3. Feature detectors:
- detectMoveFacts
- detectCenterFeatures
- detectDevelopmentFeatures
- detectKingSafetyFeatures
- detectPieceActivityFeatures
- detectPawnStructureFeatures
- detectTacticalMotifs
- detectOpeningPlanFeatures

4. Concept registry:
Include concept families:
- development
- center
- king_safety
- tactics
- pawn_structure
- piece_activity
- opening_plan
- continuation
- end_condition

5. Feature-to-concept mapper:
Map detected evidence to CoachableConcept candidates.

6. Concept ranker:
Rank concepts using:
- evidence confidence
- curriculum fit
- instructional priority
- visual fit
- user level fit
- safety risk

7. Copy builder:
Generate beginner/intermediate/advanced safe copy.
Never render unsupported claims.
Preserve verified facts.

8. Visual recipe mapper:
Map selected concept to board visuals.
Respect Plain View no-leak rules.

9. Debug:
Expose:
- advancedFeaturePacketExists
- strategicPlanPacketExists
- selectedConceptId
- selectedConceptFamily
- selectedConceptScore
- selectedConceptReasons
- conceptCandidatesTop5
- blockedConceptsTop10
- evidenceClaims
- selectedPlanId
- selectedPlanStepId

10. Tests:
Create tests for feature detectors, mapping, curriculum registry, concept ranker, copy builder, and visual mapper.

Acceptance:
- Italian Game guided moves select meaningful concepts.
- No visible generic labels like Active Piece Development or Avoid Blocking Center Pawn.
- Unsupported center/tactic/king attack claims are blocked.
- Safe fallback remains available.
- CurrentInstructionFrame target invariant remains intact.
- Full build passes.
- Existing Stage 1 tests pass.

Validation:
npm run build

Run:
node --import tsx tests/features/detectMoveFacts.test.ts
node --import tsx tests/features/detectCenterFeatures.test.ts
node --import tsx tests/features/detectDevelopmentFeatures.test.ts
node --import tsx tests/features/detectKingSafetyFeatures.test.ts
node --import tsx tests/features/detectPieceActivityFeatures.test.ts
node --import tsx tests/features/detectPawnStructureFeatures.test.ts
node --import tsx tests/features/detectTacticalMotifs.test.ts
node --import tsx tests/mapping/featureToConceptMapping.test.ts
node --import tsx tests/mapping/rankCoachableConcepts.test.ts
node --import tsx tests/mapping/conceptEvidenceRequirements.test.ts
node --import tsx tests/curriculum/openingModuleRegistry.test.ts
node --import tsx tests/curriculum/italianGamePlanRegistry.test.ts
node --import tsx tests/curriculum/curriculumMoveMetadata.test.ts
node --import tsx tests/coach/conceptConditionedCopyBuilder.test.ts
node --import tsx tests/coach/conceptVisualRecipeMapper.test.ts
node --import tsx tests/coach/italianGameConceptMapping.test.ts
node --import tsx tests/coach/noUnsupportedConceptClaims.test.ts
node --import tsx tests/coach/beginnerIntermediateAdvancedCopy.test.ts

Then rerun all Stage 1 safety/continuation tests.

Commit:
git add lib/blundr tests
git commit -m "Add curriculum concept mapping and feature detection layer"
git push origin codespace-improved-succotash-p7rq4759qpg6f7pgp

Do not commit:
.runtime
.maia
.next
node_modules
zip/tgz review bundles
```

---

# 13. Recommended Agent Breakdown

Do not ask Codex to implement all of Stage 2 in one pass.

Break it into five agents:

```txt
Agent 2A: Curriculum registry + Italian Game metadata
Agent 2B: FeatureGraph + board/move feature detectors
Agent 2C: Concept registry + feature-to-concept mapper
Agent 2D: Concept ranker + copy builder
Agent 2E: Visual recipe mapper + debug + integration QA
```

---

# 14. Agent 2A: Curriculum Registry + Italian Game Metadata

## Scope

Agent 2A builds the static curriculum foundation.

It should create:

```txt
lib/blundr/curriculum/types.ts
lib/blundr/curriculum/openingRegistry.ts
lib/blundr/curriculum/italianGameModule.ts
lib/blundr/plans/openingPlanRegistry.ts
tests/curriculum/openingModuleRegistry.test.ts
tests/curriculum/italianGamePlanRegistry.test.ts
tests/curriculum/curriculumMoveMetadata.test.ts
```

## Acceptance

```txt
Italian Game module loads.
Italian Game has openingId italian-white.
Italian Game has at least one structured line.
Each user teaching move has concept IDs.
Each move has valid SAN/UCI.
Each plan step maps to expected moves.
No malformed metadata.
```

---

# 15. Agent 2B: FeatureGraph + Board/Move Feature Detectors

## Scope

Agent 2B builds deterministic feature extraction.

It should create:

```txt
lib/blundr/features/featureGraph.ts
lib/blundr/features/detectMoveFacts.ts
lib/blundr/features/detectCenterFeatures.ts
lib/blundr/features/detectDevelopmentFeatures.ts
lib/blundr/features/detectKingSafetyFeatures.ts
lib/blundr/features/detectPieceActivityFeatures.ts
lib/blundr/features/detectPawnStructureFeatures.ts
lib/blundr/features/detectTacticalMotifs.ts
lib/blundr/features/buildFeatureGraph.ts
```

## Acceptance

```txt
Move facts detected for all Italian Game teaching moves.
Center features detected for e4, d4, cxd5.
Development features detected for Nf3, Bc4, Bd3.
King safety detected for O-O.
Check/checkmate detected for Bxh7+, Ng5+, Qh7#.
Feature graph returns evidence claims.
Feature graph never throws on legal positions.
Feature graph returns safe empty arrays when no target.
```

---

# 16. Agent 2C: Concept Registry + Feature-to-Concept Mapper

## Scope

Agent 2C builds concept definitions and evidence mapping.

It should create:

```txt
lib/blundr/concepts/conceptRegistry.ts
lib/blundr/mapping/featureToConceptMapping.ts
lib/blundr/mapping/conceptEvidenceRequirements.ts
tests/mapping/featureToConceptMapping.test.ts
tests/mapping/conceptEvidenceRequirements.test.ts
```

## Acceptance

```txt
Each concept has required evidence.
Unsupported concepts are blocked.
Italian Game moves map to meaningful concepts.
Center tension requires evidence.
Greek Gift requires metadata/evidence.
Check/checkmate map reliably.
```

---

# 17. Agent 2D: Concept Ranker + Copy Builder

## Scope

Agent 2D selects the best concept and creates safe, level-aware copy.

It should create:

```txt
lib/blundr/mapping/rankCoachableConcepts.ts
lib/blundr/explanation/conceptConditionedCopyBuilder.ts
tests/mapping/rankCoachableConcepts.test.ts
tests/coach/conceptConditionedCopyBuilder.test.ts
tests/coach/noUnsupportedConceptClaims.test.ts
tests/coach/beginnerIntermediateAdvancedCopy.test.ts
```

## Acceptance

```txt
Checkmate outranks generic continuation.
Check outranks generic development.
Opening-plan metadata can outrank generic development.
Unsupported strong claims are blocked.
Beginner copy is plain.
Intermediate copy includes plan when supported.
Advanced copy uses richer language only with evidence.
```

---

# 18. Agent 2E: Visual Recipe Mapper + Debug + Integration QA

## Scope

Agent 2E integrates concepts into visible coach and visuals.

It should create/update:

```txt
lib/blundr/visuals/conceptVisualRecipeMapper.ts
lib/blundr/debug/trainerDebugSnapshot.ts
lib/blundr/presentation/visibleTeachingSurface.ts
tests/coach/conceptVisualRecipeMapper.test.ts
tests/coach/italianGameConceptMapping.test.ts
```

## Acceptance

```txt
selectedConceptId appears in debug on teaching frames.
selectedPlanId appears when plan metadata applies.
conceptCandidatesTop5 appears.
blockedConceptsTop10 appears.
Visual recipes match selected concept.
Plain View no-leak remains intact.
Assisted View renders concept visuals.
Stage 1 tests still pass.
```

---

# 19. Stage 2 Risk Register

## Risk 1: Overengineering the Feature System

Mitigation:

```txt
Implement deterministic detectors first.
Do not attempt perfect chess understanding.
Do not block rendering if advanced features are unavailable.
Use safe empty arrays.
```

## Risk 2: Hallucinated Coaching Claims

Mitigation:

```txt
Every user-facing claim must map to EvidenceClaim.
Unsupported claims become safe fallback.
Tier 2/Tier 3 claims require explicit evidence.
```

## Risk 3: Breaking Target Authority

Mitigation:

```txt
Feature mapping explains CurrentInstructionFrame.target only.
Add tests that concept target equals instruction target.
```

## Risk 4: Visual Overload

Mitigation:

```txt
Limit default visuals.
Use concept-specific priority.
Hide visuals in Plain before Show More.
```

## Risk 5: Debug Bloat

Mitigation:

```txt
Debug should show summary fields by default.
Detailed arrays can be collapsible or copy-only.
```

---

# 20. Final Stage 2 Acceptance Checklist

Before creating the Stage 2 checkpoint, confirm:

```txt
[ ] npm run build passes.
[ ] All new feature tests pass.
[ ] All new mapping tests pass.
[ ] All new curriculum tests pass.
[ ] All new coach/concept tests pass.
[ ] All Stage 1 tests still pass.
[ ] Italian Game e4 maps to center concept.
[ ] Nf3 maps to knight development/support center.
[ ] Bc4 maps to bishop pressure / active diagonal.
[ ] O-O maps to king safety.
[ ] c3 maps to prepare d4 if metadata applies.
[ ] d4 maps to central break/challenge center.
[ ] Bxh7+ maps to check/Greek Gift only if evidence exists.
[ ] Qh7# maps to checkmate.
[ ] No visible Active Piece Development.
[ ] No visible Avoid Blocking Center Pawn.
[ ] No unsupported center tension claim.
[ ] No unsupported tactic claim.
[ ] selectedConceptId appears on teaching frames.
[ ] selectedPlanId appears when plan metadata applies.
[ ] advancedFeaturePacketExists true on teaching frames.
[ ] strategicPlanPacketExists true when opening metadata applies.
[ ] Plain View remains leak-free.
[ ] Assisted View remains clean.
[ ] CurrentInstructionFrame target invariant remains intact.
[ ] criticalIssues: [].
[ ] warnings: [].
```

---

# 21. Final Checkpoint Commands

After all Stage 2 acceptance criteria pass:

```bash
git status --short

git checkout -b checkpoint/v2.9.0-curriculum-concept-mapping-stable
git push -u origin checkpoint/v2.9.0-curriculum-concept-mapping-stable

git tag v2.9.0-curriculum-concept-mapping-stable
git push origin v2.9.0-curriculum-concept-mapping-stable
```

This checkpoint means:

```txt
Blundr now has a structured curriculum and concept-mapping layer.
Italian Game has meaningful concept metadata.
Move facts and board features are extracted.
Concepts are evidence-gated.
Coach copy is concept-conditioned.
Visual recipes are concept-conditioned.
Debug explains concept selection.
Target authority remains stable.
Stage 1 UI/continuation safety remains intact.
```

---

# 22. Summary

Stage 2 is the foundation for Blundr’s actual coaching intelligence.

After Stage 2, Blundr should no longer merely say:

```txt
Play this move because it improves your position.
```

It should be able to say:

```txt
Play Bc4. This develops your bishop to an active diagonal and starts pressure on f7.
```

or:

```txt
Play c3. This supports the d4 break, which is one of White’s main plans in the Italian Game.
```

or:

```txt
Play Qh7#. This is checkmate.
```

with every claim backed by board evidence, curriculum metadata, or a safe fallback system.

Stage 2 is the bridge from stable trainer to real product-grade chess coach.
